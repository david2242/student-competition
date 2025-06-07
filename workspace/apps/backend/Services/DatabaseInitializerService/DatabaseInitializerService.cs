using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Workspace.Backend.Services.DatabaseInitializerService;

public class DatabaseInitializerService
{
  public static async Task SeedDataAsync(UserManager<IdentityUser>? userManager, RoleManager<IdentityRole>? roleManager)
  {
    if (userManager == null || roleManager == null)
    {
      throw new NullReferenceException("UserManager or RoleManager is null");
    }

    var roles = new[] { "admin", "contributor", "viewer" };
    foreach (var role in roles)
    {
      if (!await roleManager.RoleExistsAsync(role))
      {
        await roleManager.CreateAsync(new IdentityRole(role));
      }
    }

    var adminUsers = await userManager.GetUsersInRoleAsync("admin");
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
        await userManager.AddToRoleAsync(adminUser, "admin");
      }
      else
      {
        throw new Exception($"Failed to create admin user: {result.Errors.First().Description}");
      }
    }
  }

  private static async Task CreateUserIfNotExists(UserManager<IdentityUser> userManager, string email, string userName, string password)
  {
    var user = await userManager.FindByEmailAsync(email);
    if (user == null)
    {
      user = new IdentityUser
      {
        UserName = userName,
        Email = email,
        EmailConfirmed = true
      };

      var result = await userManager.CreateAsync(user, password);
      if (result.Succeeded)
      {
        // Determine role based on email
        string role = email.Contains("contributor") ? "contributor" : "viewer";
        await userManager.AddToRoleAsync(user, role);
      }
      else
      {
        throw new Exception($"Failed to create user {email}: {result.Errors.First().Description}");
      }
    }
  }
}
