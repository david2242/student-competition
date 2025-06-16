using AutoMapper;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Workspace.Backend.Dtos.User;
using Workspace.Backend.Models;

namespace Workspace.Backend.Services.UserService;

public class UserService : IUserService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserService(
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<GetUserResponseDto>> GetAll()
    {
        var users = await _userManager.Users.ToListAsync();
        var userDtos = new List<GetUserResponseDto>();

        foreach (var user in users)
        {
            userDtos.Add(await MapToUserDto(user));
        }

        return userDtos;
    }

    public async Task<GetUserResponseDto> GetSingle(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID '{id}' not found.");
        }

        return await MapToUserDto(user);
    }

    public async Task<List<GetUserResponseDto>> AddUser(AddUserRequestDto newUser)
    {
        var existingUser = await _userManager.FindByEmailAsync(newUser.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"User with email '{newUser.Email}' already exists.");
        }

        var user = new IdentityUser
        {
            UserName = newUser.Email,
            Email = newUser.Email,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, newUser.Password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        await EnsureRoleExists(newUser.Role);
        var roleName = newUser.Role.ToString();
        var roleResult = await _userManager.AddToRoleAsync(user, roleName);
        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            throw new InvalidOperationException($"Failed to assign role: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
        }

        await AddUserClaimsAsync(user, newUser.FirstName, newUser.LastName);

        return await GetAll();
    }

    public async Task<List<GetUserResponseDto>> UpdateUser(string id, UpdateUserRequestDto updatedUser)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID '{id}' not found.");
        }

        if (user.Email != updatedUser.Email)
        {
            var emailCheck = await _userManager.FindByEmailAsync(updatedUser.Email);
            if (emailCheck != null && emailCheck.Id != id)
            {
                throw new InvalidOperationException($"Email '{updatedUser.Email}' is already in use.");
            }

            user.Email = updatedUser.Email;
            user.UserName = updatedUser.Email;
            user.NormalizedEmail = updatedUser.Email.ToUpper();
            user.NormalizedUserName = updatedUser.Email.ToUpper();
        }

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            throw new InvalidOperationException($"Failed to update user: {string.Join(", ", updateResult.Errors.Select(e => e.Description))}");
        }

        await UpdateUserRole(user, updatedUser.Role);
        await UpdateUserClaims(user, updatedUser.FirstName, updatedUser.LastName);

        return await GetAll();
    }

    public async Task<List<GetUserResponseDto>> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID '{id}' not found.");
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to delete user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        return await GetAll();
    }

    public async Task<UserLoginResponseDto> Login(UserLoginRequestDto request)
    {
        throw new NotImplementedException("Login functionality has been moved to AuthService");
    }

    public Task Logout()
    {
        throw new NotImplementedException("Logout functionality has been moved to AuthService");
    }

    public async Task<GetUserResponseDto> GetCurrentUser()
    {
        var user = await _userManager.GetUserAsync(_httpContextAccessor.HttpContext?.User);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }

        return await MapToUserDto(user);
    }

    private async Task<GetUserResponseDto> MapToUserDto(IdentityUser user)
    {
      var roles = await _userManager.GetRolesAsync(user);
      var claims = await _userManager.GetClaimsAsync(user);

      var role = roles.FirstOrDefault();
      if (!Enum.TryParse<UserRole>(role, true, out var userRole))
      {
        userRole = UserRole.viewer; // lowercase 'viewer' to match the enum
      }

      return new GetUserResponseDto
      {
        Id = user.Id,
        Email = user.Email ?? string.Empty,
        FirstName = claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value ?? string.Empty,
        LastName = claims.FirstOrDefault(c => c.Type == ClaimTypes.Surname)?.Value ?? string.Empty,
        Role = userRole
      };
    }

    private async Task EnsureRoleExists(UserRole role)
    {
        var roleName = role.ToString();
        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            await _roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    private async Task UpdateUserRole(IdentityUser user, UserRole newRole)
    {
      var currentRoles = await _userManager.GetRolesAsync(user);
      var roleName = newRole.ToString();

      if (currentRoles.Count == 0 || !currentRoles.Contains(roleName, StringComparer.OrdinalIgnoreCase))
      {
        // Remove from all current roles
        await _userManager.RemoveFromRolesAsync(user, currentRoles);

        // Add to new role
        await EnsureRoleExists(newRole);
        await _userManager.AddToRoleAsync(user, roleName);
      }
    }

    private async Task AddUserClaimsAsync(IdentityUser user, string firstName, string lastName)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.GivenName, firstName ?? string.Empty),
            new(ClaimTypes.Surname, lastName ?? string.Empty)
        };

        await _userManager.AddClaimsAsync(user, claims);
    }

    private async Task UpdateUserClaims(IdentityUser user, string firstName, string lastName)
    {
        var currentClaims = await _userManager.GetClaimsAsync(user);
        var givenNameClaim = currentClaims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName);
        var surnameClaim = currentClaims.FirstOrDefault(c => c.Type == ClaimTypes.Surname);

        var claimsToRemove = new List<Claim>();
        var claimsToAdd = new List<Claim>();

        if (givenNameClaim != null && givenNameClaim.Value != firstName)
        {
            claimsToRemove.Add(givenNameClaim);
            claimsToAdd.Add(new Claim(ClaimTypes.GivenName, firstName ?? string.Empty));
        }
        else if (givenNameClaim == null)
        {
            claimsToAdd.Add(new Claim(ClaimTypes.GivenName, firstName ?? string.Empty));
        }

        if (surnameClaim != null && surnameClaim.Value != lastName)
        {
            claimsToRemove.Add(surnameClaim);
            claimsToAdd.Add(new Claim(ClaimTypes.Surname, lastName ?? string.Empty));
        }
        else if (surnameClaim == null)
        {
            claimsToAdd.Add(new Claim(ClaimTypes.Surname, lastName ?? string.Empty));
        }

        if (claimsToRemove.Any())
        {
            await _userManager.RemoveClaimsAsync(user, claimsToRemove);
        }

        if (claimsToAdd.Any())
        {
            await _userManager.AddClaimsAsync(user, claimsToAdd);
        }
    }

}
