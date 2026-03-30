using Controller.SharedKernel.Domain;

namespace Controller.Modules.Identity.Domain.Entities;

public class User : Entity
{
    public string Nome { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;

    private User() { }

    public static User Create(string nome, string email, string passwordHash)
    {
        return new User
        {
            Nome = nome,
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash
        };
    }

    public void UpdateProfile(string? nome)
    {
        if (nome is not null) Nome = nome;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPasswordHash(string hash)
    {
        PasswordHash = hash;
        UpdatedAt = DateTime.UtcNow;
    }
}
