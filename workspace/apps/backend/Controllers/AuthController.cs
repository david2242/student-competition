using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<ServiceResponse<AuthResponseDto>>> Login(LoginRequestDto request)
    {
        var response = new ServiceResponse<AuthResponseDto>();

        try
        {
            var authResult = await _authService.LoginAsync(request);
            response.Data = authResult;
            _logger.LogInformation("User {Email} logged in successfully", request.Email);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            response.Success = false;
            response.Message = ex.Message;
            _logger.LogWarning("Login failed for user {Email}: {Message}", request.Email, ex.Message);
            return Unauthorized(response);
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = "An error occurred while processing your request.";
            _logger.LogError(ex, "Error during login for user {Email}", request.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ServiceResponse<bool>>> Logout()
    {
        var response = new ServiceResponse<bool>();

        try
        {
            await _authService.LogoutAsync();
            response.Data = true;
            response.Message = "Logged out successfully";
            _logger.LogInformation("User logged out");
            return Ok(response);
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = "An error occurred while logging out.";
            _logger.LogError(ex, "Error during logout");
            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ServiceResponse<AuthResponseDto>>> GetCurrentUser()
    {
        var response = new ServiceResponse<AuthResponseDto>();

        try
        {
            var user = await _authService.GetCurrentUserAsync();
            response.Data = user;
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            response.Success = false;
            response.Message = ex.Message;
            return Unauthorized(response);
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = "An error occurred while fetching user data.";
            _logger.LogError(ex, "Error fetching current user");
            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }
    }

    [HttpGet("check-email")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ServiceResponse<bool>>> CheckEmailInUse([FromQuery] string email)
    {
        var response = new ServiceResponse<bool>
        {
            Data = await _authService.IsEmailInUseAsync(email)
        };
        return Ok(response);
    }
}
