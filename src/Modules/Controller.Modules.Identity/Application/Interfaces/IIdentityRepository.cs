using Controller.Modules.Identity.Domain.Entities;

namespace Controller.Modules.Identity.Application.Interfaces;

public interface IIdentityRepository
{
    Task<User?> GetUserByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetUserByEmailAsync(string email, CancellationToken ct = default);
    Task AddUserAsync(User user, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
