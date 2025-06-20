using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.User;

using System.Collections.Generic;
using Workspace.Backend.Models;

public class GetUserResponseDto
{
  public string Id { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string FirstName { get; set; } = string.Empty;
  public string LastName { get; set; } = string.Empty;
  public UserRole Role { get; set; } = UserRole.viewer;
}
