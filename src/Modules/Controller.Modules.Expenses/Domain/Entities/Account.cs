using Controller.SharedKernel.Domain;

namespace Controller.Modules.Expenses.Domain.Entities;

public class Account : Entity
{
    public string Nome { get; private set; } = null!;
    public string Tipo { get; private set; } = null!;          // "ContaCorrente" | "Poupanca" | "Cartao" | "Dinheiro" | "Investimento"
    public decimal SaldoInicial { get; private set; }
    public string Cor { get; private set; } = "#10b981";
    public bool Ativo { get; private set; } = true;
    public Guid UsuarioId { get; private set; }

    private Account() { }

    public static Account Create(string nome, string tipo, decimal saldoInicial, string cor, Guid usuarioId)
    {
        return new Account
        {
            Nome = nome,
            Tipo = tipo,
            SaldoInicial = saldoInicial,
            Cor = cor,
            UsuarioId = usuarioId
        };
    }

    public void Update(string nome, string tipo, decimal saldoInicial, string cor)
    {
        Nome = nome;
        Tipo = tipo;
        SaldoInicial = saldoInicial;
        Cor = cor;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAtivo(bool ativo)
    {
        Ativo = ativo;
        UpdatedAt = DateTime.UtcNow;
    }
}
