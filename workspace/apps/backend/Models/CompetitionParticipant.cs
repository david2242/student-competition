using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workspace.Backend.Models;

public class CompetitionParticipant
{
    public int CompetitionId { get; set; }
    public Competition Competition { get; set; } = null!;

    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    [Required]
    public int ClassYear { get; set; }

    [Required]
    [MaxLength(1)]
    public string ClassLetter { get; set; } = string.Empty;

    private int _schoolYear;
    
    [Required]
    public int SchoolYear 
    { 
        get => _schoolYear;
        private set => _schoolYear = value; // Only allow setting through constructor or methods
    }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public CompetitionParticipant(int competitionId, int studentId, int classYear, string classLetter, int schoolYear)
    {
        CompetitionId = competitionId;
        StudentId = studentId;
        ClassYear = classYear;
        ClassLetter = classLetter;
        _schoolYear = schoolYear; // Direct assignment to backing field
        CreatedAt = DateTime.UtcNow;
    }

    // Parameterless constructor for EF Core
    internal CompetitionParticipant()
    {
        // Required by EF Core
    }
}
