using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Controller.Modules.Expenses.Domain.Entities;
using Controller.SharedKernel.Application;

namespace Controller.Modules.Expenses.Application.Services;

public class RecurringService : IRecurringService
{
    private readonly IExpenseRepository _repository;

    public RecurringService(IExpenseRepository repository) => _repository = repository;

    public async Task<List<RecurringResponse>> ListAsync(Guid userId, bool? ativo = null)
    {
        var items = await _repository.GetRecurringByUserAsync(userId, ativo);
        return items.Select(ToResponse).ToList();
    }

    public async Task<Result<RecurringResponse>> CreateAsync(CreateRecurringRequest request, Guid userId)
    {
        var validation = Validate(request.Tipo, request.Descricao, request.Categoria, request.Valor, request.Frequencia, request.DiaCobranca);
        if (validation is not null) return Result.Failure<RecurringResponse>(validation);

        var entity = RecurringTransaction.Create(
            request.Tipo,
            request.Descricao.Trim(),
            request.Categoria.Trim(),
            request.Valor,
            request.Frequencia,
            request.DiaCobranca,
            request.DataInicio,
            request.DataFim,
            userId,
            request.TipoReceita
        );

        await _repository.AddRecurringAsync(entity);
        await _repository.SaveChangesAsync();

        // Materializa imediatamente as ocorrências passadas/atuais
        await MaterializeOneAsync(entity, DateOnly.FromDateTime(DateTime.UtcNow));
        await _repository.SaveChangesAsync();

        return Result.Success(ToResponse(entity));
    }

    public async Task<Result<RecurringResponse>> UpdateAsync(Guid id, UpdateRecurringRequest request, Guid userId)
    {
        var entity = await _repository.GetRecurringByIdAndUserAsync(id, userId);
        if (entity is null) return Result.Failure<RecurringResponse>("Lançamento recorrente não encontrado");

        var validation = Validate(entity.Tipo, request.Descricao, request.Categoria, request.Valor, request.Frequencia, request.DiaCobranca);
        if (validation is not null) return Result.Failure<RecurringResponse>(validation);

        entity.Update(
            request.Descricao.Trim(),
            request.Categoria.Trim(),
            request.Valor,
            request.Frequencia,
            request.DiaCobranca,
            request.DataFim,
            request.TipoReceita
        );
        entity.SetAtivo(request.Ativo);

        await _repository.SaveChangesAsync();
        return Result.Success(ToResponse(entity));
    }

    public async Task<Result> DeleteAsync(Guid id, Guid userId)
    {
        var entity = await _repository.GetRecurringByIdAndUserAsync(id, userId);
        if (entity is null) return Result.Failure("Lançamento recorrente não encontrado");

        // Soft delete: desativa em vez de remover, pra preservar vínculo histórico das ocorrências
        entity.SetAtivo(false);
        await _repository.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result<RecurringRunResult>> RunAsync(Guid id, Guid userId)
    {
        var entity = await _repository.GetRecurringByIdAndUserAsync(id, userId);
        if (entity is null) return Result.Failure<RecurringRunResult>("Lançamento recorrente não encontrado");

        var created = await MaterializeOneAsync(entity, DateOnly.FromDateTime(DateTime.UtcNow));
        await _repository.SaveChangesAsync();
        return Result.Success(new RecurringRunResult(created));
    }

    public async Task<int> MaterializeAllAsync(DateOnly upTo)
    {
        var actives = await _repository.GetAllActiveRecurringAsync();
        int total = 0;
        foreach (var r in actives)
        {
            total += await MaterializeOneAsync(r, upTo);
        }
        if (total > 0) await _repository.SaveChangesAsync();
        return total;
    }

    private async Task<int> MaterializeOneAsync(RecurringTransaction r, DateOnly upTo)
    {
        var from = r.UltimaGeracao?.AddDays(1) ?? r.DataInicio;
        if (from > upTo) return 0;

        var existing = await _repository.GetExistingRecurringDatesAsync(r.Id, r.Tipo);
        int created = 0;

        foreach (var occurrence in r.EnumerateOccurrences(from, upTo))
        {
            if (existing.Contains(occurrence)) continue;

            if (r.Tipo == "Despesa")
            {
                var expense = Expense.Create(occurrence, r.Descricao, r.Categoria, r.Valor, r.UsuarioId, r.Id);
                await _repository.AddAsync(expense);
            }
            else
            {
                var receita = Receita.Create(occurrence, r.Descricao, r.Categoria, r.Valor, r.TipoReceita ?? "Fixa", r.UsuarioId, r.Id);
                await _repository.AddReceitaAsync(receita);
            }
            created++;
        }

        r.MarkGenerated(upTo);
        return created;
    }

    private static string? Validate(string tipo, string descricao, string categoria, decimal valor, string frequencia, int diaCobranca)
    {
        if (tipo != "Despesa" && tipo != "Receita")
            return "Tipo deve ser 'Despesa' ou 'Receita'";
        if (string.IsNullOrWhiteSpace(descricao))
            return "Descrição é obrigatória";
        if (string.IsNullOrWhiteSpace(categoria))
            return "Categoria é obrigatória";
        if (valor <= 0)
            return "Valor deve ser maior que zero";
        if (frequencia != "Mensal" && frequencia != "Semanal" && frequencia != "Anual")
            return "Frequência deve ser 'Mensal', 'Semanal' ou 'Anual'";
        if (frequencia == "Mensal" && (diaCobranca < 1 || diaCobranca > 31))
            return "Dia de cobrança mensal deve estar entre 1 e 31";
        if (frequencia == "Semanal" && (diaCobranca < 0 || diaCobranca > 6))
            return "Dia da semana deve estar entre 0 (Domingo) e 6 (Sábado)";
        if (frequencia == "Anual" && (diaCobranca < 1 || diaCobranca > 31))
            return "Dia anual deve estar entre 1 e 31";
        return null;
    }

    private static RecurringResponse ToResponse(RecurringTransaction r) => new(
        r.Id, r.Tipo, r.Descricao, r.Categoria, r.Valor, r.Frequencia, r.DiaCobranca,
        r.DataInicio, r.DataFim, r.Ativo, r.UltimaGeracao, r.TipoReceita, r.CreatedAt
    );
}
