using Workspace.Backend.Models;

namespace Workspace.Backend.Dtos.User;

public class GetUserResponseDto
{
  public string Id { get; set; }
  public string Email { get; set; }

  public GetUserResponseDto()
  {
    Id = string.Empty;
    Email = string.Empty;
  }
}
