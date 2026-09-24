using FoodFlow.Data;
using FoodFlow.DTOs;
using FoodFlow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantController : ControllerBase
{
    private readonly FoodFlowDbContext _context;

    public RestaurantController(FoodFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRestaurants()
    {
        var restaurants = await _context.Restaurants
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(restaurants);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRestaurant(int id)
    {
        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(x => x.Id == id);

        if (restaurant == null)
        {
            return NotFound(new
            {
                message = "Restaurant not found."
            });
        }

        return Ok(restaurant);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateRestaurant(
        CreateRestaurantDto dto)
    {
        var restaurant = new Restaurant
        {
            Name = dto.Name,
            Description = dto.Description,
            Address = dto.Address,
            ImageUrl = dto.ImageUrl
        };

        _context.Restaurants.Add(restaurant);

        await _context.SaveChangesAsync();

        return Ok(restaurant);
    }
}