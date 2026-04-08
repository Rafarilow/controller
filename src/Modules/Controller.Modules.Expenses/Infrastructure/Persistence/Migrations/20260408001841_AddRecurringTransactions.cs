using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controller.Modules.Expenses.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRecurringTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OrigemRecorrenteId",
                table: "receitas",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrigemRecorrenteId",
                table: "expenses",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "recurring_transactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Categoria = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Valor = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Frequencia = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DiaCobranca = table.Column<int>(type: "integer", nullable: false),
                    DataInicio = table.Column<DateOnly>(type: "date", nullable: false),
                    DataFim = table.Column<DateOnly>(type: "date", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    UltimaGeracao = table.Column<DateOnly>(type: "date", nullable: true),
                    TipoReceita = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recurring_transactions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_receitas_OrigemRecorrenteId_Data",
                table: "receitas",
                columns: new[] { "OrigemRecorrenteId", "Data" },
                unique: true,
                filter: "\"OrigemRecorrenteId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_expenses_OrigemRecorrenteId_Data",
                table: "expenses",
                columns: new[] { "OrigemRecorrenteId", "Data" },
                unique: true,
                filter: "\"OrigemRecorrenteId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_recurring_transactions_UsuarioId",
                table: "recurring_transactions",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_recurring_transactions_UsuarioId_Ativo",
                table: "recurring_transactions",
                columns: new[] { "UsuarioId", "Ativo" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "recurring_transactions");

            migrationBuilder.DropIndex(
                name: "IX_receitas_OrigemRecorrenteId_Data",
                table: "receitas");

            migrationBuilder.DropIndex(
                name: "IX_expenses_OrigemRecorrenteId_Data",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "OrigemRecorrenteId",
                table: "receitas");

            migrationBuilder.DropColumn(
                name: "OrigemRecorrenteId",
                table: "expenses");
        }
    }
}
