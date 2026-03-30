using Controller.SharedKernel.Domain;

namespace Controller.Modules.Expenses.Domain.Entities;

public class UserCategory : Entity
{
    public string Nome { get; private set; } = null!;
    public Guid UsuarioId { get; private set; }

    private UserCategory() { }

    public static UserCategory Create(string nome, Guid usuarioId)
    {
        return new UserCategory { Nome = nome, UsuarioId = usuarioId };
    }
}
