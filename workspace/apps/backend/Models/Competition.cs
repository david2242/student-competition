using Microsoft.AspNetCore.Identity;

namespace Workspace.Backend.Models;

public class Competition
{
  public int Id { get; set; }
  public string Name { get; set; }
  public ICollection<CompetitionParticipant> CompetitionParticipants { get; set; }
  public string Location { get; set; }
  public string[] Subject { get; set; }
  public string[] Teacher { get; set; }
  public DateOnly Date { get; set; }
  public DateTime Created { get; set; }
  public DateTime? UpdatedAt { get; set; }
  public string Level { get; set; }
  public string Round { get; set; }
  public string[] Forms { get; set; }
  public Result Result { get; set; }
  public string? Other { get; set; }
  public string? CreatorId { get; set; }
  public virtual IdentityUser? Creator { get; set; }

  public Competition()
  {
    Name = string.Empty;
    CompetitionParticipants = new List<CompetitionParticipant>();
    Forms = Array.Empty<string>();
    Location = string.Empty;
    Subject = Array.Empty<string>();
    Teacher = Array.Empty<string>();
    Date = new DateOnly(DateTime.UtcNow.Year, 1, 1);
    Level = Workspace.Backend.Models.Level.Local;
    Round = Workspace.Backend.Models.Round.School;
    Result = new Result();
    Created = DateTime.UtcNow;
    UpdatedAt = null;
    Other = null;
    CreatorId = null;
  }
}

public class Result
{
  public int? Position { get; set; }
  public bool SpecialPrize { get; set; }
  public bool Compliment { get; set; }
  public bool NextRound { get; set; }

  public Result()
  {
    Position = null;
    SpecialPrize = false;
    Compliment = false;
    NextRound = false;
  }
}

public static class Level
{
  public const string Local    = "LOCAL";
  public const string Regional = "REGIONAL";
  public const string State    = "STATE";
  public const string National = "NATIONAL";

  public static readonly string[] All =
  {
    Local, Regional, State, National
  };
}

public static class Round
{
  public const string School      = "SCHOOL";
  public const string Regional    = "REGIONAL";
  public const string State       = "STATE";
  public const string National    = "NATIONAL";
  public const string OktvRoundOne = "OKTV_ROUND_ONE";
  public const string OktvRoundTwo = "OKTV_ROUND_TWO";
  public const string OktvFinal    = "OKTV_FINAL";

  public static readonly string[] All =
  {
    School, Regional, State, National, OktvRoundOne, OktvRoundTwo, OktvFinal
  };
}

public static class CompetitionForm
{
  public const string WRITTEN = "WRITTEN";
  public const string ORAL = "ORAL";
  public const string SPORT = "SPORT";
  public const string SUBMISSION = "SUBMISSION";

  public static readonly string[] All = 
  {
    WRITTEN, ORAL, SPORT, SUBMISSION
  };
}
