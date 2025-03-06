using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.Student;

public class AddStudentRequestDto
{
  public string Name { get; set; }
  public string Class { get; set; }

  public AddStudentRequestDto()
  {
    Name = string.Empty;
    Class = string.Empty;
  }
}
