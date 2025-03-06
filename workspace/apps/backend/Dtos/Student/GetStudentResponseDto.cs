using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.Student;

public class GetStudentResponseDto
{
  public int Id { get; set; }

  public string Name { get; set; }
  public string Class { get; set; }

  public ICollection<CompetitionStudent> CompetitionStudents { get; set; }
  public GetStudentResponseDto()
  {
    Name = string.Empty;
    Class = string.Empty;
    CompetitionStudents = new List<CompetitionStudent>();
  }
}
