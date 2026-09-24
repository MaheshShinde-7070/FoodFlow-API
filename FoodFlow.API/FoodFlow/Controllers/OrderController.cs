using FoodFlow.Data;
using FoodFlow.DTOs;
using FoodFlow.Hubs;
using FoodFlow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace FoodFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly FoodFlowDbContext _context;
    private readonly IHubContext<OrderHub> _hubContext;
    public OrderController(FoodFlowDbContext context, IHubContext<OrderHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet("restaurant/{restaurantId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetRestaurantOrders(int restaurantId)
    {
        var orders = await _context.Orders
            .Where(x => x.RestaurantId == restaurantId)
            .Select(x => new
            {
                x.Id,
                x.Status,
                x.TotalAmount,
                x.DeliveryAddress,
                x.CreatedAt,

                Items = x.OrderItems.Select(item => new
                {
                    item.Id,
                    item.MenuItemId,
                    MenuItemName = item.MenuItem!.Name,
                    item.Quantity,
                    item.UnitPrice,
                    SubTotal = item.Quantity * item.UnitPrice
                })
            })
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userIdClaim.Value);

        var orders = await _context.Orders
            .Where(x => x.UserId == userId)
            .Include(x => x.Restaurant)
            .Include(x => x.OrderItems)
                .ThenInclude(x => x.MenuItem)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.Status,
                x.TotalAmount,
                x.DeliveryAddress,
                x.CreatedAt,

                Restaurant = new
                {
                    x.Restaurant!.Id,
                    x.Restaurant.Name
                },

                Items = x.OrderItems.Select(item => new
                {
                    item.Id,
                    item.MenuItemId,
                    MenuItemName = item.MenuItem!.Name,
                    item.Quantity,
                    item.UnitPrice,
                    SubTotal = item.Quantity * item.UnitPrice
                })
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var userIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userIdClaim.Value);

        var order = await _context.Orders
            .Where(x => x.Id == id && x.UserId == userId)
            .Select(x => new
            {
                x.Id,
                x.Status,
                x.TotalAmount,
                x.DeliveryAddress,
                x.CreatedAt,

                Restaurant = new
                {
                    x.Restaurant!.Id,
                    x.Restaurant.Name
                },

                Items = x.OrderItems.Select(item => new
                {
                    item.Id,
                    item.MenuItemId,
                    MenuItemName = item.MenuItem!.Name,
                    item.Quantity,
                    item.UnitPrice,
                    SubTotal = item.Quantity * item.UnitPrice
                })
            })
            .FirstOrDefaultAsync();

        if (order == null)
        {
            return NotFound(new
            {
                message = "Order not found."
            });
        }

        return Ok(order);
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userIdClaim.Value);

        var order = await _context.Orders
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == userId);

        if (order == null)
        {
            return NotFound(new
            {
                message = "Order not found."
            });
        }

        if (order.Status != "Pending")
        {
            return BadRequest(new
            {
                message = "Order cannot be cancelled now."
            });
        }

        order.Status = "Cancelled";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Order cancelled successfully.",
            orderId = order.Id,
            status = order.Status
        });
    }


    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderDto dto)
    {
        // Get logged-in user's ID from JWT
        var userIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userIdClaim.Value);

        // Check restaurant
        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(x => x.Id == dto.RestaurantId);

        if (restaurant == null)
        {
            return NotFound(new
            {
                message = "Restaurant not found."
            });
        }

        if (!restaurant.IsOpen)
        {
            return BadRequest(new
            {
                message = "Restaurant is currently closed."
            });
        }

        if (dto.Items == null || dto.Items.Count == 0)
        {
            return BadRequest(new
            {
                message = "Order must contain at least one item."
            });
        }

        // Get menu items from database
        var menuItemIds = dto.Items
            .Select(x => x.MenuItemId)
            .Distinct()
            .ToList();

        var menuItems = await _context.MenuItems
            .Where(x =>
                menuItemIds.Contains(x.Id) &&
                x.RestaurantId == dto.RestaurantId)
            .ToListAsync();

        // Check all requested items exist
        if (menuItems.Count != menuItemIds.Count)
        {
            return BadRequest(new
            {
                message = "One or more menu items are invalid."
            });
        }

        // Check availability
        var unavailableItem = menuItems
            .FirstOrDefault(x => !x.IsAvailable);

        if (unavailableItem != null)
        {
            return BadRequest(new
            {
                message = $"{unavailableItem.Name} is currently unavailable."
            });
        }

        // Create order
        var order = new Order
        {
            UserId = userId,
            RestaurantId = dto.RestaurantId,
            DeliveryAddress = dto.DeliveryAddress,
            Status = "Pending"
        };

        decimal totalAmount = 0;

        foreach (var requestedItem in dto.Items)
        {
            if (requestedItem.Quantity <= 0)
            {
                return BadRequest(new
                {
                    message = "Quantity must be greater than zero."
                });
            }

            var menuItem = menuItems
                .First(x => x.Id == requestedItem.MenuItemId);

            var orderItem = new OrderItem
            {
                MenuItemId = menuItem.Id,
                Quantity = requestedItem.Quantity,
                UnitPrice = menuItem.Price
            };

            order.OrderItems.Add(orderItem);

            totalAmount +=
                menuItem.Price * requestedItem.Quantity;
        }

        order.TotalAmount = totalAmount;

        _context.Orders.Add(order);

        await _context.SaveChangesAsync();

        await _hubContext.Clients
    .Group($"restaurant-{order.RestaurantId}")
    .SendAsync("NewOrderReceived", new
    {
        orderId = order.Id,
        restaurantId = order.RestaurantId,
        status = order.Status
    });

        return Ok(new
        {
            message = "Order placed successfully.",
            orderId = order.Id,
            totalAmount = order.TotalAmount,
            status = order.Status
        });
    }
    [HttpPatch("{id}/accept")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AcceptOrder(int id)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null)
        {
            return NotFound(new
            {
                message = "Order not found."
            });
        }

        if (order.Status != "Pending")
        {
            return BadRequest(new
            {
                message = $"Order cannot be accepted because its current status is '{order.Status}'."
            });
        }

        order.Status = "Accepted";

        await _context.SaveChangesAsync();

        await _hubContext.Clients.Group($"order-{order.Id}")
    .SendAsync("OrderStatusUpdated", new
    {
        orderId = order.Id,
        status = order.Status
    });

        return Ok(new
        {
            message = "Order accepted successfully.",
            orderId = order.Id,
            status = order.Status
        });
    }

    [HttpPatch("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RejectOrder(int id)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null)
        {
            return NotFound(new
            {
                message = "Order not found."
            });
        }

        if (order.Status != "Pending")
        {
            return BadRequest(new
            {
                message = $"Order cannot be rejected because its current status is '{order.Status}'."
            });
        }

        order.Status = "Rejected";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Order rejected successfully.",
            orderId = order.Id,
            status = order.Status
        });
    }

    [HttpPatch("{id}/preparing")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkPreparing(int id)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null)
        {
            return NotFound(new
            {
                message = "Order not found."
            });
        }

        if (order.Status != "Accepted")
        {
            return BadRequest(new
            {
                message = $"Order cannot be marked as preparing because its current status is '{order.Status}'."
            });
        }

        order.Status = "Preparing";

        await _context.SaveChangesAsync();

        await _hubContext.Clients.Group($"order-{order.Id}")
    .SendAsync("OrderStatusUpdated", new
    {
        orderId = order.Id,
        status = order.Status
    });

        return Ok(new
        {
            message = "Order is now being prepared.",
            orderId = order.Id,
            status = order.Status
        });
    }

    [HttpPatch("{id}/ready")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkReady(int id)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null)
        {
            return NotFound(new
            {
                message = "Order not found."
            });
        }

        if (order.Status != "Preparing")
        {
            return BadRequest(new
            {
                message = $"Order cannot be marked as ready because its current status is '{order.Status}'."
            });
        }

        order.Status = "Ready";

        await _context.SaveChangesAsync();

        await _hubContext.Clients.Group($"order-{order.Id}")
    .SendAsync("OrderStatusUpdated", new
    {
        orderId = order.Id,
        status = order.Status
    });

        return Ok(new
        {
            message = "Order is ready for pickup.",
            orderId = order.Id,
            status = order.Status
        });
    }

    [HttpPatch("{id}/assign-delivery-partner")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignDeliveryPartner(
    int id,
    AssignDeliveryPartnerDto dto)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null)
            return NotFound(new
            {
                message = "Order not found."
            });

        if (order.Status != "Ready")
            return BadRequest(new
            {
                message = $"Order cannot be assigned because its current status is '{order.Status}'."
            });

        var deliveryPartner = await _context.DeliveryPartners
            .FirstOrDefaultAsync(x => x.Id == dto.DeliveryPartnerId);

        if (deliveryPartner == null)
            return NotFound(new
            {
                message = "Delivery partner not found."
            });

        if (!deliveryPartner.IsAvailable)
            return BadRequest(new
            {
                message = "Delivery partner is currently unavailable."
            });

        order.DeliveryPartnerId = deliveryPartner.Id;
        order.Status = "Assigned";

        // Partner becomes unavailable while handling this order
        deliveryPartner.IsAvailable = false;

        await _context.SaveChangesAsync();

        await _hubContext.Clients
     .Group($"delivery-partner-{deliveryPartner.Id}")
     .SendAsync("OrderAssigned", new
     {
         orderId = order.Id,
         status = order.Status
     });

        return Ok(new
        {
            message = "Delivery partner assigned successfully.",
            orderId = order.Id,
            deliveryPartnerId = deliveryPartner.Id,
            status = order.Status
        });
    }

}