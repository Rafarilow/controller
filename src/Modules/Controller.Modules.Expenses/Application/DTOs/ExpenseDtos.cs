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

// Recurring Transactions
public record CreateRecurringRequest(
    string Tipo,            // "Despesa" | "Receita"
    string Descricao,
    string Categoria,
    decimal Valor,
    string Frequencia,      // "Mensal" | "Semanal" | "Anual"
    int DiaCobranca,
    DateOnly DataInicio,
    DateOnly? DataFim,
    string? TipoReceita     // "Fixa" | "Variavel" — só para Tipo == "Receita"
);

public record UpdateRecurringRequest(
    string Descricao,
    string Categoria,
    decimal Valor,
    string Frequencia,
    int DiaCobranca,
    DateOnly? DataFim,
    string? TipoReceita,
    bool Ativo
);

public record RecurringResponse(
    Guid Id,
    string Tipo,
    string Descricao,
    string Categoria,
    decimal Valor,
    string Frequencia,
    int DiaCobranca,
    DateOnly DataInicio,
    DateOnly? DataFim,
    bool Ativo,
    DateOnly? UltimaGeracao,
    string? TipoReceita,
    DateTime CreatedAt
);

public record RecurringRunResult(int OcorrenciasCriadas);

// Budgets
public record CreateBudgetRequest(string Categoria, decimal ValorLimite, string Periodo);
public record UpdateBudgetRequest(string Categoria, decimal ValorLimite, string Periodo);
public record BudgetResponse(Guid Id, string Categoria, decimal ValorLimite, string Periodo, decimal GastoAtual, decimal Percentual, string Status, DateTime CreatedAt);
public record BudgetStatusItem(string Categoria, decimal ValorLimite, decimal Gasto, decimal Percentual, string Status);

// Accounts
public record CreateAccountRequest(string Nome, string Tipo, decimal SaldoInicial, string Cor);
public record UpdateAccountRequest(string Nome, string Tipo, decimal SaldoInicial, string Cor, bool Ativo);
public record AccountResponse(Guid Id, string Nome, string Tipo, decimal SaldoInicial, string Cor, bool Ativo, decimal SaldoAtual, DateTime CreatedAt);

// Goals
public record CreateGoalRequest(string Nome, decimal ValorAlvo, DateOnly? DataAlvo, string Cor, string? Descricao);
public record UpdateGoalRequest(string Nome, decimal ValorAlvo, DateOnly? DataAlvo, string Cor, string? Descricao);
public record ContribuirGoalRequest(decimal Valor);
public record GoalResponse(Guid Id, string Nome, decimal ValorAlvo, decimal ValorAtual, DateOnly? DataAlvo, string Cor, string? Descricao, decimal Percentual, DateTime CreatedAt);

// Reports — fase 5
public record CashflowMonthItem(string Mes, decimal Receitas, decimal Despesas, decimal Saldo);
public record CashflowResponse(CashflowMonthItem[] Items);
public record ProjectionResponse(decimal ReceitaPrevista, decimal DespesaPrevista, decimal SaldoPrevisto, int LancamentosAtivos);
public record CategoryTrendItem(string Mes, decimal Total);
public record CategoryTrendResponse(string Categoria, CategoryTrendItem[] Items);

// Calendar
public record CalendarItem(DateOnly Data, string Tipo, string Descricao, string Categoria, decimal Valor, string Status);
public record CalendarResponse(CalendarItem[] Items, string Mes);
