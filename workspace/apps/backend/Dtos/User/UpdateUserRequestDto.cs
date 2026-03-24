namespace Workspace.Backend.Dtos.User;

using System.ComponentModel.DataAnnotations;
using Workspace.Backend.Models;

public class UpdateUserRequestDto
{
  [Required]
  [EmailAddress]
  public string Email { get; set; } = string.Empty;

  [MinLength(8)]
  public string? Password { get; set; }

  [Required]
  public string FirstName { get; set; } = string.Empty;

  [Required]
  public string LastName { get; set; } = string.Empty;

  public UserRole Role { get; set; } = UserRole.viewer;
}
