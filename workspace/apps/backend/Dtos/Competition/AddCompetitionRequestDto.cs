using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.Competition;

public class AddCompetitionRequestDto
{
  public string Name { get; set; }
  public string Location { get; set; }
  public string[] Subject { get; set; }
  public string[] Teacher { get; set; }
  public DateOnly Date { get; set; }
  public Level Level { get; set; }
  public Round Round { get; set; }
  public Form[] Form { get; set; }
  public Result Result { get; set; }
  public string? Other { get; set; }

  public AddCompetitionRequestDto()
  {
    Name = string.Empty;
    Location = string.Empty;
    Subject = Array.Empty<string>();
    Teacher = Array.Empty<string>();
    Date = new DateOnly();
    Level = Level.Local;
    Round = Round.School;
    Form = Array.Empty<Form>();
    Result = new Result();
  }
}
