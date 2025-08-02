using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Workspace.Backend.Models;
using System.Linq;

namespace Workspace.Backend.Data
{
  public class DataContext : IdentityDbContext
  {
    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {
    }

    public DbSet<Competition> Competitions => Set<Competition>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<CompetitionParticipant> CompetitionParticipants => Set<CompetitionParticipant>();
    
    // Override SaveChanges to ensure we don't have any tracking issues
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
      // Only detach modified students, not newly added ones
      var modifiedStudents = ChangeTracker
          .Entries()
          .Where(e => e.Entity is Student && e.State == Microsoft.EntityFrameworkCore.EntityState.Modified);

      foreach (var entityEntry in modifiedStudents)
      {
          entityEntry.State = Microsoft.EntityFrameworkCore.EntityState.Detached;
      }
      
      return await base.SaveChangesAsync(cancellationToken);
    }

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

      modelBuilder.Entity<CompetitionParticipant>(entity =>
      {
        entity.HasKey(cp => new { cp.CompetitionId, cp.StudentId });

        entity.HasOne(cp => cp.Competition)
          .WithMany(c => c.CompetitionParticipants)
          .HasForeignKey(cp => cp.CompetitionId)
          .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(cp => cp.Student)
          .WithMany(s => s.CompetitionParticipants)
          .HasForeignKey(cp => cp.StudentId)
          .OnDelete(DeleteBehavior.Cascade);

        entity.Property(cp => cp.ClassLetter)
          .IsRequired()
          .HasMaxLength(1);
          
        entity.Property(cp => cp.CreatedAt)
          .IsRequired()
          .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
      });

      modelBuilder.Entity<Competition>()
        .HasOne(c => c.Creator)
        .WithMany()
        .HasForeignKey(c => c.CreatorId)
        .OnDelete(DeleteBehavior.Restrict);

      modelBuilder.Entity<Competition>()
        .Property(c => c.Forms)
        .HasConversion(
          v => string.Join(',', v),
          v => v.Split(',', StringSplitOptions.RemoveEmptyEntries),
          new ValueComparer<string[]>(
            (c1, c2) => c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToArray()
          )
        );
    }
  }
}
