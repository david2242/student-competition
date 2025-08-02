using System;
using System.Collections.Generic;
using System.Linq;
using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.Competition;

public class GetCompetitionResponseDto
{
  public int Id { get; set; }
  public string Name { get; set; }
  public string Location { get; set; }
  public string[] Subject { get; set; }
  public string[] Teacher { get; set; }
  public DateOnly Date { get; set; }
  public string Level { get; set; }
  public string Round { get; set; }
  public string? Other { get; set; }
  public string? CreatorId { get; set; }
  public DateTime Created { get; set; }
  public DateTime? UpdatedAt { get; set; }
  public Result Result { get; set; }
  public ICollection<ParticipantDto> Participants { get; set; }
  public string[] Forms { get; set; }

  public GetCompetitionResponseDto()
  {
    Name = string.Empty;
    Location = string.Empty;
    Subject = Array.Empty<string>();
    Teacher = Array.Empty<string>();
    Date = new DateOnly();
    Level = Workspace.Backend.Models.Level.Local;
    Round = Workspace.Backend.Models.Round.School;
    Result = new Result();
    Participants = new List<ParticipantDto>();
    Forms = Array.Empty<string>();
  }
}
