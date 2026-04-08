using Controller.Modules.Expenses.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Controller.Modules.Expenses.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("accounts");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Nome).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Tipo).HasMaxLength(30).IsRequired();
        builder.Property(a => a.SaldoInicial).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(a => a.Cor).HasMaxLength(20).IsRequired();
        builder.Property(a => a.Ativo).IsRequired();
        builder.Property(a => a.UsuarioId).IsRequired();
        builder.HasIndex(a => a.UsuarioId);
        builder.Property(a => a.CreatedAt).HasDefaultValueSql("now()");
    }
}
