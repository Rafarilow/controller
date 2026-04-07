using Controller.SharedKernel.Domain;

namespace Controller.Modules.Identity.Domain.Entities;

public class PasswordResetToken : Entity
{
    public string Token { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public DateTime ExpiresAt { get; private set; }

    private PasswordResetToken() { }

    public static PasswordResetToken Create(string email)
    {
        return new PasswordResetToken
        {
            Token = Guid.NewGuid().ToString("N"),
            Email = email.ToLowerInvariant(),
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };
    }

    public bool IsExpired() => DateTime.UtcNow > ExpiresAt;
}
