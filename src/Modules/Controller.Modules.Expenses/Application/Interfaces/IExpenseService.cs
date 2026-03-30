using Controller.Modules.Expenses.Application.DTOs;
using Controller.SharedKernel.Application;

namespace Controller.Modules.Expenses.Application.Interfaces;

public interface IExpenseService
{
    Task<List<ExpenseResponse>> ListAsync(Guid userId, DateOnly? from = null, DateOnly? to = null);
    Task<Result<ExpenseResponse>> CreateAsync(CreateExpenseRequest request, Guid userId);
    Task<Result<ExpenseResponse>> UpdateAsync(Guid id, UpdateExpenseRequest request, Guid userId);
    Task<Result> DeleteAsync(Guid id, Guid userId);
    Task<ReportResponse> GetReportAsync(Guid userId, DateOnly? from = null, DateOnly? to = null);
    Task<byte[]> GeneratePdfAsync(Guid userId, string userName, DateOnly? from = null, DateOnly? to = null);

    // Receitas (Income)
    Task<List<ReceitaResponse>> ListReceitasAsync(Guid userId, DateOnly? from = null, DateOnly? to = null);
    Task<Result<ReceitaResponse>> CreateReceitaAsync(CreateReceitaRequest request, Guid userId);
    Task<Result<ReceitaResponse>> UpdateReceitaAsync(Guid id, UpdateReceitaRequest request, Guid userId);
    Task<Result> DeleteReceitaAsync(Guid id, Guid userId);

    // Categories
    Task<List<CategoryResponse>> ListCategoriesAsync(Guid userId);
    Task<Result<CategoryResponse>> CreateCategoryAsync(CreateCategoryRequest request, Guid userId);
    Task<Result> DeleteCategoryAsync(Guid id, Guid userId);
}
