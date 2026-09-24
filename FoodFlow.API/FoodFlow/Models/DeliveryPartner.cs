using FoodFlow.API.Models;

namespace FoodFlow.Models;

public class DeliveryPartner
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string VehicleType { get; set; } = string.Empty;

    public string VehicleNumber { get; set; } = string.Empty;

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}