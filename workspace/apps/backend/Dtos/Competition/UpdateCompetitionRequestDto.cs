using Workspace.Backend.Dtos.Student;
using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.Competition;

public class UpdateCompetitionRequestDto
{
  public string Name { get; set; }
  public AddStudentRequestDto[] Students { get; set; }
  public string Location { get; set; }
  public string[] Subject { get; set; }
  public string[] Teacher { get; set; }
  public DateOnly Date { get; set; }
  public string Level { get; set; }
  public string Round { get; set; }
  public string[] Forms { get; set; }
  public Result Result { get; set; }
  public string? Other { get; set; }

  public UpdateCompetitionRequestDto()
  {
    Name = string.Empty;
    Students = Array.Empty<AddStudentRequestDto>();
    Location = string.Empty;
    Subject = Array.Empty<string>();
    Teacher = Array.Empty<string>();
    Date = new DateOnly();
    Level = Workspace.Backend.Models.Level.Local;
    Round = Workspace.Backend.Models.Round.School;
    Forms = Array.Empty<string>();
    Result = new Result();
  }
}
