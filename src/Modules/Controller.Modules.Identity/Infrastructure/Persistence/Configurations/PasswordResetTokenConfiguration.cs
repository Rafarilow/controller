using Controller.Modules.Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Controller.Modules.Identity.Infrastructure.Persistence.Configurations;

public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.ToTable("password_reset_tokens");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Token).HasMaxLength(64).IsRequired();
        builder.Property(t => t.Email).HasMaxLength(256).IsRequired();
        builder.Property(t => t.ExpiresAt).IsRequired();
        builder.HasIndex(t => t.Token).IsUnique();
        builder.Property(t => t.CreatedAt).HasDefaultValueSql("now()");
    }
}
