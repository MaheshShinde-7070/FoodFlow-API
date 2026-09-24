namespace FoodFlow.DTOs;

public class CreateOrderDto
{
    public int RestaurantId { get; set; }

    public string DeliveryAddress { get; set; } = string.Empty;

    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    public int MenuItemId { get; set; }

    public int Quantity { get; set; }
}