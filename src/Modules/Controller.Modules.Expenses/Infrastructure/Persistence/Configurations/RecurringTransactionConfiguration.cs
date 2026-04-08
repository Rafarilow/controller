using Controller.Modules.Expenses.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Controller.Modules.Expenses.Infrastructure.Persistence.Configurations;

public class RecurringTransactionConfiguration : IEntityTypeConfiguration<RecurringTransaction>
{
    public void Configure(EntityTypeBuilder<RecurringTransaction> builder)
    {
        builder.ToTable("recurring_transactions");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Tipo).HasMaxLength(20).IsRequired();
        builder.Property(r => r.Descricao).HasMaxLength(300).IsRequired();
        builder.Property(r => r.Categoria).HasMaxLength(100).IsRequired();
        builder.Property(r => r.Valor).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(r => r.Frequencia).HasMaxLength(20).IsRequired();
        builder.Property(r => r.DiaCobranca).IsRequired();
        builder.Property(r => r.DataInicio).IsRequired();
        builder.Property(r => r.Ativo).IsRequired();
        builder.Property(r => r.TipoReceita).HasMaxLength(20);
        builder.Property(r => r.AccountId);
        builder.Property(r => r.UsuarioId).IsRequired();
        builder.HasIndex(r => r.UsuarioId);
        builder.HasIndex(r => new { r.UsuarioId, r.Ativo });
        builder.Property(r => r.CreatedAt).HasDefaultValueSql("now()");
    }
}
