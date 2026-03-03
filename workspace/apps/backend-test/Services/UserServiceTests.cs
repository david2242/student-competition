using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Moq;
using NUnit.Framework;
using Workspace.Backend.Dtos.User;
using Workspace.Backend.Models;
using Workspace.Backend.Services.UserService;
using Workspace.Backend.Test.Infrastructure;

namespace Workspace.Backend.Test.Services;

[TestFixture]
public class UserServiceTests : TestBase<UserService>
{
    private Mock<UserManager<IdentityUser>> _userManagerMock = null!;
    private Mock<RoleManager<IdentityRole>> _roleManagerMock = null!;
    private Mock<IHttpContextAccessor> _httpContextAccessorMock = null!;
    private UserService _service = null!;

    [SetUp]
    public override void Setup()
    {
        base.Setup();

        // Setup UserManager Mock
        var userStoreMock = new Mock<IUserStore<IdentityUser>>();
        _userManagerMock = new Mock<UserManager<IdentityUser>>(userStoreMock.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        // Setup RoleManager Mock
        var roleStoreMock = new Mock<IRoleStore<IdentityRole>>();
        _roleManagerMock = new Mock<RoleManager<IdentityRole>>(roleStoreMock.Object, null!, null!, null!, null!);

        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();

        _service = new UserService(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            Mapper,
            _httpContextAccessorMock.Object);
    }

    [Test]
    public async Task GetSingle_WhenUserExists_ReturnsMappedDto()
    {
        // Arrange
        var userId = "user-123";
        var user = new IdentityUser { Id = userId, Email = "test@example.com", UserName = "test@example.com" };
        var roles = new List<string> { "admin" };
        var claims = new List<Claim>
        {
            new(ClaimTypes.GivenName, "John"),
            new(ClaimTypes.Surname, "Doe")
        };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.GetRolesAsync(user)).ReturnsAsync(roles);
        _userManagerMock.Setup(x => x.GetClaimsAsync(user)).ReturnsAsync(claims);

        // Act
        var result = await _service.GetSingle(userId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(userId);
        result.Email.Should().Be("test@example.com");
        result.FirstName.Should().Be("John");
        result.LastName.Should().Be("Doe");
        result.Role.Should().Be(UserRole.admin);
    }

    [Test]
    public async Task GetSingle_WhenUserDoesNotExist_ThrowsKeyNotFoundException()
    {
        // Arrange
        _userManagerMock.Setup(x => x.FindByIdAsync(It.IsAny<string>())).ReturnsAsync((IdentityUser?)null);

        // Act
        Func<Task> act = async () => await _service.GetSingle("non-existent");

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Test]
    public async Task AddUser_WhenUserAlreadyExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var newUser = new AddUserRequestDto { Email = "existing@example.com" };
        _userManagerMock.Setup(x => x.FindByEmailAsync(newUser.Email)).ReturnsAsync(new IdentityUser());

        // Act
        Func<Task> act = async () => await _service.AddUser(newUser);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");
    }

    [Test]
    public async Task AddUser_WhenSuccessful_ReturnsAllUsers()
    {
        // Arrange
        var newUser = new AddUserRequestDto 
        { 
            Email = "new@example.com", 
            Password = "Password123!",
            FirstName = "New",
            LastName = "User",
            Role = UserRole.contributor
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(newUser.Email)).ReturnsAsync((IdentityUser?)null);
        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<IdentityUser>(), newUser.Password))
            .ReturnsAsync(IdentityResult.Success);
        _roleManagerMock.Setup(x => x.RoleExistsAsync(It.IsAny<string>())).ReturnsAsync(true);
        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);
        _userManagerMock.Setup(x => x.AddClaimsAsync(It.IsAny<IdentityUser>(), It.IsAny<IEnumerable<Claim>>()))
            .ReturnsAsync(IdentityResult.Success);

        // Mock GetAll() behavior
        _userManagerMock.Setup(x => x.Users).Returns(new List<IdentityUser>().AsQueryable().BuildMock());

        // Act
        var result = await _service.AddUser(newUser);

        // Assert
        result.Should().NotBeNull();
        _userManagerMock.Verify(x => x.CreateAsync(It.Is<IdentityUser>(u => u.Email == newUser.Email), newUser.Password), Times.Once);
        _userManagerMock.Verify(x => x.AddToRoleAsync(It.IsAny<IdentityUser>(), UserRole.contributor.ToString()), Times.Once);
    }

    [Test]
    public async Task GetCurrentUser_WhenNotAuthenticated_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var context = new DefaultHttpContext();
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);
        _userManagerMock.Setup(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>())).ReturnsAsync((IdentityUser?)null);

        // Act
        Func<Task> act = async () => await _service.GetCurrentUser();

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }
}
