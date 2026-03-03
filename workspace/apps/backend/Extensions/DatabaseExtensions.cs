using Microsoft.AspNetCore.Identity;
using Workspace.Backend.Data;
using Workspace.Backend.Services.DatabaseInitializerService;

namespace Workspace.Backend.Extensions;

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabaseContext(this IServiceCollection services, IConfiguration configuration)
    {
        var psqlHost = Environment.GetEnvironmentVariable("SQL_SERVER_HOST");
        var psqlServerPassword = Environment.GetEnvironmentVariable("SQL_SERVER_PASSWORD");
        var psqlServerUsername = Environment.GetEnvironmentVariable("SQL_SERVER_USERNAME");
        var psqlDatabaseName = Environment.GetEnvironmentVariable("SQL_DATABASE_NAME");
        var psqlServerPort = Environment.GetEnvironmentVariable("SQL_SERVER_PORT");
        var connectionString =
            $"User ID={psqlServerUsername};Password={psqlServerPassword};Host={psqlHost};Port={psqlServerPort};Database={psqlDatabaseName};Pooling=true;";
        
        services.AddDbContext<DataContext>(options => options.UseNpgsql(connectionString));

        return services;
    }

    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DataContext>();

        try
        {
            context.Database.Migrate();

            var userManager = scope.ServiceProvider.GetService(typeof(UserManager<IdentityUser>)) as UserManager<IdentityUser>;
            var roleManager = scope.ServiceProvider.GetService(typeof(RoleManager<IdentityRole>)) as RoleManager<IdentityRole>;
            
            Console.WriteLine("Seeding data");
            await DatabaseInitializerService.SeedDataAsync(userManager, roleManager);
        }
        catch (Exception e)
        {
            Console.WriteLine($"An error occurred while migrating or seeding the database: {e.Message}");
        }
    }
}
