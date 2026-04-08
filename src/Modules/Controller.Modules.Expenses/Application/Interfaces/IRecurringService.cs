using Controller.Modules.Expenses.Application.DTOs;
using Controller.SharedKernel.Application;

namespace Controller.Modules.Expenses.Application.Interfaces;

public interface IRecurringService
{
    Task<List<RecurringResponse>> ListAsync(Guid userId, bool? ativo = null);
    Task<Result<RecurringResponse>> CreateAsync(CreateRecurringRequest request, Guid userId);
    Task<Result<RecurringResponse>> UpdateAsync(Guid id, UpdateRecurringRequest request, Guid userId);
    Task<Result> DeleteAsync(Guid id, Guid userId);
    Task<Result<RecurringRunResult>> RunAsync(Guid id, Guid userId);
    Task<int> MaterializeAllAsync(DateOnly upTo);
}
