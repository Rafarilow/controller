using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;

namespace Controller.Modules.Expenses.Application.Services;

public class ReportsService : IReportsService
{
    private readonly IExpenseRepository _repository;

    public ReportsService(IExpenseRepository repository) => _repository = repository;

    public async Task<CashflowResponse> GetCashflowAsync(Guid userId, int months = 12)
    {
        var now = DateTime.UtcNow;
        var start = new DateOnly(now.Year, now.Month, 1).AddMonths(-(months - 1));
        var end = new DateOnly(now.Year, now.Month, 1).AddMonths(1).AddDays(-1);

        var receitasByMonth = await _repository.GetReceitasByMonthAsync(userId, start, end);
        var despesasByMonth = await _repository.GetByMonthAsync(userId, start, end);

        var rec = receitasByMonth.ToDictionary(r => r.Mes, r => r.Total);
        var desp = despesasByMonth.ToDictionary(d => d.Mes, d => d.Total);

        var items = new List<CashflowMonthItem>();
        for (int i = 0; i < months; i++)
        {
            var d = start.AddMonths(i);
            var key = $"{d.Year}-{d.Month:D2}";
            var r = rec.GetValueOrDefault(key, 0m);
            var dp = desp.GetValueOrDefault(key, 0m);
            items.Add(new CashflowMonthItem(key, r, dp, r - dp));
        }
        return new CashflowResponse(items.ToArray());
    }

    public async Task<ProjectionResponse> GetProjectionAsync(Guid userId)
    {
        var actives = await _repository.GetRecurringByUserAsync(userId, ativo: true);
        var now = DateTime.UtcNow;
        var firstDayNextMonth = new DateOnly(now.Year, now.Month, 1).AddMonths(1);
        var lastDayNextMonth = firstDayNextMonth.AddMonths(1).AddDays(-1);

        decimal receitaPrev = 0;
        decimal despesaPrev = 0;

        foreach (var r in actives)
        {
            var occ = r.EnumerateOccurrences(firstDayNextMonth, lastDayNextMonth).Count();
            var total = r.Valor * occ;
            if (r.Tipo == "Receita") receitaPrev += total; else despesaPrev += total;
        }

        return new ProjectionResponse(receitaPrev, despesaPrev, receitaPrev - despesaPrev, actives.Count);
    }

    public async Task<CategoryTrendResponse> GetCategoryTrendAsync(Guid userId, string categoria, int months = 6)
    {
        var now = DateTime.UtcNow;
        var start = new DateOnly(now.Year, now.Month, 1).AddMonths(-(months - 1));
        var end = new DateOnly(now.Year, now.Month, 1).AddMonths(1).AddDays(-1);

        var byMonth = await _repository.GetByMonthAsync(userId, start, end);
        // Esse repositório não suporta filtro por categoria diretamente — então pegamos todas as despesas e filtramos
        var all = await _repository.GetByUserAsync(userId, start, end);
        var filtered = all.Where(e => string.Equals(e.Categoria, categoria, StringComparison.OrdinalIgnoreCase));

        var grouped = filtered
            .GroupBy(e => $"{e.Data.Year}-{e.Data.Month:D2}")
            .ToDictionary(g => g.Key, g => g.Sum(e => e.Valor));

        var items = new List<CategoryTrendItem>();
        for (int i = 0; i < months; i++)
        {
            var d = start.AddMonths(i);
            var key = $"{d.Year}-{d.Month:D2}";
            items.Add(new CategoryTrendItem(key, grouped.GetValueOrDefault(key, 0m)));
        }
        return new CategoryTrendResponse(categoria, items.ToArray());
    }

    public async Task<CalendarResponse> GetCalendarAsync(Guid userId, int year, int month)
    {
        var first = new DateOnly(year, month, 1);
        var last = first.AddMonths(1).AddDays(-1);

        var expenses = await _repository.GetByUserAsync(userId, first, last);
        var receitas = await _repository.GetReceitasByUserAsync(userId, first, last);
        var actives = await _repository.GetRecurringByUserAsync(userId, ativo: true);

        var items = new List<CalendarItem>();

        // Lançamentos reais (já efetivados)
        foreach (var e in expenses)
            items.Add(new CalendarItem(e.Data, "Despesa", e.Descricao, e.Categoria, e.Valor, "pago"));
        foreach (var r in receitas)
            items.Add(new CalendarItem(r.Data, "Receita", r.Descricao, r.Categoria, r.Valor, "pago"));

        // Próximas ocorrências (de templates ativos) ainda não materializadas
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var existingByRecurring = new Dictionary<Guid, HashSet<DateOnly>>();
        foreach (var r in actives)
        {
            if (!existingByRecurring.ContainsKey(r.Id))
                existingByRecurring[r.Id] = await _repository.GetExistingRecurringDatesAsync(r.Id, r.Tipo);

            foreach (var occ in r.EnumerateOccurrences(first, last))
            {
                if (existingByRecurring[r.Id].Contains(occ)) continue;
                if (occ < today) continue; // só mostra futuras como "previsto"
                items.Add(new CalendarItem(occ, r.Tipo, r.Descricao, r.Categoria, r.Valor, "previsto"));
            }
        }

        return new CalendarResponse(items.OrderBy(i => i.Data).ToArray(), $"{year}-{month:D2}");
    }
}
