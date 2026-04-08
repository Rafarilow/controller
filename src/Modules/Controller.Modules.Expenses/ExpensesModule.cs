using Controller.Modules.Expenses.Application.Interfaces;
using Controller.Modules.Expenses.Application.Services;
using Controller.Modules.Expenses.Infrastructure.Persistence;
using Controller.SharedKernel.Application;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Controller.Modules.Expenses;

public class ExpensesModule : IModuleInitializer
{
    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ExpensesDbContext>((sp, options) =>
        {
            var dataSource = sp.GetRequiredService<Npgsql.NpgsqlDataSource>();
            options.UseNpgsql(dataSource);
        });

        services.AddScoped<IExpenseRepository, ExpenseRepository>();
        services.AddScoped<IExpenseService, ExpenseService>();
        services.AddScoped<IRecurringService, RecurringService>();
        services.AddScoped<IBudgetService, BudgetService>();
        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<IGoalService, GoalService>();
        services.AddScoped<IReportsService, ReportsService>();
    }
}
