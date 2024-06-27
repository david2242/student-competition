namespace Workspace.Backend.Models;

public class Competition
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

  public Competition()
  {
    Name = string.Empty;
    Location = string.Empty;
    Subject = new string[0];
    Teacher = new string[0];
    Year = string.Empty;
    Date = DateTime.Now;
    Level = Level.Local;
    Round = Round.School;
    Form = new Form[0];
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

public enum Level
{
  Local,
  State,
  Regional,
  National,
  International
}

public enum Round
{
  School,
  Regional,
  State,
  National
}

public enum Form
{
  Written,
  Oral,
  Sport,
  Submission
}
