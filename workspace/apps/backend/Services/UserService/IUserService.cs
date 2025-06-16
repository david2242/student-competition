using Workspace.Backend.Dtos.User;
using Workspace.Backend.Models;

namespace Workspace.Backend.Services.UserService;

public interface IUserService
{
  Task<List<GetUserResponseDto>> GetAll();
  Task<GetUserResponseDto> GetSingle(string id);
  Task<List<GetUserResponseDto>> AddUser(AddUserRequestDto newUser);
  Task<List<GetUserResponseDto>> UpdateUser(string id, UpdateUserRequestDto updatedUser);
  Task<List<GetUserResponseDto>> DeleteUser(string id);
}
