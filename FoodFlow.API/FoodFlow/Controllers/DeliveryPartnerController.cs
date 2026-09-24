using FoodFlow.Data;
using FoodFlow.DTOs;
using FoodFlow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FoodFlow.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace FoodFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DeliveryPartnerController : ControllerBase
{
    private readonly FoodFlowDbContext _context;
    private readonly IHubContext<OrderHub> _hubContext;
    public DeliveryPartnerController(
       FoodFlowDbContext context,
       IHubContext<OrderHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(CreateDeliveryPartnerDto dto)
    {
        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userIdClaim.Value);

        var existingPartner = await _context.DeliveryPartners
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (existingPartner != null)
        {
            return BadRequest(new
            {
                message = "You are already registered as a delivery partner."
            });
        }

        var partner = new DeliveryPartner
        {
            UserId = userId,
            VehicleType = dto.VehicleType,
            VehicleNumber = dto.VehicleNumber,
            IsAvailable = true
        };

        _context.DeliveryPartners.Add(partner);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Delivery partner registered successfully.",
            partnerId = partner.Id,
            vehicleType = partner.VehicleType,
            vehicleNumber = partner.VehicleNumber,
            isAvailable = partner.IsAvailable
        });
    }

    [HttpGet("my-profile")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userIdClaim.Value);

        var partner = await _context.DeliveryPartners
            .Where(x => x.UserId == userId)
            .Select(x => new
            {
                x.Id,
                x.UserId,
                x.VehicleType,
                x.VehicleNumber,
                x.IsAvailable,
                x.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (partner == null)
        {
            return NotFound(new
            {
                message = "Delivery partner profile not found."
            });
        }

        return Ok(partner);
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        var partner = await _context.DeliveryPartners
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (partner == null)
            return NotFound(new
            {
                message = "Delivery partner profile not found."
            });

        var orders = await _context.Orders
            .Where(x => x.DeliveryPartnerId == partner.Id)
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
                    x.Restaurant.Name,
                    x.Restaurant.Address
                },

                Items = x.OrderItems.Select(item => new
                {
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

    [HttpPatch("orders/{orderId}/accept")]
    public async Task<IActionResult> AcceptDelivery(int orderId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        var partner = await _context.DeliveryPartners
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (partner == null)
            return NotFound(new
            {
                message = "Delivery partner profile not found."
            });

        var order = await _context.Orders
            .FirstOrDefaultAsync(x =>
                x.Id == orderId &&
                x.DeliveryPartnerId == partner.Id);

        if (order == null)
            return NotFound(new
            {
                message = "Assigned order not found."
            });

        if (order.Status != "Assigned")
            return BadRequest(new
            {
                message = $"Delivery cannot be accepted because the current order status is '{order.Status}'."
            });

        order.Status = "PickedUp";

        await _context.SaveChangesAsync();

        await _hubContext.Clients.Group($"order-{order.Id}")
    .SendAsync("OrderStatusUpdated", new
    {
        orderId = order.Id,
        status = order.Status
    });

        return Ok(new
        {
            message = "Delivery accepted successfully.",
            orderId = order.Id,
            status = order.Status
        });
    }


    [HttpPatch("orders/{orderId}/on-the-way")]
    public async Task<IActionResult> MarkOnTheWay(int orderId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        var partner = await _context.DeliveryPartners
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (partner == null)
            return NotFound(new
            {
                message = "Delivery partner profile not found."
            });

        var order = await _context.Orders
            .FirstOrDefaultAsync(x =>
                x.Id == orderId &&
                x.DeliveryPartnerId == partner.Id);

        if (order == null)
            return NotFound(new
            {
                message = "Assigned order not found."
            });

        if (order.Status != "PickedUp")
            return BadRequest(new
            {
                message = $"Order cannot be marked as on the way because its current status is '{order.Status}'."
            });

        order.Status = "OnTheWay";

        await _context.SaveChangesAsync();

        var statusData = new
        {
            orderId = order.Id,
            status = order.Status
        };

        // Notify customer
        await _hubContext.Clients
            .Group($"order-{order.Id}")
            .SendAsync("OrderStatusUpdated", statusData);

        // Notify restaurant
        await _hubContext.Clients
            .Group($"restaurant-{order.RestaurantId}")
            .SendAsync("OrderStatusUpdated", statusData);

        return Ok(new
        {
            message = "Order is now on the way.",
            orderId = order.Id,
            status = order.Status
        });
    }


    [HttpPatch("orders/{orderId}/delivered")]
    public async Task<IActionResult> MarkDelivered(int orderId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        var partner = await _context.DeliveryPartners
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (partner == null)
            return NotFound(new
            {
                message = "Delivery partner profile not found."
            });

        var order = await _context.Orders
            .FirstOrDefaultAsync(x =>
                x.Id == orderId &&
                x.DeliveryPartnerId == partner.Id);

        if (order == null)
            return NotFound(new
            {
                message = "Assigned order not found."
            });

        if (order.Status != "OnTheWay")
            return BadRequest(new
            {
                message = $"Order cannot be marked as delivered because its current status is '{order.Status}'."
            });

        order.Status = "Delivered";
        order.DeliveredAt = DateTime.UtcNow;
        // Make delivery partner available again
        partner.IsAvailable = true;

        await _context.SaveChangesAsync();

        var statusData = new
        {
            orderId = order.Id,
            status = order.Status
        };

        // Notify customer
        await _hubContext.Clients
            .Group($"order-{order.Id}")
            .SendAsync("OrderStatusUpdated", statusData);

        // Notify restaurant
        await _hubContext.Clients
            .Group($"restaurant-{order.RestaurantId}")
            .SendAsync("OrderStatusUpdated", statusData);

        return Ok(new
        {
            message = "Order delivered successfully.",
            orderId = order.Id,
            status = order.Status,
            deliveryPartnerAvailable = partner.IsAvailable
        });
    }

    [HttpGet("available")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAvailableDeliveryPartners()
    {
        var partners = await _context.DeliveryPartners
            .Where(x => x.IsAvailable)
            .Select(x => new
            {
                x.Id,
                x.VehicleType,
                x.VehicleNumber
            })
            .ToListAsync();

        return Ok(partners);
    }

}