using Controller.Modules.Expenses.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Controller.Modules.Expenses.Infrastructure.Persistence.Configurations;

public class BudgetConfiguration : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        builder.ToTable("budgets");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Categoria).HasMaxLength(100).IsRequired();
        builder.Property(b => b.ValorLimite).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(b => b.Periodo).HasMaxLength(20).IsRequired();
        builder.Property(b => b.UsuarioId).IsRequired();
        builder.HasIndex(b => b.UsuarioId);
        builder.HasIndex(b => new { b.UsuarioId, b.Categoria, b.Periodo }).IsUnique();
        builder.Property(b => b.CreatedAt).HasDefaultValueSql("now()");
    }
}
