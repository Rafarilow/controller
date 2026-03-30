using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Controller.Modules.Expenses.Domain.Entities;
using Controller.SharedKernel.Application;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Controller.Modules.Expenses.Application.Services;

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _repository;

    public ExpenseService(IExpenseRepository repository) => _repository = repository;

    public async Task<List<ExpenseResponse>> ListAsync(Guid userId, DateOnly? from = null, DateOnly? to = null)
    {
        var expenses = await _repository.GetByUserAsync(userId, from, to);
        return expenses.Select(e => new ExpenseResponse(e.Id, e.Data, e.Descricao, e.Categoria, e.Valor, e.CreatedAt)).ToList();
    }

    public async Task<Result<ExpenseResponse>> CreateAsync(CreateExpenseRequest request, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(request.Descricao))
            return Result.Failure<ExpenseResponse>("Descrição é obrigatória");

        var expense = Expense.Create(request.Data, request.Descricao, request.Categoria, request.Valor, userId);
        await _repository.AddAsync(expense);
        await _repository.SaveChangesAsync();

        return Result.Success(new ExpenseResponse(expense.Id, expense.Data, expense.Descricao, expense.Categoria, expense.Valor, expense.CreatedAt));
    }

    public async Task<Result<ExpenseResponse>> UpdateAsync(Guid id, UpdateExpenseRequest request, Guid userId)
    {
        var expense = await _repository.GetByIdAndUserAsync(id, userId);
        if (expense is null)
            return Result.Failure<ExpenseResponse>("Despesa não encontrada");

        expense.Update(request.Data, request.Descricao, request.Categoria, request.Valor);
        await _repository.SaveChangesAsync();

        return Result.Success(new ExpenseResponse(expense.Id, expense.Data, expense.Descricao, expense.Categoria, expense.Valor, expense.CreatedAt));
    }

    public async Task<Result> DeleteAsync(Guid id, Guid userId)
    {
        var expense = await _repository.GetByIdAndUserAsync(id, userId);
        if (expense is null)
            return Result.Failure("Despesa não encontrada");

        _repository.Remove(expense);
        await _repository.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<ReportResponse> GetReportAsync(Guid userId, DateOnly? from = null, DateOnly? to = null)
    {
        var byCategory = await _repository.GetByCategoryAsync(userId, from, to);
        var byMonth = await _repository.GetByMonthAsync(userId, from, to);
        var total = await _repository.GetTotalByUserAsync(userId, from, to);
        var average = byCategory.Count > 0 ? total / byCategory.Count : 0;

        var totalReceitas = await _repository.GetTotalReceitasByUserAsync(userId, from, to);
        var receitasByMonth = await _repository.GetReceitasByMonthAsync(userId, from, to);
        var saldo = totalReceitas - total;

        return new ReportResponse(byCategory.ToArray(), byMonth.ToArray(), total, average, totalReceitas, saldo, receitasByMonth.ToArray());
    }

    public async Task<byte[]> GeneratePdfAsync(Guid userId, string userName, DateOnly? from = null, DateOnly? to = null)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var expenses = await _repository.GetByUserAsync(userId, from, to);
        var total = expenses.Sum(e => e.Valor);
        var byCategory = expenses.GroupBy(e => e.Categoria).Select(g => new { Cat = g.Key, Total = g.Sum(e => e.Valor) }).ToList();
        var average = byCategory.Count > 0 ? total / byCategory.Count : 0;
        var biggest = byCategory.OrderByDescending(c => c.Total).FirstOrDefault()?.Cat ?? "Nenhuma";
        var totalReceitas = await _repository.GetTotalReceitasByUserAsync(userId, from, to);
        var saldo = totalReceitas - total;

        string Fmt(decimal v) => v.ToString("N2", new System.Globalization.CultureInfo("pt-BR"));

        var pdf = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Column(col =>
                {
                    col.Item().AlignCenter().Text("Controller").Bold().FontSize(20).FontColor("#1a3c6e");
                    col.Item().AlignCenter().Text("Relatório de Despesas Mensal").FontSize(14);
                    col.Item().PaddingTop(8).Text($"Usuário: {userName} | Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(9).FontColor("#6b7280");
                });

                page.Content().PaddingTop(20).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); });
                        table.Cell().Background("#1a3c6e").Padding(8).Text("Total Gasto").FontColor("#ffffff").Bold();
                        table.Cell().Background("#f1f5f9").Padding(8).AlignCenter().Text($"R$ {Fmt(total)}");
                        table.Cell().Background("#1a3c6e").Padding(8).Text("Total Receitas").FontColor("#ffffff").Bold();
                        table.Cell().Background("#f1f5f9").Padding(8).AlignCenter().Text($"R$ {Fmt(totalReceitas)}");
                        table.Cell().Background("#1a3c6e").Padding(8).Text("Saldo").FontColor("#ffffff").Bold();
                        table.Cell().Background(saldo >= 0 ? "#d1fae5" : "#fee2e2").Padding(8).AlignCenter().Text($"R$ {Fmt(saldo)}");
                        table.Cell().Background("#1a3c6e").Padding(8).Text("Média por Categoria").FontColor("#ffffff").Bold();
                        table.Cell().Background("#f1f5f9").Padding(8).AlignCenter().Text($"R$ {Fmt(average)}");
                        table.Cell().Background("#1a3c6e").Padding(8).Text("Maior Categoria").FontColor("#ffffff").Bold();
                        table.Cell().Background("#f1f5f9").Padding(8).AlignCenter().Text(biggest);
                        table.Cell().Background("#1a3c6e").Padding(8).Text("Período").FontColor("#ffffff").Bold();
                        table.Cell().Background("#f1f5f9").Padding(8).AlignCenter().Text(DateTime.Now.ToString("MMMM yyyy", new System.Globalization.CultureInfo("pt-BR")));
                    });

                    col.Item().PaddingTop(20).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(80);
                            c.RelativeColumn();
                            c.ConstantColumn(100);
                            c.ConstantColumn(100);
                        });

                        table.Header(h =>
                        {
                            h.Cell().Background("#374151").Padding(8).Text("Data").FontColor("#ffffff").Bold();
                            h.Cell().Background("#374151").Padding(8).Text("Descrição").FontColor("#ffffff").Bold();
                            h.Cell().Background("#374151").Padding(8).Text("Categoria").FontColor("#ffffff").Bold();
                            h.Cell().Background("#374151").Padding(8).Text("Valor (R$)").FontColor("#ffffff").Bold();
                        });

                        foreach (var e in expenses)
                        {
                            table.Cell().BorderBottom(1).BorderColor("#e5e7eb").Padding(6).Text(e.Data.ToString("yyyy-MM-dd"));
                            table.Cell().BorderBottom(1).BorderColor("#e5e7eb").Padding(6).Text(e.Descricao);
                            table.Cell().BorderBottom(1).BorderColor("#e5e7eb").Padding(6).Text(e.Categoria);
                            table.Cell().BorderBottom(1).BorderColor("#e5e7eb").Padding(6).AlignRight().Text(Fmt(e.Valor));
                        }

                        table.Cell().Background("#e5e7eb").Padding(8).Text("");
                        table.Cell().Background("#e5e7eb").Padding(8).Text("");
                        table.Cell().Background("#e5e7eb").Padding(8).Text("Total Geral").Bold();
                        table.Cell().Background("#e5e7eb").Padding(8).AlignRight().Text($"R$ {Fmt(total)}").Bold();
                    });
                });
            });
        });

        return pdf.GeneratePdf();
    }

    // Receitas
    public async Task<List<ReceitaResponse>> ListReceitasAsync(Guid userId, DateOnly? from = null, DateOnly? to = null)
    {
        var receitas = await _repository.GetReceitasByUserAsync(userId, from, to);
        return receitas.Select(r => new ReceitaResponse(r.Id, r.Data, r.Descricao, r.Categoria, r.Valor, r.Tipo, r.CreatedAt)).ToList();
    }

    public async Task<Result<ReceitaResponse>> CreateReceitaAsync(CreateReceitaRequest request, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(request.Descricao))
            return Result.Failure<ReceitaResponse>("Descrição é obrigatória");

        var receita = Receita.Create(request.Data, request.Descricao, request.Categoria, request.Valor, request.Tipo, userId);
        await _repository.AddReceitaAsync(receita);
        await _repository.SaveChangesAsync();

        return Result.Success(new ReceitaResponse(receita.Id, receita.Data, receita.Descricao, receita.Categoria, receita.Valor, receita.Tipo, receita.CreatedAt));
    }

    public async Task<Result<ReceitaResponse>> UpdateReceitaAsync(Guid id, UpdateReceitaRequest request, Guid userId)
    {
        var receita = await _repository.GetReceitaByIdAndUserAsync(id, userId);
        if (receita is null)
            return Result.Failure<ReceitaResponse>("Receita não encontrada");

        receita.Update(request.Data, request.Descricao, request.Categoria, request.Valor, request.Tipo);
        await _repository.SaveChangesAsync();

        return Result.Success(new ReceitaResponse(receita.Id, receita.Data, receita.Descricao, receita.Categoria, receita.Valor, receita.Tipo, receita.CreatedAt));
    }

    public async Task<Result> DeleteReceitaAsync(Guid id, Guid userId)
    {
        var receita = await _repository.GetReceitaByIdAndUserAsync(id, userId);
        if (receita is null)
            return Result.Failure("Receita não encontrada");

        _repository.RemoveReceita(receita);
        await _repository.SaveChangesAsync();
        return Result.Success();
    }

    // Categories
    public async Task<List<CategoryResponse>> ListCategoriesAsync(Guid userId)
    {
        var cats = await _repository.GetCategoriesByUserAsync(userId);
        return cats.Select(c => new CategoryResponse(c.Id, c.Nome)).ToList();
    }

    public async Task<Result<CategoryResponse>> CreateCategoryAsync(CreateCategoryRequest request, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
            return Result.Failure<CategoryResponse>("Nome é obrigatório");

        var category = UserCategory.Create(request.Nome.Trim(), userId);
        await _repository.AddCategoryAsync(category);
        await _repository.SaveChangesAsync();

        return Result.Success(new CategoryResponse(category.Id, category.Nome));
    }

    public async Task<Result> DeleteCategoryAsync(Guid id, Guid userId)
    {
        var category = await _repository.GetCategoryByIdAndUserAsync(id, userId);
        if (category is null)
            return Result.Failure("Categoria não encontrada");

        _repository.RemoveCategory(category);
        await _repository.SaveChangesAsync();
        return Result.Success();
    }
}
