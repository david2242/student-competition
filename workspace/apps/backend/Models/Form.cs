namespace Workspace.Backend.Models;

public class Form
{
  private string _name = string.Empty;

  public int Id { get; set; }

  public string Name
  {
    get => _name;
    set => _name = value?.ToUpperInvariant() ?? string.Empty;
  }

  public string Description { get; set; }
  public ICollection<CompetitionForm> CompetitionForms { get; set; }

  public Form()
  {
    Name = string.Empty;
    Description = string.Empty;
    CompetitionForms = new List<CompetitionForm>();
  }
}

public class CompetitionForm
{
  public int CompetitionId { get; set; }
  public Competition Competition { get; set; }

  public int FormId { get; set; }
  public Form Form { get; set; }

  public CompetitionForm()
  {
    Competition = null!;
    Form = null!;
  }
}
