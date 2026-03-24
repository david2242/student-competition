namespace Workspace.Backend.Dtos.User;

using System.ComponentModel.DataAnnotations;
using Workspace.Backend.Models;

public class AddUserRequestDto
{
  [Required]
  [EmailAddress]
  public string Email { get; set; } = string.Empty;

  [Required]
  [MinLength(8)]
  public string Password { get; set; } = string.Empty;

  [Required]
  public string FirstName { get; set; } = string.Empty;

  [Required]
  public string LastName { get; set; } = string.Empty;

  public UserRole Role { get; set; } = UserRole.viewer;
}
