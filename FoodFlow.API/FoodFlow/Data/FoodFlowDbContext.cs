using FoodFlow.API.Models;
using FoodFlow.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodFlow.Data;

public class FoodFlowDbContext : DbContext
{
    public FoodFlowDbContext(
        DbContextOptions<FoodFlowDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Restaurant> Restaurants => Set<Restaurant>();

    public DbSet<MenuItem> MenuItems => Set<MenuItem>();

    public DbSet<Order> Orders => Set<Order>();

    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    public DbSet<DeliveryPartner> DeliveryPartners => Set<DeliveryPartner>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .ToTable("FoodFlowUsers");

        // Restaurant → MenuItems
        modelBuilder.Entity<MenuItem>()
            .HasOne(x => x.Restaurant)
            .WithMany()
            .HasForeignKey(x => x.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Order → User
        modelBuilder.Entity<Order>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Order → Restaurant
        modelBuilder.Entity<Order>()
            .HasOne(x => x.Restaurant)
            .WithMany()
            .HasForeignKey(x => x.RestaurantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Order → OrderItems
        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.Order)
            .WithMany(x => x.OrderItems)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // OrderItem → MenuItem
        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.MenuItem)
            .WithMany()
            .HasForeignKey(x => x.MenuItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DeliveryPartner>()
    .HasOne(x => x.User)
    .WithMany()
    .HasForeignKey(x => x.UserId)
    .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
    .HasOne(x => x.DeliveryPartner)
    .WithMany()
    .HasForeignKey(x => x.DeliveryPartnerId)
    .OnDelete(DeleteBehavior.SetNull);
    }

}