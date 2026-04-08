using Controller.SharedKernel.Domain;

namespace Controller.Modules.Expenses.Domain.Entities;

public class RecurringTransaction : Entity
{
    public string Tipo { get; private set; } = null!;          // "Despesa" | "Receita"
    public string Descricao { get; private set; } = null!;
    public string Categoria { get; private set; } = null!;
    public decimal Valor { get; private set; }
    public string Frequencia { get; private set; } = null!;    // "Mensal" | "Semanal" | "Anual"
    public int DiaCobranca { get; private set; }               // dia do mês (1-31), dia da semana (0-6) ou dia do ano (1-31 + mês via DataInicio)
    public DateOnly DataInicio { get; private set; }
    public DateOnly? DataFim { get; private set; }
    public bool Ativo { get; private set; } = true;
    public DateOnly? UltimaGeracao { get; private set; }
    public string? TipoReceita { get; private set; }           // só usado se Tipo == "Receita": "Fixa" | "Variavel"
    public Guid? AccountId { get; private set; }
    public Guid UsuarioId { get; private set; }

    private RecurringTransaction() { }

    public static RecurringTransaction Create(
        string tipo,
        string descricao,
        string categoria,
        decimal valor,
        string frequencia,
        int diaCobranca,
        DateOnly dataInicio,
        DateOnly? dataFim,
        Guid usuarioId,
        string? tipoReceita = null,
        Guid? accountId = null)
    {
        return new RecurringTransaction
        {
            Tipo = tipo,
            Descricao = descricao,
            Categoria = categoria,
            Valor = valor,
            Frequencia = frequencia,
            DiaCobranca = diaCobranca,
            DataInicio = dataInicio,
            DataFim = dataFim,
            UsuarioId = usuarioId,
            TipoReceita = tipo == "Receita" ? (tipoReceita ?? "Fixa") : null,
            AccountId = accountId
        };
    }

    public void SetAccount(Guid? accountId)
    {
        AccountId = accountId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(
        string descricao,
        string categoria,
        decimal valor,
        string frequencia,
        int diaCobranca,
        DateOnly? dataFim,
        string? tipoReceita)
    {
        Descricao = descricao;
        Categoria = categoria;
        Valor = valor;
        Frequencia = frequencia;
        DiaCobranca = diaCobranca;
        DataFim = dataFim;
        if (Tipo == "Receita") TipoReceita = tipoReceita ?? TipoReceita ?? "Fixa";
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAtivo(bool ativo)
    {
        Ativo = ativo;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkGenerated(DateOnly upTo)
    {
        UltimaGeracao = upTo;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Calcula todas as datas de ocorrência (inclusive) entre <paramref name="from"/> e <paramref name="to"/>.
    /// </summary>
    public IEnumerable<DateOnly> EnumerateOccurrences(DateOnly from, DateOnly to)
    {
        if (to < DataInicio) yield break;
        var start = from < DataInicio ? DataInicio : from;
        var end = DataFim.HasValue && to > DataFim.Value ? DataFim.Value : to;

        switch (Frequencia)
        {
            case "Semanal":
                {
                    // DiaCobranca = dia da semana (0=Domingo)
                    var current = start;
                    while ((int)current.DayOfWeek != DiaCobranca && current <= end)
                        current = current.AddDays(1);
                    while (current <= end)
                    {
                        yield return current;
                        current = current.AddDays(7);
                    }
                    break;
                }

            case "Anual":
                {
                    // DiaCobranca = dia, mês vem de DataInicio
                    var month = DataInicio.Month;
                    var year = start.Year;
                    while (year <= end.Year)
                    {
                        var day = Math.Min(DiaCobranca, DateTime.DaysInMonth(year, month));
                        var candidate = new DateOnly(year, month, day);
                        if (candidate >= start && candidate <= end)
                            yield return candidate;
                        year++;
                    }
                    break;
                }

            case "Mensal":
            default:
                {
                    var year = start.Year;
                    var month = start.Month;
                    while (true)
                    {
                        var day = Math.Min(DiaCobranca <= 0 ? 1 : DiaCobranca, DateTime.DaysInMonth(year, month));
                        var candidate = new DateOnly(year, month, day);
                        if (candidate > end) break;
                        if (candidate >= start)
                            yield return candidate;
                        month++;
                        if (month > 12) { month = 1; year++; }
                    }
                    break;
                }
        }
    }
}
