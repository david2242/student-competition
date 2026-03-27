using Microsoft.AspNetCore.Mvc;
using Workspace.Backend.Exceptions;

namespace Workspace.Backend.Test.Integration;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    [HttpGet("notfound")]
    public IActionResult GetNotFound() => throw new NotFoundException("Test NotFound Exception");

    [HttpGet("unauthorized")]
    public IActionResult GetUnauthorized() => throw new UnauthorizedAccessException("Test Unauthorized Exception");

    [HttpGet("validation")]
    public IActionResult GetValidation() => throw new ValidationException("Test Validation Exception");

    [HttpGet("error")]
    public IActionResult GetError() => throw new Exception("Test General Exception");
}
