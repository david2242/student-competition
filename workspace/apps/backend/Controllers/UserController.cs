using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Workspace.Backend.Dtos.User;
using Workspace.Backend.Models;
using Workspace.Backend.Services.UserService;

namespace Workspace.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<IActionResult> GetAll()
    {
        var result = await _userService.GetAll();
        return Ok(new ServiceResponse<List<GetUserResponseDto>> { Data = result });
    }

    [HttpGet("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> GetSingle(string id)
    {
        var result = await _userService.GetSingle(id);
        return Ok(new ServiceResponse<GetUserResponseDto> { Data = result });
    }

    [HttpPost, Authorize(Roles = "admin")]
    public async Task<IActionResult> AddUser(AddUserRequestDto newUser)
    {
        var result = await _userService.AddUser(newUser);
        return Ok(new ServiceResponse<List<GetUserResponseDto>> { Data = result });
    }

    [HttpPut("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateUser(string id, UpdateUserRequestDto updatedUser)
    {
        var result = await _userService.UpdateUser(id, updatedUser);
        return Ok(new ServiceResponse<List<GetUserResponseDto>> { Data = result });
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var result = await _userService.DeleteUser(id);
        return Ok(new ServiceResponse<List<GetUserResponseDto>> { Data = result });
    }
}
