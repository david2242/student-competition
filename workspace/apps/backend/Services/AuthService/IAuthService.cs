using Workspace.Backend.Dtos.Auth;

namespace Workspace.Backend.Services.AuthService;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task LogoutAsync();
    Task<AuthResponseDto> GetCurrentUserAsync();
    Task<bool> IsEmailInUseAsync(string email);
    Task<AuthResponseDto> ChangePasswordAsync(ChangePasswordRequestDto request);
    Task<AuthResponseDto> UpdateProfileAsync(UpdateProfileRequestDto request);
}
