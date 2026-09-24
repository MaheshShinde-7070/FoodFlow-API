using Microsoft.AspNetCore.SignalR;

namespace FoodFlow.Hubs;

public class OrderHub : Hub
{
    public async Task JoinOrderGroup(int orderId)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"order-{orderId}");
    }

    public async Task LeaveOrderGroup(int orderId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            $"order-{orderId}");
    }
    public async Task JoinRestaurantGroup(int restaurantId)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"restaurant-{restaurantId}");
    }

    public async Task LeaveRestaurantGroup(int restaurantId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            $"restaurant-{restaurantId}");
    }

    public async Task JoinDeliveryPartnerGroup(int deliveryPartnerId)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"delivery-partner-{deliveryPartnerId}"
        );
    }
}