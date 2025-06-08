using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Workspace.Backend.Dtos.User;
using Workspace.Backend.Models;
using Workspace.Backend.Services.UserService;

namespace Workspace.Backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class UserController : ControllerBase
  {
    private readonly IUserService _userService;
    private readonly UserManager<IdentityUser> _userManager;

    public UserController(
      IUserService userService,
      UserManager<IdentityUser> userManager
    )
    {
      _userService = userService;
      _userManager = userManager;
    }

    [HttpGet(""), Authorize(Roles = "admin")]
    public async Task<ActionResult<ServiceResponse<List<GetUserResponseDto>>>> GetAll()
    {
      var serviceResponse = new ServiceResponse<List<GetUserResponseDto>>();
      try
      {
        serviceResponse.Data = await _userService.GetAll();
        return Ok(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpGet("{id}"), Authorize(Roles = "admin")]
    public async Task<ActionResult<ServiceResponse<GetUserResponseDto>>> GetSingle(string id)
    {
      var serviceResponse = new ServiceResponse<GetUserResponseDto>();
      try
      {
        serviceResponse.Data = await _userService.GetSingle(id);
        return Ok(serviceResponse);
      }
      catch (KeyNotFoundException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return NotFound(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpPost, Authorize(Roles = "admin")]
    public async Task<ActionResult<ServiceResponse<List<GetUserResponseDto>>>> AddUser(AddUserRequestDto newUser)
    {
      var serviceResponse = new ServiceResponse<List<GetUserResponseDto>>();
      try
      {
        serviceResponse.Data = await _userService.AddUser(newUser);
        return Ok(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpPut("{id}"), Authorize(Roles = "admin")]
    public async Task<ActionResult<ServiceResponse<GetUserResponseDto>>> UpdateUser(string id,
      UpdateUserRequestDto updatedUser)
    {
      var serviceResponse = new ServiceResponse<List<GetUserResponseDto>>();
      try
      {
        serviceResponse.Data = await _userService.UpdateUser(id, updatedUser);
        return Ok(serviceResponse);
      }
      catch (KeyNotFoundException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return NotFound(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<ActionResult<ServiceResponse<List<GetUserResponseDto>>>> DeleteUser(string id)
    {
      var serviceResponse = new ServiceResponse<List<GetUserResponseDto>>();
      try
      {
        serviceResponse.Data = await _userService.DeleteUser(id);
        return Ok(serviceResponse);
      }
      catch (KeyNotFoundException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return NotFound(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
      var user = await _userManager.GetUserAsync(User);
      if (user == null) return Unauthorized();

      var roles = await _userManager.GetRolesAsync(user);

      return Ok(new
      {
        Id = user.Id,
        UserName = user.UserName,
        Email = user.Email,
        Roles = roles
      });
    }
  }
};
