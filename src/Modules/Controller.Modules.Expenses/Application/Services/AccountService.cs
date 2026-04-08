using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Controller.Modules.Expenses.Domain.Entities;
using Controller.SharedKernel.Application;

namespace Controller.Modules.Expenses.Application.Services;

public class AccountService : IAccountService
{
    private readonly IExpenseRepository _repository;

    public AccountService(IExpenseRepository repository) => _repository = repository;

    public async Task<List<AccountResponse>> ListAsync(Guid userId)
    {
        var accounts = await _repository.GetAccountsByUserAsync(userId);
        var result = new List<AccountResponse>();
        foreach (var a in accounts)
        {
            var receitas = await _repository.GetSumByAccountAsync(a.Id, "Receita");
            var despesas = await _repository.GetSumByAccountAsync(a.Id, "Despesa");
            var saldoAtual = a.SaldoInicial + receitas - despesas;
            result.Add(new AccountResponse(a.Id, a.Nome, a.Tipo, a.SaldoInicial, a.Cor, a.Ativo, saldoAtual, a.CreatedAt));
        }
        return result;
    }

    public async Task<Result<AccountResponse>> CreateAsync(CreateAccountRequest request, Guid userId)
    {
        var validation = Validate(request.Nome, request.Tipo);
        if (validation is not null) return Result.Failure<AccountResponse>(validation);

        var entity = Account.Create(request.Nome.Trim(), request.Tipo, request.SaldoInicial, string.IsNullOrWhiteSpace(request.Cor) ? "#10b981" : request.Cor, userId);
        await _repository.AddAccountAsync(entity);
        await _repository.SaveChangesAsync();
        return Result.Success(new AccountResponse(entity.Id, entity.Nome, entity.Tipo, entity.SaldoInicial, entity.Cor, entity.Ativo, entity.SaldoInicial, entity.CreatedAt));
    }

    public async Task<Result<AccountResponse>> UpdateAsync(Guid id, UpdateAccountRequest request, Guid userId)
    {
        var entity = await _repository.GetAccountByIdAndUserAsync(id, userId);
        if (entity is null) return Result.Failure<AccountResponse>("Conta não encontrada");
        var validation = Validate(request.Nome, request.Tipo);
        if (validation is not null) return Result.Failure<AccountResponse>(validation);

        entity.Update(request.Nome.Trim(), request.Tipo, request.SaldoInicial, string.IsNullOrWhiteSpace(request.Cor) ? entity.Cor : request.Cor);
        entity.SetAtivo(request.Ativo);
        await _repository.SaveChangesAsync();

        var receitas = await _repository.GetSumByAccountAsync(entity.Id, "Receita");
        var despesas = await _repository.GetSumByAccountAsync(entity.Id, "Despesa");
        var saldoAtual = entity.SaldoInicial + receitas - despesas;
        return Result.Success(new AccountResponse(entity.Id, entity.Nome, entity.Tipo, entity.SaldoInicial, entity.Cor, entity.Ativo, saldoAtual, entity.CreatedAt));
    }

    public async Task<Result> DeleteAsync(Guid id, Guid userId)
    {
        var entity = await _repository.GetAccountByIdAndUserAsync(id, userId);
        if (entity is null) return Result.Failure("Conta não encontrada");
        // Soft delete: marca inativa, mantém histórico
        entity.SetAtivo(false);
        await _repository.SaveChangesAsync();
        return Result.Success();
    }

    private static string? Validate(string nome, string tipo)
    {
        if (string.IsNullOrWhiteSpace(nome)) return "Nome é obrigatório";
        var allowed = new[] { "ContaCorrente", "Poupanca", "Cartao", "Dinheiro", "Investimento" };
        if (!allowed.Contains(tipo)) return "Tipo de conta inválido";
        return null;
    }
}
