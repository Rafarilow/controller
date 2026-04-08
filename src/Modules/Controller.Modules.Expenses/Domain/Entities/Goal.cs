using Controller.SharedKernel.Domain;

namespace Controller.Modules.Expenses.Domain.Entities;

public class Goal : Entity
{
    public string Nome { get; private set; } = null!;
    public decimal ValorAlvo { get; private set; }
    public decimal ValorAtual { get; private set; }
    public DateOnly? DataAlvo { get; private set; }
    public string Cor { get; private set; } = "#10b981";
    public string? Descricao { get; private set; }
    public Guid UsuarioId { get; private set; }

    private Goal() { }

    public static Goal Create(string nome, decimal valorAlvo, DateOnly? dataAlvo, string cor, string? descricao, Guid usuarioId)
    {
        return new Goal
        {
            Nome = nome,
            ValorAlvo = valorAlvo,
            ValorAtual = 0,
            DataAlvo = dataAlvo,
            Cor = cor,
            Descricao = descricao,
            UsuarioId = usuarioId
        };
    }

    public void Update(string nome, decimal valorAlvo, DateOnly? dataAlvo, string cor, string? descricao)
    {
        Nome = nome;
        ValorAlvo = valorAlvo;
        DataAlvo = dataAlvo;
        Cor = cor;
        Descricao = descricao;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Contribuir(decimal valor)
    {
        ValorAtual += valor;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DefinirValorAtual(decimal valor)
    {
        ValorAtual = valor;
        UpdatedAt = DateTime.UtcNow;
    }
}
