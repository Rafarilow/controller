using Controller.Modules.Expenses.Application.DTOs;
using Controller.SharedKernel.Application;

namespace Controller.Modules.Expenses.Application.Interfaces;

public interface IAccountService
{
    Task<List<AccountResponse>> ListAsync(Guid userId);
    Task<Result<AccountResponse>> CreateAsync(CreateAccountRequest request, Guid userId);
    Task<Result<AccountResponse>> UpdateAsync(Guid id, UpdateAccountRequest request, Guid userId);
    Task<Result> DeleteAsync(Guid id, Guid userId);
}
