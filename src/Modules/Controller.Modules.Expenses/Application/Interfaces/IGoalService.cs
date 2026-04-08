using Controller.Modules.Expenses.Application.DTOs;
using Controller.SharedKernel.Application;

namespace Controller.Modules.Expenses.Application.Interfaces;

public interface IGoalService
{
    Task<List<GoalResponse>> ListAsync(Guid userId);
    Task<Result<GoalResponse>> CreateAsync(CreateGoalRequest request, Guid userId);
    Task<Result<GoalResponse>> UpdateAsync(Guid id, UpdateGoalRequest request, Guid userId);
    Task<Result<GoalResponse>> ContribuirAsync(Guid id, ContribuirGoalRequest request, Guid userId);
    Task<Result> DeleteAsync(Guid id, Guid userId);
}
