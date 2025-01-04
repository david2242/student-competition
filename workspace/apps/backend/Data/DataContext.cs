using Workspace.Backend.Models;

namespace Workspace.Backend.Data
{
  public class DataContext : IdentityDbContext
  {
    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {
    }

    public DbSet<Competition> Competitions => Set<Competition>();
    public DbSet<Student> Students => Set<Student>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      modelBuilder.Entity<CompetitionStudent>()
        .HasKey(cs => new { cs.CompetitionId, cs.StudentId }); // Composite key

      modelBuilder.Entity<CompetitionStudent>()
        .HasOne(cs => cs.Competition)
        .WithMany(c => c.CompetitionStudents)
        .HasForeignKey(cs => cs.CompetitionId);

      modelBuilder.Entity<CompetitionStudent>()
        .HasOne(cs => cs.Student)
        .WithMany(s => s.CompetitionStudents)
        .HasForeignKey(cs => cs.StudentId);

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
