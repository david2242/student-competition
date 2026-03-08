using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Workspace.Backend.Dtos.Auth;
using Workspace.Backend.Models;
using Workspace.Backend.Services.AuthService;
using Workspace.Backend.Test.Infrastructure;

namespace Workspace.Backend.Test.Services;

[TestFixture]
public class AuthServiceTests : TestBase<AuthService>
{
    private Mock<UserManager<IdentityUser>> _userManagerMock = null!;
    private Mock<SignInManager<IdentityUser>> _signInManagerMock = null!;
    private Mock<IHttpContextAccessor> _httpContextAccessorMock = null!;
    private AuthService _service = null!;

    [SetUp]
    public override void Setup()
    {
        base.Setup();

        // Setup UserManager Mock
        var userStoreMock = new Mock<IUserStore<IdentityUser>>();
        _userManagerMock = new Mock<UserManager<IdentityUser>>(userStoreMock.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        // Setup SignInManager Mock
        _signInManagerMock = new Mock<SignInManager<IdentityUser>>(
            _userManagerMock.Object,
            new Mock<IHttpContextAccessor>().Object,
            new Mock<IUserClaimsPrincipalFactory<IdentityUser>>().Object,
            null!, null!, null!, null!);

        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();

        _service = new AuthService(
            _userManagerMock.Object,
            _signInManagerMock.Object,
            _httpContextAccessorMock.Object,
            LoggerMock.Object);
    }

    [Test]
    public async Task LoginAsync_WhenCredentialsValid_ReturnsAuthResponse()
    {
        // Arrange
        var request = new LoginRequestDto { Email = "test@example.com", Password = "Password123!" };
        var user = new IdentityUser { Id = "user-123", Email = request.Email };
        
        _userManagerMock.Setup(x => x.FindByEmailAsync(request.Email)).ReturnsAsync(user);
        _signInManagerMock.Setup(x => x.PasswordSignInAsync(user, request.Password, request.RememberMe, false))
            .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Success);
        
        _userManagerMock.Setup(x => x.GetRolesAsync(user)).ReturnsAsync(new List<string> { "admin" });
        _userManagerMock.Setup(x => x.GetClaimsAsync(user)).ReturnsAsync(new List<Claim>());

        // Act
        var result = await _service.LoginAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be(request.Email);
        result.Role.Should().Be(UserRole.admin);
    }

    [Test]
    public async Task LoginAsync_WhenUserNotFound_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequestDto { Email = "nonexistent@example.com", Password = "any" };
        _userManagerMock.Setup(x => x.FindByEmailAsync(request.Email)).ReturnsAsync((IdentityUser?)null);

        // Act
        Func<Task> act = async () => await _service.LoginAsync(request);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Test]
    public async Task LoginAsync_WhenPasswordInvalid_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequestDto { Email = "test@example.com", Password = "wrong" };
        var user = new IdentityUser { Id = "user-123", Email = request.Email };
        
        _userManagerMock.Setup(x => x.FindByEmailAsync(request.Email)).ReturnsAsync(user);
        _signInManagerMock.Setup(x => x.PasswordSignInAsync(user, request.Password, request.RememberMe, false))
            .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Failed);

        // Act
        Func<Task> act = async () => await _service.LoginAsync(request);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Test]
    public async Task LogoutAsync_CallsSignOut()
    {
        // Act
        await _service.LogoutAsync();

        // Assert
        _signInManagerMock.Verify(x => x.SignOutAsync(), Times.Once);
    }

    [Test]
    public async Task GetCurrentUserAsync_WhenAuthenticated_ReturnsProfile()
    {
        // Arrange
        var user = new IdentityUser { Id = "user-123", Email = "test@example.com" };
        var context = new DefaultHttpContext();
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);
        _userManagerMock.Setup(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>())).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.GetRolesAsync(user)).ReturnsAsync(new List<string> { "viewer" });
        _userManagerMock.Setup(x => x.GetClaimsAsync(user)).ReturnsAsync(new List<Claim>());

        // Act
        var result = await _service.GetCurrentUserAsync();

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(user.Id);
        result.Role.Should().Be(UserRole.viewer);
    }
}
