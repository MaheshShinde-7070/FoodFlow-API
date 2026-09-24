using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodFlow.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryPartnerToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DeliveryPartnerId",
                table: "Orders",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_DeliveryPartnerId",
                table: "Orders",
                column: "DeliveryPartnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_DeliveryPartners_DeliveryPartnerId",
                table: "Orders",
                column: "DeliveryPartnerId",
                principalTable: "DeliveryPartners",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_DeliveryPartners_DeliveryPartnerId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_DeliveryPartnerId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DeliveryPartnerId",
                table: "Orders");
        }
    }
}
