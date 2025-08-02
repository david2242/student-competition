using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Workspace.Backend.Models;

public class Student
{
  public int Id { get; set; }
  public string FirstName { get; set; } = string.Empty;
  public string LastName { get; set; } = string.Empty;
  
  [NotMapped]
  [JsonIgnore]
  public string FullName => $"{FirstName} {LastName}";

  [JsonIgnore]
  public ICollection<CompetitionParticipant> CompetitionParticipants { get; set; } = new List<CompetitionParticipant>();

  public Student()
  {
    FirstName = string.Empty;
    LastName = string.Empty;
  }
}
