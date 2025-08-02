using Workspace.Backend.Dtos.Student;
using Workspace.Backend.Models;
using System.ComponentModel.DataAnnotations;

namespace Workspace.Backend.Dtos.Competition;

public class UpdateCompetitionRequestDto
{
  [Required(ErrorMessage = "Competition name is required")]
  public string Name { get; set; }
  
  [Required(ErrorMessage = "At least one participant is required")]
  public ICollection<ParticipantDto> Participants { get; set; }
  
  [Required(ErrorMessage = "Location is required")]
  public string Location { get; set; }
  
  [Required(ErrorMessage = "At least one subject is required")]
  public ICollection<string> Subject { get; set; }
  
  [Required(ErrorMessage = "At least one teacher is required")]
  public ICollection<string> Teacher { get; set; }
  
  [Required(ErrorMessage = "Date is required")]
  public DateOnly Date { get; set; }
  
  [Required(ErrorMessage = "Level is required")]
  public string Level { get; set; }
  
  [Required(ErrorMessage = "Round is required")]
  public string Round { get; set; }
  
  public ICollection<string> Forms { get; set; }
  
  [Required]
  public Result Result { get; set; }
  
  public string? Other { get; set; }

  public UpdateCompetitionRequestDto()
  {
    Name = string.Empty;
    Participants = new List<ParticipantDto>();
    Location = string.Empty;
    Subject = new List<string>();
    Teacher = new List<string>();
    Date = new DateOnly();
    Level = Workspace.Backend.Models.Level.Local;
    Round = Workspace.Backend.Models.Round.School;
    Forms = new List<string>();
    Result = new Result();
  }
}
