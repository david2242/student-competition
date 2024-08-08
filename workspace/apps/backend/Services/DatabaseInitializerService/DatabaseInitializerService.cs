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

    var roles = new[] { "admin", "user" };
    foreach (var role in roles)
    {
      if (!await roleManager.RoleExistsAsync(role))
      {
        await roleManager.CreateAsync(new IdentityRole(role));
      }
    }

    var adminUsers = await userManager.GetUsersInRoleAsync("admin");
    if (adminUsers.Any())
    {
      return;
    }

    var adminUser = new IdentityUser()
    {
      UserName = "admin",
      Email = string.Empty,
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
