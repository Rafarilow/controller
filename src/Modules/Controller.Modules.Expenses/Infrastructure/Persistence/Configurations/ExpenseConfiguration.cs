using Controller.Modules.Expenses.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Controller.Modules.Expenses.Infrastructure.Persistence.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("expenses");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Data).IsRequired();
        builder.Property(e => e.Descricao).HasMaxLength(300).IsRequired();
        builder.Property(e => e.Categoria).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Valor).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(e => e.UsuarioId).IsRequired();
        builder.HasIndex(e => e.UsuarioId);
        builder.Property(e => e.OrigemRecorrenteId);
        builder.Property(e => e.AccountId);
        builder.HasIndex(e => e.AccountId);
        builder.HasIndex(e => new { e.OrigemRecorrenteId, e.Data })
            .HasFilter("\"OrigemRecorrenteId\" IS NOT NULL")
            .IsUnique();
        builder.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
    }
}
