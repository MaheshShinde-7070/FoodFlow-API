using FoodFlow.API.Models;
using FoodFlow.Models;

public class Order
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int RestaurantId { get; set; }

    public int? DeliveryPartnerId { get; set; }

    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = "Pending";

    public string DeliveryAddress { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Stores the exact date and time when the order was delivered
    public DateTime? DeliveredAt { get; set; }

    public User? User { get; set; }

    public Restaurant? Restaurant { get; set; }

    public DeliveryPartner? DeliveryPartner { get; set; }

    public List<OrderItem> OrderItems { get; set; } = new();
}

