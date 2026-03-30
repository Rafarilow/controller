using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Controller.Modules.Expenses.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Controller.Modules.Expenses.Infrastructure.Persistence;

public class ExpenseRepository : IExpenseRepository
{
    private readonly ExpensesDbContext _context;

    public ExpenseRepository(ExpensesDbContext context) => _context = context;

    private IQueryable<Expense> Filtered(Guid userId, DateOnly? from, DateOnly? to)
    {
        var q = _context.Expenses.Where(e => e.UsuarioId == userId);
        if (from.HasValue) q = q.Where(e => e.Data >= from.Value);
        if (to.HasValue) q = q.Where(e => e.Data <= to.Value);
        return q;
    }

    private IQueryable<Receita> FilteredReceitas(Guid userId, DateOnly? from, DateOnly? to)
    {
        var q = _context.Receitas.Where(r => r.UsuarioId == userId);
        if (from.HasValue) q = q.Where(r => r.Data >= from.Value);
        if (to.HasValue) q = q.Where(r => r.Data <= to.Value);
        return q;
    }

    // Expenses
    public async Task<List<Expense>> GetByUserAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default)
        => await Filtered(userId, from, to).OrderByDescending(e => e.Data).ToListAsync(ct);

    public async Task<Expense?> GetByIdAndUserAsync(Guid id, Guid userId, CancellationToken ct = default)
        => await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UsuarioId == userId, ct);

    public async Task AddAsync(Expense expense, CancellationToken ct = default)
        => await _context.Expenses.AddAsync(expense, ct);

    public void Remove(Expense expense)
        => _context.Expenses.Remove(expense);

    public async Task<decimal> GetTotalByUserAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default)
        => await Filtered(userId, from, to).SumAsync(e => e.Valor, ct);

    public async Task<List<CategoryReport>> GetByCategoryAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default)
        => await Filtered(userId, from, to)
            .GroupBy(e => e.Categoria)
            .Select(g => new CategoryReport(g.Key, g.Sum(e => e.Valor)))
            .ToListAsync(ct);

    public async Task<List<MonthReport>> GetByMonthAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default)
        => await Filtered(userId, from, to)
            .GroupBy(e => new { e.Data.Year, e.Data.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new MonthReport($"{g.Key.Year}-{g.Key.Month:D2}", g.Sum(e => e.Valor)))
            .ToListAsync(ct);

    // Receitas
    public async Task<List<Receita>> GetReceitasByUserAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default)
        => await FilteredReceitas(userId, from, to).OrderByDescending(r => r.Data).ToListAsync(ct);

    public async Task<Receita?> GetReceitaByIdAndUserAsync(Guid id, Guid userId, CancellationToken ct = default)
        => await _context.Receitas.FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == userId, ct);

    public async Task AddReceitaAsync(Receita receita, CancellationToken ct = default)
        => await _context.Receitas.AddAsync(receita, ct);

    public void RemoveReceita(Receita receita)
        => _context.Receitas.Remove(receita);

    public async Task<decimal> GetTotalReceitasByUserAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default)
        => await FilteredReceitas(userId, from, to).SumAsync(r => r.Valor, ct);

    public async Task<List<MonthReport>> GetReceitasByMonthAsync(Guid userId, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default)
        => await FilteredReceitas(userId, from, to)
            .GroupBy(r => new { r.Data.Year, r.Data.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new MonthReport($"{g.Key.Year}-{g.Key.Month:D2}", g.Sum(r => r.Valor)))
            .ToListAsync(ct);

    // Categories
    public async Task<List<UserCategory>> GetCategoriesByUserAsync(Guid userId, CancellationToken ct = default)
        => await _context.UserCategories.Where(c => c.UsuarioId == userId).OrderBy(c => c.Nome).ToListAsync(ct);

    public async Task AddCategoryAsync(UserCategory category, CancellationToken ct = default)
        => await _context.UserCategories.AddAsync(category, ct);

    public async Task<UserCategory?> GetCategoryByIdAndUserAsync(Guid id, Guid userId, CancellationToken ct = default)
        => await _context.UserCategories.FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == userId, ct);

    public void RemoveCategory(UserCategory category)
        => _context.UserCategories.Remove(category);

    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await _context.SaveChangesAsync(ct);
}
