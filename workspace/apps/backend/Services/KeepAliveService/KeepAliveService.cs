using Workspace.Backend.Data;

namespace Workspace.Backend.Services.KeepAliveService;
using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore;

public class KeepAliveService : BackgroundService
{
  private readonly IServiceScopeFactory _scopeFactory;

  public KeepAliveService(IServiceScopeFactory scopeFactory)
  {
    _scopeFactory = scopeFactory;
  }

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    while (!stoppingToken.IsCancellationRequested)
    {
      try
      {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DataContext>();

        await dbContext.Database.ExecuteSqlRawAsync("SELECT 1");

        Console.WriteLine($"[Keep-Alive] Request sent at {DateTime.UtcNow}");
      }
      catch (Exception ex)
      {
        Console.WriteLine($"[Keep-Alive] ERROR: {ex.Message}");
      }

      await Task.Delay(TimeSpan.FromHours(12), stoppingToken);
    }
  }
}
