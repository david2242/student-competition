using System.ComponentModel.DataAnnotations.Schema;
namespace Workspace.Backend.Models;

[NotMapped]
public class Student
{
  public int Id { get; set; }
  public string Name { get; set; }
  public string Class { get; set; }

  public Student()
  {
    Name = string.Empty;
    Class = string.Empty;
  }
}
