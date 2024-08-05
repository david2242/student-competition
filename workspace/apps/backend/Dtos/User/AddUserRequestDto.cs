namespace Workspace.Backend.Dtos.User;

public class AddUserRequestDto
{
  public string Email { get; set; }
  public string Password { get; set; }

  public AddUserRequestDto()
  {
    Email = string.Empty;
    Password = string.Empty;
  }
}
