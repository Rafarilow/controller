using Controller.Modules.Expenses.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Controller.Modules.Expenses.Infrastructure.Persistence.Configurations;

public class GoalConfiguration : IEntityTypeConfiguration<Goal>
{
    public void Configure(EntityTypeBuilder<Goal> builder)
    {
        builder.ToTable("goals");
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Nome).HasMaxLength(150).IsRequired();
        builder.Property(g => g.ValorAlvo).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(g => g.ValorAtual).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(g => g.Cor).HasMaxLength(20).IsRequired();
        builder.Property(g => g.Descricao).HasMaxLength(500);
        builder.Property(g => g.UsuarioId).IsRequired();
        builder.HasIndex(g => g.UsuarioId);
        builder.Property(g => g.CreatedAt).HasDefaultValueSql("now()");
    }
}
