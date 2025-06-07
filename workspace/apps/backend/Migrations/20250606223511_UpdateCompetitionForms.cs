using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Workspace.Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCompetitionForms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Form",
                table: "Competitions");

            migrationBuilder.AlterColumn<string>(
                name: "Round",
                table: "Competitions",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Level",
                table: "Competitions",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateTable(
                name: "Forms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Forms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompetitionForms",
                columns: table => new
                {
                    CompetitionId = table.Column<int>(type: "integer", nullable: false),
                    FormId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitionForms", x => new { x.CompetitionId, x.FormId });
                    table.ForeignKey(
                        name: "FK_CompetitionForms_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompetitionForms_Forms_FormId",
                        column: x => x.FormId,
                        principalTable: "Forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Forms",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Written competition form", "Written" },
                    { 2, "Oral competition form", "Oral" },
                    { 3, "Sport competition form", "Sport" },
                    { 4, "Submission-based competition form", "Submission" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionForms_FormId",
                table: "CompetitionForms",
                column: "FormId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompetitionForms");

            migrationBuilder.DropTable(
                name: "Forms");

            migrationBuilder.AlterColumn<int>(
                name: "Round",
                table: "Competitions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "Level",
                table: "Competitions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int[]>(
                name: "Form",
                table: "Competitions",
                type: "integer[]",
                nullable: false,
                defaultValue: new int[0]);
        }
    }
}
