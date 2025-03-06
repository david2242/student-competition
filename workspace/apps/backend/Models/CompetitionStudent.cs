namespace Workspace.Backend.Models;

public class CompetitionStudent
{
  public int CompetitionId { get; set; }
  public Competition Competition { get; set; }

  public int StudentId { get; set; }
  public Student Student { get; set; }

  public CompetitionStudent()
  {
    CompetitionId = 0;
    StudentId = 0;
  }
}
