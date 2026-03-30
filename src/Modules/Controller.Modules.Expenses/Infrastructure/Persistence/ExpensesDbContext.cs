using Controller.Modules.Expenses.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Controller.Modules.Expenses.Infrastructure.Persistence;

public class ExpensesDbContext : DbContext
{
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Receita> Receitas => Set<Receita>();
    public DbSet<UserCategory> UserCategories => Set<UserCategory>();

    public ExpensesDbContext(DbContextOptions<ExpensesDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ExpensesDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
