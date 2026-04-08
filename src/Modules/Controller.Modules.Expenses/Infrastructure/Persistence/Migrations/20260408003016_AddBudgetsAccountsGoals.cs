using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controller.Modules.Expenses.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBudgetsAccountsGoals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AccountId",
                table: "recurring_transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AccountId",
                table: "receitas",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AccountId",
                table: "expenses",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "accounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Tipo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SaldoInicial = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Cor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_accounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "budgets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Categoria = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ValorLimite = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Periodo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budgets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "goals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ValorAlvo = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ValorAtual = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DataAlvo = table.Column<DateOnly>(type: "date", nullable: true),
                    Cor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_goals", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_receitas_AccountId",
                table: "receitas",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_expenses_AccountId",
                table: "expenses",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_accounts_UsuarioId",
                table: "accounts",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_budgets_UsuarioId",
                table: "budgets",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_budgets_UsuarioId_Categoria_Periodo",
                table: "budgets",
                columns: new[] { "UsuarioId", "Categoria", "Periodo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_goals_UsuarioId",
                table: "goals",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "accounts");

            migrationBuilder.DropTable(
                name: "budgets");

            migrationBuilder.DropTable(
                name: "goals");

            migrationBuilder.DropIndex(
                name: "IX_receitas_AccountId",
                table: "receitas");

            migrationBuilder.DropIndex(
                name: "IX_expenses_AccountId",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "recurring_transactions");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "receitas");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "expenses");
        }
    }
}
