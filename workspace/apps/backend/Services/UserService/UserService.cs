using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Workspace.Backend.Dtos.User;

namespace Workspace.Backend.Services.UserService;

public class UserService : IUserService
{
  private UserManager<IdentityUser> _userManager;
  private readonly IMapper _mapper;

  public UserService(
    UserManager<IdentityUser> userManager,
    IMapper mapper)
  {
    _userManager = userManager;
    _mapper = mapper;
  }

  public async Task<List<GetUserResponseDto>> GetAll()
  {
    var users = await _userManager.Users.ToListAsync();
    foreach (var user in users)
    {
      Console.WriteLine("User:");
      Console.WriteLine($"UserName: {user.UserName}");
      Console.WriteLine($"Email: {user.Email}");
    }
    return users.Select(c => _mapper.Map<GetUserResponseDto>(c)).ToList();
  }

  public async Task<GetUserResponseDto> GetSingle(string id)
  {
    var user = await _userManager.FindByIdAsync(id);
    if (user == null)
    {
      throw new KeyNotFoundException($"User with id '{id}' was not found");
    }
    return _mapper.Map<GetUserResponseDto>(user);
  }

  public async Task<List<GetUserResponseDto>> AddUser(AddUserRequestDto newUser)
  {
    // var user = _mapper.Map<IdentityUser>(newUser);
    // TODO: Check if mapping is correct
    var user = new IdentityUser()
    {
      UserName = newUser.Email,
      Email = string.Empty,
    };
    var result = await _userManager.CreateAsync(user, newUser.Password);
    if (result.Succeeded)
    {
      await _userManager.AddToRoleAsync(user, "user");
    }
    else
    {
      throw new Exception($"Failed to create user: {result.Errors.First().Description}");
    }

    var updatedUsers = await _userManager.Users.ToListAsync();
    return updatedUsers.Select(c => _mapper.Map<GetUserResponseDto>(c)).ToList();
  }

  public async Task<List<GetUserResponseDto>> UpdateUser(string id, UpdateUserRequestDto updatedUser)
  {
    var user = await _userManager.FindByIdAsync(id);
    if (user == null)
    {
      throw new KeyNotFoundException($"User with id '{id}' was not found");
    }

    user.UserName = updatedUser.Email;
    var result = await _userManager.UpdateAsync(user);
    if (result.Succeeded)
    {
      await _userManager.AddToRoleAsync(user, "user");
    }
    else
    {
      throw new Exception($"Failed to update user: {result.Errors.First().Description}");
    }

    if (updatedUser.OldPassword != String.Empty || updatedUser.NewPassword != String.Empty)
    {
      result = await _userManager.ChangePasswordAsync(user, updatedUser.OldPassword, updatedUser.NewPassword);
      if (!result.Succeeded)
      {
        throw new Exception($"Failed to change password: {result.Errors.First().Description}");
      }
    }

    var updatedUsers = await _userManager.Users.ToListAsync();
    return updatedUsers.Select(c => _mapper.Map<GetUserResponseDto>(c)).ToList();
  }

  public async Task<List<GetUserResponseDto>> DeleteUser(string id)
  {
    var user = await _userManager.FindByIdAsync(id);
    if (user == null)
    {
      throw new KeyNotFoundException($"User with id '{id}' was not found");
    }

    await _userManager.DeleteAsync(user);

    var updatedUsers = await _userManager.Users.ToListAsync();
    return updatedUsers.Select(c => _mapper.Map<GetUserResponseDto>(c)).ToList();
  }

}
