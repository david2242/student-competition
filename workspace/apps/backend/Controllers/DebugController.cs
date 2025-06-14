using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Workspace.Backend.Controllers
{


[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
  [HttpGet("public")]
  public IActionResult Public() => Ok("Public endpoint");

  [HttpGet("protected")]
  [Authorize]
  public IActionResult Protected() => Ok("Protected endpoint");
}
}
