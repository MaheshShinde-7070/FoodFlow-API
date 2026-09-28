namespace FoodFlow.API.DTOs;

public class CustomerAddressDto
{
    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public bool IsDefault { get; set; }
}