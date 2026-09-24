using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FoodFlow.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryPartner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DeliveryPartners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    VehicleType = table.Column<string>(type: "text", nullable: false),
                    VehicleNumber = table.Column<string>(type: "text", nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryPartners", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryPartners_FoodFlowUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "FoodFlowUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryPartners_UserId",
                table: "DeliveryPartners",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeliveryPartners");
        }
    }
}
