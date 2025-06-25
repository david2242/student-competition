using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Workspace.Backend.Dtos.Auth;
using Workspace.Backend.Models;

namespace Workspace.Backend.Services.AuthService;

public class AuthService : IAuthService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("Login failed: User with email {Email} not found", request.Email);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        var result = await _signInManager.PasswordSignInAsync(
            user,
            request.Password,
            request.RememberMe,
            lockoutOnFailure: false);

        if (!result.Succeeded)
        {
            _logger.LogWarning("Login failed: Invalid password for user {Email}", request.Email);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        _logger.LogInformation("User {Email} logged in successfully", user.Email);

        var roles = await _userManager.GetRolesAsync(user);
        var claims = await _userManager.GetClaimsAsync(user);

        var role = roles.FirstOrDefault();
        if (!Enum.TryParse<UserRole>(role, true, out var userRole))
        {
          userRole = UserRole.viewer;
          _logger.LogWarning("Unknown role '{Role}' for user {Email}, defaulting to Viewer", role, user.Email);
        }

        return new AuthResponseDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value ?? string.Empty,
            LastName = claims.FirstOrDefault(c => c.Type == ClaimTypes.Surname)?.Value ?? string.Empty,
            Role = userRole
        };
    }

    public async Task LogoutAsync()
    {
        await _signInManager.SignOutAsync();
        _logger.LogInformation("User logged out");
    }

    public async Task<AuthResponseDto> GetCurrentUserAsync()
    {
        if (_httpContextAccessor.HttpContext == null)
        {
            throw new UnauthorizedAccessException("No active HTTP context available");
        }
        
        var user = await _userManager.GetUserAsync(_httpContextAccessor.HttpContext.User);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var claims = await _userManager.GetClaimsAsync(user);

        var role = roles.FirstOrDefault();
        if (!Enum.TryParse<UserRole>(role, true, out var userRole))
        {
          userRole = UserRole.viewer;
        }

        return new AuthResponseDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value ?? string.Empty,
            LastName = claims.FirstOrDefault(c => c.Type == ClaimTypes.Surname)?.Value ?? string.Empty,
            Role = userRole
        };
    }

    public async Task<bool> IsEmailInUseAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        return user != null;
    }

    public async Task<AuthResponseDto> ChangePasswordAsync(ChangePasswordRequestDto request)
    {
        if (_httpContextAccessor.HttpContext == null)
        {
            throw new UnauthorizedAccessException("No active HTTP context available");
        }
        
        var user = await _userManager.GetUserAsync(_httpContextAccessor.HttpContext.User);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated");
        }

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogWarning("Failed to change password for user {UserId}: {Errors}", user.Id, errors);
            throw new InvalidOperationException($"Failed to change password: {errors}");
        }

        _logger.LogInformation("Password changed successfully for user {UserId}", user.Id);
        return await GetCurrentUserAsync();
    }

    public async Task<AuthResponseDto> UpdateProfileAsync(UpdateProfileRequestDto request)
    {
        if (_httpContextAccessor.HttpContext == null)
        {
            throw new UnauthorizedAccessException("No active HTTP context available");
        }
        
        var user = await _userManager.GetUserAsync(_httpContextAccessor.HttpContext.User);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated");
        }

        // Update email if changed
        if (user.Email != request.Email)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null && existingUser.Id != user.Id)
            {
                throw new InvalidOperationException($"Email '{request.Email}' is already in use.");
            }

            user.Email = request.Email;
            user.UserName = request.Email;
            user.NormalizedEmail = request.Email.ToUpper();
            user.NormalizedUserName = request.Email.ToUpper();
        }

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
            _logger.LogWarning("Failed to update user profile {UserId}: {Errors}", user.Id, errors);
            throw new InvalidOperationException($"Failed to update profile: {errors}");
        }

        // Update user claims for first name and last name
        var currentClaims = await _userManager.GetClaimsAsync(user);
        var givenNameClaim = currentClaims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName);
        var surnameClaim = currentClaims.FirstOrDefault(c => c.Type == ClaimTypes.Surname);

        var claimsToRemove = new List<Claim>();
        var claimsToAdd = new List<Claim>();

        if (givenNameClaim != null && givenNameClaim.Value != request.FirstName)
        {
            claimsToRemove.Add(givenNameClaim);
            claimsToAdd.Add(new Claim(ClaimTypes.GivenName, request.FirstName ?? string.Empty));
        }
        else if (givenNameClaim == null)
        {
            claimsToAdd.Add(new Claim(ClaimTypes.GivenName, request.FirstName ?? string.Empty));
        }

        if (surnameClaim != null && surnameClaim.Value != request.LastName)
        {
            claimsToRemove.Add(surnameClaim);
            claimsToAdd.Add(new Claim(ClaimTypes.Surname, request.LastName ?? string.Empty));
        }
        else if (surnameClaim == null)
        {
            claimsToAdd.Add(new Claim(ClaimTypes.Surname, request.LastName ?? string.Empty));
        }

        if (claimsToRemove.Any())
        {
            await _userManager.RemoveClaimsAsync(user, claimsToRemove);
        }

        if (claimsToAdd.Any())
        {
            await _userManager.AddClaimsAsync(user, claimsToAdd);
        }

        _logger.LogInformation("Profile updated successfully for user {UserId}", user.Id);
        return await GetCurrentUserAsync();
    }
}
