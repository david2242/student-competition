using System.ComponentModel.DataAnnotations;
using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.Student;

public class AddStudentRequestDto
{
  [Required(ErrorMessage = "First name is required")]
  public string FirstName { get; set; }
  
  [Required(ErrorMessage = "Last name is required")]
  public string LastName { get; set; }

  public AddStudentRequestDto()
  {
    FirstName = string.Empty;
    LastName = string.Empty;
  }
}
