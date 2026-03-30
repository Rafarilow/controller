namespace Controller.Modules.Expenses.Application.DTOs;

public record CreateExpenseRequest(DateOnly Data, string Descricao, string Categoria, decimal Valor);
public record UpdateExpenseRequest(DateOnly Data, string Descricao, string Categoria, decimal Valor);
public record ExpenseResponse(Guid Id, DateOnly Data, string Descricao, string Categoria, decimal Valor, DateTime CreatedAt);
public record CategoryReport(string Categoria, decimal Total);
public record MonthReport(string Mes, decimal Total);
public record ReportResponse(CategoryReport[] ByCategory, MonthReport[] ByMonth, decimal Total, decimal Average, decimal TotalReceitas, decimal Saldo, MonthReport[] ReceitasByMonth);

// Receitas (Income)
public record CreateReceitaRequest(DateOnly Data, string Descricao, string Categoria, decimal Valor, string Tipo);
public record UpdateReceitaRequest(DateOnly Data, string Descricao, string Categoria, decimal Valor, string Tipo);
public record ReceitaResponse(Guid Id, DateOnly Data, string Descricao, string Categoria, decimal Valor, string Tipo, DateTime CreatedAt);

// Categories
public record CreateCategoryRequest(string Nome);
public record CategoryResponse(Guid Id, string Nome);
