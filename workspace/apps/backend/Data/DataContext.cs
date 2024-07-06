using Workspace.Backend.Models;

namespace Workspace.Backend.Data
{
  public class DataContext : DbContext
  {
    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {
    }

    public DbSet<Competition> Competitions => Set<Competition>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      // Configure Competition to own Result
      modelBuilder.Entity<Competition>()
        .OwnsOne(c => c.Result, r =>
        {
          r.Property(p => p.Position);
          r.Property(p => p.SpecialPrize);
          r.Property(p => p.Compliment);
          r.Property(p => p.NextRound);
        });
    }
  }
}
