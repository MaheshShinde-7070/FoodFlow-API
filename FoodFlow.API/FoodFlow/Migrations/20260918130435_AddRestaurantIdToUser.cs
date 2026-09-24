using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodFlow.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "FoodFlowUsers",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "FoodFlowUsers");
        }
    }
}
