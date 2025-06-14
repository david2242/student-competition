namespace Workspace.Backend.Dtos.User;

public class UpdateUserPasswordRequestDto
{
  public string Email { get; set; }
  public string OldPassword { get; set; }
  public string NewPassword { get; set; }

  public UpdateUserPasswordRequestDto()
  {
    Email = string.Empty;
    OldPassword = string.Empty;
    NewPassword = string.Empty;
  }
}
