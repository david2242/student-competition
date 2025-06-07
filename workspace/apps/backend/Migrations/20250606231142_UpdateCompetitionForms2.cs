using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Workspace.Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCompetitionForms2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Forms",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "WRITTEN");

            migrationBuilder.UpdateData(
                table: "Forms",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "ORAL");

            migrationBuilder.UpdateData(
                table: "Forms",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "SPORT");

            migrationBuilder.UpdateData(
                table: "Forms",
                keyColumn: "Id",
                keyValue: 4,
                column: "Name",
                value: "SUBMISSION");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Forms",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Written");

            migrationBuilder.UpdateData(
                table: "Forms",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Oral");

            migrationBuilder.UpdateData(
                table: "Forms",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Sport");

            migrationBuilder.UpdateData(
                table: "Forms",
                keyColumn: "Id",
                keyValue: 4,
                column: "Name",
                value: "Submission");
        }
    }
}
