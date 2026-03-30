using Controller.SharedKernel.Domain;

namespace Controller.Modules.Expenses.Domain.Entities;

public class Receita : Entity
{
    public DateOnly Data { get; private set; }
    public string Descricao { get; private set; } = null!;
    public string Categoria { get; private set; } = null!;
    public decimal Valor { get; private set; }
    public string Tipo { get; private set; } = null!; // "Fixa" | "Variavel"
    public Guid UsuarioId { get; private set; }

    private Receita() { }

    public static Receita Create(DateOnly data, string descricao, string categoria, decimal valor, string tipo, Guid usuarioId)
    {
        return new Receita
        {
            Data = data,
            Descricao = descricao,
            Categoria = categoria,
            Valor = valor,
            Tipo = tipo,
            UsuarioId = usuarioId
        };
    }

    public void Update(DateOnly data, string descricao, string categoria, decimal valor, string tipo)
    {
        Data = data;
        Descricao = descricao;
        Categoria = categoria;
        Valor = valor;
        Tipo = tipo;
        UpdatedAt = DateTime.UtcNow;
    }
}
