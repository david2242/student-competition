namespace Workspace.Backend.Dtos.User;

public class UpdateUserRequestDto
{
  public string Email { get; set; }
  public string OldPassword { get; set; }
  public string NewPassword { get; set; }

  public UpdateUserRequestDto()
  {
    Email = string.Empty;
    OldPassword = string.Empty;
    NewPassword = string.Empty;
  }
}
