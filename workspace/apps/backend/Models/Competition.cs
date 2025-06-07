namespace Workspace.Backend.Models;

public class Competition
{
  public int Id { get; set; }
  public string Name { get; set; }
  public List<CompetitionStudent> CompetitionStudents { get; set; }
  public string Location { get; set; }
  public string[] Subject { get; set; }
  public string[] Teacher { get; set; }
  public DateOnly Date { get; set; }
  public DateTime Created { get; set; }
  public string Level { get; set; }
  public string Round { get; set; }
  public ICollection<CompetitionForm> CompetitionForms { get; set; }
  public Result Result { get; set; }
  public string? Other { get; set; }

  public Competition()
  {
    Name = string.Empty;
    CompetitionStudents = new List<CompetitionStudent>();
    CompetitionForms = new List<CompetitionForm>();
    Location = string.Empty;
    Subject = Array.Empty<string>();
    Teacher = Array.Empty<string>();
    Date = new DateOnly();
    Level = Workspace.Backend.Models.Level.Local;
    Round = Workspace.Backend.Models.Round.School;
    Result = new Result();
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
  public const string Local = nameof(Local);
  public const string State = nameof(State);
  public const string Regional = nameof(Regional);
  public const string National = nameof(National);
  public const string International = nameof(International);
  public const string OktvRoundOne = nameof(OktvRoundOne);
  public const string OktvRoundTwo = nameof(OktvRoundTwo);
  public const string OktvFinal = nameof(OktvFinal);

  public static readonly string[] All = 
  {
    Local, State, Regional, National, International, OktvRoundOne, OktvRoundTwo, OktvFinal
  };
}

public static class Round
{
  public const string School = nameof(School);
  public const string Regional = nameof(Regional);
  public const string State = nameof(State);
  public const string National = nameof(National);

  public static readonly string[] All = 
  {
    School, Regional, State, National
  };
}

public static class CompetitionFormType
{
  public const string Written = nameof(Written);
  public const string Oral = nameof(Oral);
  public const string Sport = nameof(Sport);
  public const string Submission = nameof(Submission);

  public static readonly string[] All = 
  {
    Written, Oral, Sport, Submission
  };
}
