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
    public DbSet<CompetitionStudent> CompetitionStudent { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      modelBuilder.Entity<Competition>()
        .OwnsOne(c => c.Result, r =>
        {
          r.Property(p => p.Position);
          r.Property(p => p.SpecialPrize);
          r.Property(p => p.Compliment);
          r.Property(p => p.NextRound);
        });

      modelBuilder.Entity<CompetitionStudent>()
        .HasKey(cs => new { cs.CompetitionId, cs.StudentId });

      modelBuilder.Entity<CompetitionStudent>()
        .HasOne(cs => cs.Competition)
        .WithMany(c => c.CompetitionStudents)
        .HasForeignKey(cs => cs.CompetitionId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<CompetitionStudent>()
        .HasOne(cs => cs.Student)
        .WithMany(s => s.CompetitionStudents)
        .HasForeignKey(cs => cs.StudentId)
        .OnDelete(DeleteBehavior.Cascade);
    }
  }
}
