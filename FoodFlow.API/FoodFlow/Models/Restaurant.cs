namespace FoodFlow.Models;

public class Restaurant
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public bool IsOpen { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}