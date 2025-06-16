using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.User;

public class UserLoginResponseDto
{
  public string Id { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string UserName { get; set; } = string.Empty;
  public UserRole Role { get; set; } = UserRole.viewer;
}
