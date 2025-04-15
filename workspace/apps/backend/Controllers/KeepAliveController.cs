using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Workspace.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class KeepAliveController : ControllerBase
{
  [HttpHead]
  [AllowAnonymous]
  public IActionResult KeepAlive()
  {
    return Ok(new { message = "I'm alive!", timestamp = DateTime.UtcNow });
  }
}
