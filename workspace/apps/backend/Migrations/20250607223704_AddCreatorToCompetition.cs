using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Workspace.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatorToCompetition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatorId",
                table: "Competitions",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_CreatorId",
                table: "Competitions",
                column: "CreatorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Competitions_AspNetUsers_CreatorId",
                table: "Competitions",
                column: "CreatorId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Competitions_AspNetUsers_CreatorId",
                table: "Competitions");

            migrationBuilder.DropIndex(
                name: "IX_Competitions_CreatorId",
                table: "Competitions");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "Competitions");
        }
    }
}
