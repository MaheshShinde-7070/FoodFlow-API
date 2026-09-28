namespace FoodFlow.API.Models;

public class CustomerAddress
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public bool IsDefault { get; set; } = false;
}