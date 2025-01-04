using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.Student;

public class UpdateStudentRequestDto
{
  public string Name { get; set; }
  public string Class { get; set; }

  public ICollection<CompetitionStudent> CompetitionStudents { get; set; }
  public UpdateStudentRequestDto()
  {
    Name = string.Empty;
    Class = string.Empty;
    CompetitionStudents = new List<CompetitionStudent>();
  }
}
