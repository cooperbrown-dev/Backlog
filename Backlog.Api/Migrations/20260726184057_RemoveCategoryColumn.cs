using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backlog.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCategoryColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "BacklogItems");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "BacklogItems",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "BacklogItems");

            migrationBuilder.AddColumn<int>(
                name: "Category",
                table: "BacklogItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
