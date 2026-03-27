using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Workspace.Backend.Data;

namespace Workspace.Backend.Test.Integration;

internal sealed class BackendWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            ReplacePostgresWithInMemoryDatabase(services);
            RegisterTestControllers(services);
        });
    }

    private static void ReplacePostgresWithInMemoryDatabase(IServiceCollection services)
    {
        var descriptors = services
            .Where(d => d.ServiceType == typeof(DbContextOptions<DataContext>))
            .ToList();

        foreach (var descriptor in descriptors)
            services.Remove(descriptor);

        services.AddDbContext<DataContext>(options =>
            options.UseInMemoryDatabase("IntegrationTestDb"));
    }

    private static void RegisterTestControllers(IServiceCollection services)
    {
        services.AddControllers()
            .AddApplicationPart(typeof(BackendWebApplicationFactory).Assembly);
    }
}
