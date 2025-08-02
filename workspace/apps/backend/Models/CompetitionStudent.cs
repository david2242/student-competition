namespace Workspace.Backend.Models;

public class CompetitionStudent
{
  public int CompetitionId { get; set; }
  public Competition Competition { get; set; } = null!; // Navigation property

  public int StudentId { get; set; }
  public Student Student { get; set; } = null!; // Navigation property

  public CompetitionStudent()
  {
    // EF Core requires a parameterless constructor
  }
  
  public CompetitionStudent(int competitionId, int studentId)
  {
    CompetitionId = competitionId;
    StudentId = studentId;
  }
}
