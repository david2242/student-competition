using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Workspace.Backend.Models;

namespace Workspace.Backend.Services.DatabaseInitializerService;

public class DatabaseInitializerService
{
  public static async Task SeedDataAsync(UserManager<IdentityUser>? userManager, RoleManager<IdentityRole>? roleManager)
  {
    if (userManager == null || roleManager == null)
    {
      throw new NullReferenceException("UserManager or RoleManager is null");
    }

    foreach (UserRole role in Enum.GetValues(typeof(UserRole)))
    {
      var roleName = role.ToString();
      if (!await roleManager.RoleExistsAsync(roleName))
      {
        await roleManager.CreateAsync(new IdentityRole(roleName));
      }
    }

    var adminRoleName = UserRole.admin.ToString();
    var adminUsers = await userManager.GetUsersInRoleAsync(adminRoleName);
    if (!adminUsers.Any())
    {
      var adminUser = new IdentityUser()
      {
        UserName = "admin",
        Email = "admin@example.com",
        EmailConfirmed = true
      };

      string defaultPassword = "Admin123!";

      var result = await userManager.CreateAsync(adminUser, defaultPassword);
      if (result.Succeeded)
      {
        await userManager.AddToRoleAsync(adminUser, adminRoleName);
        await userManager.AddClaimsAsync(adminUser, new[]
        {
          new Claim(ClaimTypes.GivenName, "Admin"),
          new Claim(ClaimTypes.Surname, "User")
        });
      }
      else
      {
        throw new Exception($"Failed to create admin user: {result.Errors.First().Description}");
      }
    }
  }
}
