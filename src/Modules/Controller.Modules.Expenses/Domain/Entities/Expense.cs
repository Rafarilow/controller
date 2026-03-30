using Controller.SharedKernel.Domain;

namespace Controller.Modules.Expenses.Domain.Entities;

public class Expense : Entity
{
    public DateOnly Data { get; private set; }
    public string Descricao { get; private set; } = null!;
    public string Categoria { get; private set; } = null!;
    public decimal Valor { get; private set; }
    public Guid UsuarioId { get; private set; }

    private Expense() { }

    public static Expense Create(DateOnly data, string descricao, string categoria, decimal valor, Guid usuarioId)
    {
        return new Expense
        {
            Data = data,
            Descricao = descricao,
            Categoria = categoria,
            Valor = valor,
            UsuarioId = usuarioId
        };
    }

    public void Update(DateOnly data, string descricao, string categoria, decimal valor)
    {
        Data = data;
        Descricao = descricao;
        Categoria = categoria;
        Valor = valor;
        UpdatedAt = DateTime.UtcNow;
    }
}
