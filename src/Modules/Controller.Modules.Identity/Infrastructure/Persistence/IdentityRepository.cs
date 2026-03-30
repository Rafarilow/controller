using Controller.Modules.Identity.Application.Interfaces;
using Controller.Modules.Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Controller.Modules.Identity.Infrastructure.Persistence;

public class IdentityRepository : IIdentityRepository
{
    private readonly IdentityDbContext _context;

    public IdentityRepository(IdentityDbContext context) => _context = context;

    public async Task<User?> GetUserByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task<User?> GetUserByEmailAsync(string email, CancellationToken ct = default)
        => await _context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public async Task AddUserAsync(User user, CancellationToken ct = default)
        => await _context.Users.AddAsync(user, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await _context.SaveChangesAsync(ct);
}
