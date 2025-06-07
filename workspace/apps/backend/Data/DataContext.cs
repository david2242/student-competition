using Microsoft.EntityFrameworkCore;
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
    public DbSet<Form> Forms { get; set; }
    public DbSet<CompetitionForm> CompetitionForms { get; set; }

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

      modelBuilder.Entity<CompetitionForm>()
        .HasKey(cf => new { cf.CompetitionId, cf.FormId });

      modelBuilder.Entity<CompetitionForm>()
        .HasOne(cf => cf.Competition)
        .WithMany(c => c.CompetitionForms)
        .HasForeignKey(cf => cf.CompetitionId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<CompetitionForm>()
        .HasOne(cf => cf.Form)
        .WithMany(f => f.CompetitionForms)
        .HasForeignKey(cf => cf.FormId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<Form>().HasData(
        new Form { Id = 1, Name = "WRITTEN", Description = "Written competition form" },
        new Form { Id = 2, Name = "ORAL", Description = "Oral competition form" },
        new Form { Id = 3, Name = "SPORT", Description = "Sport competition form" },
        new Form { Id = 4, Name = "SUBMISSION", Description = "Submission-based competition form" }
      );
    }
  }
}
