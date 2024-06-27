namespace Workspace.Backend.Models;

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
