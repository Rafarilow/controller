using Controller.SharedKernel.Domain;

namespace Controller.Modules.Expenses.Domain.Entities;

public class Budget : Entity
{
    public string Categoria { get; private set; } = null!;
    public decimal ValorLimite { get; private set; }
    public string Periodo { get; private set; } = "Mensal";
    public Guid UsuarioId { get; private set; }

    private Budget() { }

    public static Budget Create(string categoria, decimal valorLimite, string periodo, Guid usuarioId)
    {
        return new Budget
        {
            Categoria = categoria,
            ValorLimite = valorLimite,
            Periodo = periodo,
            UsuarioId = usuarioId
        };
    }

    public void Update(string categoria, decimal valorLimite, string periodo)
    {
        Categoria = categoria;
        ValorLimite = valorLimite;
        Periodo = periodo;
        UpdatedAt = DateTime.UtcNow;
    }
}
