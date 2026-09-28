using FoodFlow.API.DTOs;
using FoodFlow.API.Models;
using FoodFlow.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FoodFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer")]
public class CustomerAddressController : ControllerBase
{
    private readonly FoodFlowDbContext _context;

    public CustomerAddressController(FoodFlowDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> AddAddress(CustomerAddressDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.Address))
        {
            return BadRequest(new
            {
                message = "Address is required."
            });
        }

        var existingAddress = await _context.CustomerAddresses
    .FirstOrDefaultAsync(x =>
        x.UserId == userId &&
        Math.Abs(x.Latitude - dto.Latitude) < 0.0005 &&
        Math.Abs(x.Longitude - dto.Longitude) < 0.0005);

        if (existingAddress != null)
        {
            return Conflict(new
            {
                message = "This address is already saved."
            });
        }

        if (dto.IsDefault)
        {
            var existingAddresses = await _context.CustomerAddresses
                .Where(x => x.UserId == userId)
                .ToListAsync();

            foreach (var address in existingAddresses)
            {
                address.IsDefault = false;
            }
        }

        var customerAddress = new CustomerAddress
        {
            UserId = userId,
            Address = dto.Address,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            IsDefault = dto.IsDefault
        };

        _context.CustomerAddresses.Add(customerAddress);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Address saved successfully.",
            addressId = customerAddress.Id
        });
    }
    [HttpGet]
    public async Task<IActionResult> GetAddresses()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user."
            });
        }

        var addresses = await _context.CustomerAddresses
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.IsDefault)
            .ThenByDescending(x => x.Id)
            .ToListAsync();

        return Ok(addresses);
    }
}