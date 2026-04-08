using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Domain.Entities;

namespace Controller.Modules.Expenses.Application.Interfaces;

public interface IExpenseRepository
{
    Task<List<Expense>> GetByUserAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default);
    Task<Expense?> GetByIdAndUserAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task AddAsync(Expense expense, CancellationToken ct = default);
    void Remove(Expense expense);
    Task<decimal> GetTotalByUserAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default);
    Task<List<CategoryReport>> GetByCategoryAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default);
    Task<List<MonthReport>> GetByMonthAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default);

    // Receitas (Income)
    Task<List<Receita>> GetReceitasByUserAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default);
    Task<Receita?> GetReceitaByIdAndUserAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task AddReceitaAsync(Receita receita, CancellationToken ct = default);
    void RemoveReceita(Receita receita);
    Task<decimal> GetTotalReceitasByUserAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default);
    Task<List<MonthReport>> GetReceitasByMonthAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default);

    // Categories
    Task<List<UserCategory>> GetCategoriesByUserAsync(Guid userId, CancellationToken ct = default);
    Task AddCategoryAsync(UserCategory category, CancellationToken ct = default);
    Task<UserCategory?> GetCategoryByIdAndUserAsync(Guid id, Guid userId, CancellationToken ct = default);
    void RemoveCategory(UserCategory category);

    // Recurring Transactions
    Task<List<RecurringTransaction>> GetRecurringByUserAsync(Guid userId, bool? ativo = null, CancellationToken ct = default);
    Task<List<RecurringTransaction>> GetAllActiveRecurringAsync(CancellationToken ct = default);
    Task<RecurringTransaction?> GetRecurringByIdAndUserAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task AddRecurringAsync(RecurringTransaction recurring, CancellationToken ct = default);
    void RemoveRecurring(RecurringTransaction recurring);
    Task<HashSet<DateOnly>> GetExistingRecurringDatesAsync(Guid recurringId, string tipo, CancellationToken ct = default);

    // Budgets
    Task<List<Budget>> GetBudgetsByUserAsync(Guid userId, CancellationToken ct = default);
    Task<Budget?> GetBudgetByIdAndUserAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task AddBudgetAsync(Budget budget, CancellationToken ct = default);
    void RemoveBudget(Budget budget);

    // Accounts
    Task<List<Account>> GetAccountsByUserAsync(Guid userId, CancellationToken ct = default);
    Task<Account?> GetAccountByIdAndUserAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task AddAccountAsync(Account account, CancellationToken ct = default);
    void RemoveAccount(Account account);
    Task<decimal> GetSumByAccountAsync(Guid accountId, string tipo, CancellationToken ct = default);

    // Goals
    Task<List<Goal>> GetGoalsByUserAsync(Guid userId, CancellationToken ct = default);
    Task<Goal?> GetGoalByIdAndUserAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task AddGoalAsync(Goal goal, CancellationToken ct = default);
    void RemoveGoal(Goal goal);

    Task SaveChangesAsync(CancellationToken ct = default);
}
