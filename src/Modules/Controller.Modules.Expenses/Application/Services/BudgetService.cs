using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Controller.Modules.Expenses.Domain.Entities;
using Controller.SharedKernel.Application;

namespace Controller.Modules.Expenses.Application.Services;

public class BudgetService : IBudgetService
{
    private readonly IExpenseRepository _repository;

    public BudgetService(IExpenseRepository repository) => _repository = repository;

    public async Task<List<BudgetResponse>> ListAsync(Guid userId)
    {
        var budgets = await _repository.GetBudgetsByUserAsync(userId);
        var (from, to) = CurrentMonthRange();
        var byCategory = await _repository.GetByCategoryAsync(userId, from, to);
        var spendByCat = byCategory.ToDictionary(c => c.Categoria, c => c.Total, StringComparer.OrdinalIgnoreCase);

        return budgets.Select(b =>
        {
            var gasto = spendByCat.GetValueOrDefault(b.Categoria, 0m);
            var pct = b.ValorLimite > 0 ? Math.Round(gasto / b.ValorLimite * 100, 2) : 0;
            var status = pct >= 100 ? "estourado" : pct >= 70 ? "alerta" : "ok";
            return new BudgetResponse(b.Id, b.Categoria, b.ValorLimite, b.Periodo, gasto, pct, status, b.CreatedAt);
        }).ToList();
    }

    public async Task<List<BudgetStatusItem>> GetStatusAsync(Guid userId)
    {
        var list = await ListAsync(userId);
        return list.Select(b => new BudgetStatusItem(b.Categoria, b.ValorLimite, b.GastoAtual, b.Percentual, b.Status))
                   .OrderByDescending(b => b.Percentual)
                   .ToList();
    }

    public async Task<Result<BudgetResponse>> CreateAsync(CreateBudgetRequest request, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(request.Categoria)) return Result.Failure<BudgetResponse>("Categoria é obrigatória");
        if (request.ValorLimite <= 0) return Result.Failure<BudgetResponse>("Valor limite deve ser maior que zero");

        var entity = Budget.Create(request.Categoria.Trim(), request.ValorLimite, string.IsNullOrWhiteSpace(request.Periodo) ? "Mensal" : request.Periodo, userId);
        await _repository.AddBudgetAsync(entity);
        await _repository.SaveChangesAsync();

        var (from, to) = CurrentMonthRange();
        var gasto = (await _repository.GetByCategoryAsync(userId, from, to)).FirstOrDefault(c => string.Equals(c.Categoria, entity.Categoria, StringComparison.OrdinalIgnoreCase))?.Total ?? 0;
        var pct = entity.ValorLimite > 0 ? Math.Round(gasto / entity.ValorLimite * 100, 2) : 0;
        var status = pct >= 100 ? "estourado" : pct >= 70 ? "alerta" : "ok";
        return Result.Success(new BudgetResponse(entity.Id, entity.Categoria, entity.ValorLimite, entity.Periodo, gasto, pct, status, entity.CreatedAt));
    }

    public async Task<Result<BudgetResponse>> UpdateAsync(Guid id, UpdateBudgetRequest request, Guid userId)
    {
        var entity = await _repository.GetBudgetByIdAndUserAsync(id, userId);
        if (entity is null) return Result.Failure<BudgetResponse>("Orçamento não encontrado");
        if (string.IsNullOrWhiteSpace(request.Categoria)) return Result.Failure<BudgetResponse>("Categoria é obrigatória");
        if (request.ValorLimite <= 0) return Result.Failure<BudgetResponse>("Valor limite deve ser maior que zero");

        entity.Update(request.Categoria.Trim(), request.ValorLimite, request.Periodo);
        await _repository.SaveChangesAsync();

        var (from, to) = CurrentMonthRange();
        var gasto = (await _repository.GetByCategoryAsync(userId, from, to)).FirstOrDefault(c => string.Equals(c.Categoria, entity.Categoria, StringComparison.OrdinalIgnoreCase))?.Total ?? 0;
        var pct = entity.ValorLimite > 0 ? Math.Round(gasto / entity.ValorLimite * 100, 2) : 0;
        var status = pct >= 100 ? "estourado" : pct >= 70 ? "alerta" : "ok";
        return Result.Success(new BudgetResponse(entity.Id, entity.Categoria, entity.ValorLimite, entity.Periodo, gasto, pct, status, entity.CreatedAt));
    }

    public async Task<Result> DeleteAsync(Guid id, Guid userId)
    {
        var entity = await _repository.GetBudgetByIdAndUserAsync(id, userId);
        if (entity is null) return Result.Failure("Orçamento não encontrado");
        _repository.RemoveBudget(entity);
        await _repository.SaveChangesAsync();
        return Result.Success();
    }

    private static (DateOnly from, DateOnly to) CurrentMonthRange()
    {
        var now = DateTime.UtcNow;
        var first = new DateOnly(now.Year, now.Month, 1);
        var last = first.AddMonths(1).AddDays(-1);
        return (first, last);
    }
}
