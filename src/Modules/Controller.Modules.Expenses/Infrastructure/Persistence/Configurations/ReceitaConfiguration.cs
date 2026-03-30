using Controller.Modules.Expenses.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Controller.Modules.Expenses.Infrastructure.Persistence.Configurations;

public class ReceitaConfiguration : IEntityTypeConfiguration<Receita>
{
    public void Configure(EntityTypeBuilder<Receita> builder)
    {
        builder.ToTable("receitas");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Data).IsRequired();
        builder.Property(r => r.Descricao).HasMaxLength(300).IsRequired();
        builder.Property(r => r.Categoria).HasMaxLength(100).IsRequired();
        builder.Property(r => r.Valor).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(r => r.Tipo).HasMaxLength(20).IsRequired();
        builder.Property(r => r.UsuarioId).IsRequired();
        builder.HasIndex(r => r.UsuarioId);
        builder.Property(r => r.CreatedAt).HasDefaultValueSql("now()");
    }
}
