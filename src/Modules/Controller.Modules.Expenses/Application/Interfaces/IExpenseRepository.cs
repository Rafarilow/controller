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

    Task SaveChangesAsync(CancellationToken ct = default);
}
