using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using FoodFlow.API.Models;
using FoodFlow.Data;
using FoodFlow.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly FoodFlowDbContext _context;
    private readonly IConfiguration _configuration;
    public AuthController(FoodFlowDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        // Check whether email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (existingUser != null)
        {
            return BadRequest(new
            {
                message = "Email already registered."
            });
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = passwordHash,
            Role = "Customer"
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Registration successful.",
            userId = user.Id
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        bool passwordValid = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash
        );

        if (!passwordValid)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var jwtKey = _configuration["Jwt:Key"];

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey!)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var claims = new[]
        {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Name),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim("RestaurantId",user.RestaurantId?.ToString() ?? "")
    };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                Convert.ToDouble(_configuration["Jwt:ExpiryMinutes"])
            ),
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler()
            .WriteToken(token);

        return Ok(new
        {
            message = "Login successful.",
            token = tokenString,
            user = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role
            }
        });
    }

    [HttpPost("register-delivery-partner")]
    public async Task<IActionResult> RegisterDeliveryPartner(
    CreateDeliveryPartnerDto dto)
    {
        // Check whether email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (existingUser != null)
        {
            return BadRequest(new
            {
                message = "Email already registered."
            });
        }

        // Create user with DeliveryPartner role
        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "DeliveryPartner"
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        // Create delivery partner profile
        var partner = new FoodFlow.Models.DeliveryPartner
        {
            UserId = user.Id,
            VehicleType = dto.VehicleType,
            VehicleNumber = dto.VehicleNumber,
            IsAvailable = true
        };

        _context.DeliveryPartners.Add(partner);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Delivery partner registered successfully.",
            userId = user.Id,
            partnerId = partner.Id
        });
    }
    
}
