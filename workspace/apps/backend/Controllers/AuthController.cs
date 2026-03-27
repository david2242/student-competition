using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Workspace.Backend.Dtos.Auth;
using Workspace.Backend.Models;
using Workspace.Backend.Services.AuthService;

namespace Workspace.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        var authResult = await _authService.LoginAsync(request);
        _logger.LogInformation("User {Email} logged in successfully", request.Email);
        return Ok(new ServiceResponse<AuthResponseDto> { Data = authResult });
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        await _authService.LogoutAsync();
        _logger.LogInformation("User logged out");
        return Ok(new ServiceResponse<bool> { Data = true, Message = "Logged out successfully" });
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var user = await _authService.GetCurrentUserAsync();
        return Ok(new ServiceResponse<AuthResponseDto> { Data = user });
    }

    [HttpGet("check-email")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckEmailInUse([FromQuery] string email)
    {
        var result = await _authService.IsEmailInUseAsync(email);
        return Ok(new ServiceResponse<bool> { Data = result });
    }

    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequestDto request)
    {
        var result = await _authService.ChangePasswordAsync(request);
        _logger.LogInformation("Password changed successfully");
        return Ok(new ServiceResponse<AuthResponseDto> { Data = result });
    }

    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequestDto request)
    {
        var result = await _authService.UpdateProfileAsync(request);
        _logger.LogInformation("Profile updated successfully");
        return Ok(new ServiceResponse<AuthResponseDto> { Data = result });
    }
}
