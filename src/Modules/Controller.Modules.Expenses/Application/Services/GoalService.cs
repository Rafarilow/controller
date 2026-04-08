using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Controller.Modules.Expenses.Domain.Entities;
using Controller.SharedKernel.Application;

namespace Controller.Modules.Expenses.Application.Services;

public class GoalService : IGoalService
{
    private readonly IExpenseRepository _repository;

    public GoalService(IExpenseRepository repository) => _repository = repository;

    public async Task<List<GoalResponse>> ListAsync(Guid userId)
    {
        var goals = await _repository.GetGoalsByUserAsync(userId);
        return goals.Select(ToResponse).ToList();
    }

    public async Task<Result<GoalResponse>> CreateAsync(CreateGoalRequest request, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(request.Nome)) return Result.Failure<GoalResponse>("Nome é obrigatório");
        if (request.ValorAlvo <= 0) return Result.Failure<GoalResponse>("Valor alvo deve ser maior que zero");

        var entity = Goal.Create(
            request.Nome.Trim(),
            request.ValorAlvo,
            request.DataAlvo,
            string.IsNullOrWhiteSpace(request.Cor) ? "#10b981" : request.Cor,
            request.Descricao,
            userId);

        await _repository.AddGoalAsync(entity);
        await _repository.SaveChangesAsync();
        return Result.Success(ToResponse(entity));
    }

    public async Task<Result<GoalResponse>> UpdateAsync(Guid id, UpdateGoalRequest request, Guid userId)
    {
        var entity = await _repository.GetGoalByIdAndUserAsync(id, userId);
        if (entity is null) return Result.Failure<GoalResponse>("Meta não encontrada");
        if (string.IsNullOrWhiteSpace(request.Nome)) return Result.Failure<GoalResponse>("Nome é obrigatório");
        if (request.ValorAlvo <= 0) return Result.Failure<GoalResponse>("Valor alvo deve ser maior que zero");

        entity.Update(request.Nome.Trim(), request.ValorAlvo, request.DataAlvo, string.IsNullOrWhiteSpace(request.Cor) ? entity.Cor : request.Cor, request.Descricao);
        await _repository.SaveChangesAsync();
        return Result.Success(ToResponse(entity));
    }

    public async Task<Result<GoalResponse>> ContribuirAsync(Guid id, ContribuirGoalRequest request, Guid userId)
    {
        var entity = await _repository.GetGoalByIdAndUserAsync(id, userId);
        if (entity is null) return Result.Failure<GoalResponse>("Meta não encontrada");
        if (request.Valor == 0) return Result.Failure<GoalResponse>("Valor da contribuição é obrigatório");

        entity.Contribuir(request.Valor);
        await _repository.SaveChangesAsync();
        return Result.Success(ToResponse(entity));
    }

    public async Task<Result> DeleteAsync(Guid id, Guid userId)
    {
        var entity = await _repository.GetGoalByIdAndUserAsync(id, userId);
        if (entity is null) return Result.Failure("Meta não encontrada");
        _repository.RemoveGoal(entity);
        await _repository.SaveChangesAsync();
        return Result.Success();
    }

    private static GoalResponse ToResponse(Goal g)
    {
        var pct = g.ValorAlvo > 0 ? Math.Round(g.ValorAtual / g.ValorAlvo * 100, 2) : 0;
        return new GoalResponse(g.Id, g.Nome, g.ValorAlvo, g.ValorAtual, g.DataAlvo, g.Cor, g.Descricao, pct, g.CreatedAt);
    }
}
