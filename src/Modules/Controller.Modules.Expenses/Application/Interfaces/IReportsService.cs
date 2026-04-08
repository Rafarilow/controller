using Controller.Modules.Expenses.Application.DTOs;

namespace Controller.Modules.Expenses.Application.Interfaces;

public interface IReportsService
{
    Task<CashflowResponse> GetCashflowAsync(Guid userId, int months = 12);
    Task<ProjectionResponse> GetProjectionAsync(Guid userId);
    Task<CategoryTrendResponse> GetCategoryTrendAsync(Guid userId, string categoria, int months = 6);
    Task<CalendarResponse> GetCalendarAsync(Guid userId, int year, int month);
}
