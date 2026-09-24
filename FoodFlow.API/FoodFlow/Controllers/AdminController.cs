using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodFlow.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    [HttpGet("dashboard")]
    public IActionResult Dashboard()
    {
        return Ok(new
        {
            message = "Welcome to Admin Dashboard!",
            role = "Admin"
        });
    }
}