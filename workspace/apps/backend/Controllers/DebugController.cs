using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workspace.Backend.Exceptions;

namespace Workspace.Backend.Controllers;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    [HttpGet("public")]
    public IActionResult Public() => Ok("Public endpoint");

    [HttpGet("protected")]
    [Authorize]
    public IActionResult Protected() => Ok("Protected endpoint");

    [HttpGet("notfound")]
    public IActionResult ThrowNotFound()
    {
        throw new NotFoundException("Test NotFound Exception");
    }

    [HttpGet("unauthorized")]
    public IActionResult ThrowUnauthorized()
    {
        throw new UnauthorizedAccessException("Test Unauthorized Exception");
    }

    [HttpGet("validation")]
    public IActionResult ThrowValidation()
    {
        throw new ValidationException("Test Validation Exception");
    }

    [HttpGet("error")]
    public IActionResult ThrowGeneral()
    {
        throw new Exception("Test General Exception");
    }
}
