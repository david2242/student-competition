using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.Competition;

public class GetCompetitionResponseDto
{
  public int Id { get; set; }
  public string Name { get; set; }
  public string Location { get; set; }
  public string[] Subject { get; set; }
  public string[] Teacher { get; set; }
  public string Year { get; set; }
  public DateTime Date { get; set; }
  public Level Level { get; set; }
  public Round Round { get; set; }
  public Form[] Form { get; set; }
  public Result Result { get; set; }
  public string? Other { get; set; }

  public GetCompetitionResponseDto()
  {
    Name = string.Empty;
    Location = string.Empty;
    Subject = Array.Empty<string>();
    Teacher = Array.Empty<string>();
    Year = string.Empty;
    Date = DateTime.Now;
    Level = Level.Local;
    Round = Round.School;
    Form = Array.Empty<Form>();
    Result = new Result();
  }
}
