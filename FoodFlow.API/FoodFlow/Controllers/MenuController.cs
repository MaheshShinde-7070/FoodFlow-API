using FoodFlow.Data;
using FoodFlow.DTOs;
using FoodFlow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly FoodFlowDbContext _context;

    public MenuController(FoodFlowDbContext context)
    {
        _context = context;
    }

    // Get menu items for a restaurant
    [HttpGet("restaurant/{restaurantId}")]
    public async Task<IActionResult> GetMenu(int restaurantId)
    {
        var menu = await _context.MenuItems
            .Where(x => x.RestaurantId == restaurantId)
            .OrderBy(x => x.Category)
            .ToListAsync();

        return Ok(menu);
    }

    // Add menu item
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateMenuItem(CreateMenuItemDto dto)
    {
        var restaurantId = GetRestaurantIdFromToken();

        if (restaurantId == 0)
        {
            return Unauthorized(new
            {
                message = "Restaurant information not found in token."
            });
        }

        var restaurantExists = await _context.Restaurants
            .AnyAsync(x => x.Id == restaurantId);

        if (!restaurantExists)
        {
            return NotFound(new
            {
                message = "Restaurant not found."
            });
        }

        // Prevent admin from creating an item for another restaurant
        if (dto.RestaurantId != restaurantId)
        {
            return Forbid();
        }

        var menuItem = new MenuItem
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
            Category = dto.Category,
            RestaurantId = restaurantId
        };

        _context.MenuItems.Add(menuItem);

        await _context.SaveChangesAsync();

        return Ok(menuItem);
    }

    // Update menu item
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateMenuItem(
        int id,
        CreateMenuItemDto dto)
    {
        var restaurantId = GetRestaurantIdFromToken();

        if (restaurantId == 0)
        {
            return Unauthorized(new
            {
                message = "Restaurant information not found in token."
            });
        }

        var menuItem = await _context.MenuItems
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.RestaurantId == restaurantId);

        if (menuItem == null)
        {
            return NotFound(new
            {
                message = "Menu item not found."
            });
        }

        menuItem.Name = dto.Name;
        menuItem.Description = dto.Description;
        menuItem.Price = dto.Price;
        menuItem.ImageUrl = dto.ImageUrl;
        menuItem.Category = dto.Category;

        // RestaurantId is NOT changed.
        // A restaurant admin cannot move the item to another restaurant.

        await _context.SaveChangesAsync();

        return Ok(menuItem);
    }

    // Delete menu item
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteMenuItem(int id)
    {
        var restaurantId = GetRestaurantIdFromToken();

        if (restaurantId == 0)
        {
            return Unauthorized(new
            {
                message = "Restaurant information not found in token."
            });
        }

        var menuItem = await _context.MenuItems
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.RestaurantId == restaurantId);

        if (menuItem == null)
        {
            return NotFound(new
            {
                message = "Menu item not found."
            });
        }

        _context.MenuItems.Remove(menuItem);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Menu item deleted successfully."
        });
    }

    // Update availability
    [HttpPatch("{id}/availability")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAvailability(
        int id,
        bool isAvailable)
    {
        var restaurantId = GetRestaurantIdFromToken();

        if (restaurantId == 0)
        {
            return Unauthorized(new
            {
                message = "Restaurant information not found in token."
            });
        }

        var menuItem = await _context.MenuItems
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.RestaurantId == restaurantId);

        if (menuItem == null)
        {
            return NotFound(new
            {
                message = "Menu item not found."
            });
        }

        menuItem.IsAvailable = isAvailable;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Availability updated successfully.",
            isAvailable = menuItem.IsAvailable
        });
    }

    // Get restaurant ID from JWT
    private int GetRestaurantIdFromToken()
    {
        var restaurantIdClaim = User.FindFirst("RestaurantId")?.Value;

        if (string.IsNullOrEmpty(restaurantIdClaim))
        {
            return 0;
        }

        return int.TryParse(restaurantIdClaim, out var restaurantId)
            ? restaurantId
            : 0;
    }
}

