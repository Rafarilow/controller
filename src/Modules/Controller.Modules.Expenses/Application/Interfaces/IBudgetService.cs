using Controller.Modules.Expenses.Application.DTOs;
using Controller.SharedKernel.Application;

namespace Controller.Modules.Expenses.Application.Interfaces;

public interface IBudgetService
{
    Task<List<BudgetResponse>> ListAsync(Guid userId);
    Task<List<BudgetStatusItem>> GetStatusAsync(Guid userId);
    Task<Result<BudgetResponse>> CreateAsync(CreateBudgetRequest request, Guid userId);
    Task<Result<BudgetResponse>> UpdateAsync(Guid id, UpdateBudgetRequest request, Guid userId);
    Task<Result> DeleteAsync(Guid id, Guid userId);
}
