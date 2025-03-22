using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Workspace.Backend.Controllers;

[Route("api")]
public class LogOutController : ControllerBase
{
  [HttpPost("logout")]
  public async Task<IActionResult> Logout()
  {
    await HttpContext.SignOutAsync(IdentityConstants.ApplicationScheme);
    return Ok(new { message = "Logged out successfully" });
  }

}
