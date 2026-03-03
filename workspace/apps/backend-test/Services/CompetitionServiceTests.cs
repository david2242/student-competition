using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using Workspace.Backend.Data;
using Workspace.Backend.Models;
using Workspace.Backend.Services.CompetitionService;
using Workspace.Backend.Test.Infrastructure;

namespace Workspace.Backend.Test.Services;

[TestFixture]
public class CompetitionServiceTests : TestBase<CompetitionService>
{
    private DataContext _context = null!;
    private Mock<UserManager<IdentityUser>> _userManagerMock = null!;
    private Mock<IHttpContextAccessor> _httpContextAccessorMock = null!;
    private CompetitionService _service = null!;

    [SetUp]
    public override void Setup()
    {
        base.Setup();

        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new DataContext(options);
        _context.Database.EnsureCreated();

        // Helper to mock UserManager
        var userStoreMock = new Mock<IUserStore<IdentityUser>>();
        _userManagerMock = new Mock<UserManager<IdentityUser>>(userStoreMock.Object, null!, null!, null!, null!, null!, null!, null!, null!);
        
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();

        _service = new CompetitionService(Mapper, _context, _userManagerMock.Object, _httpContextAccessorMock.Object);
    }

    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }

    [Test]
    public async Task GetAll_WhenCompetitionsExist_ReturnsMappedDtos()
    {
        // Arrange
        var creator = new IdentityUser { Id = "user1", UserName = "creator" };
        _context.Users.Add(creator);
        
        var competition = new Competition 
        { 
            Id = 1, 
            Name = "Math Competition", 
            Date = DateOnly.FromDateTime(DateTime.Today),
            CreatorId = "user1"
        };
        _context.Competitions.Add(competition);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetAll();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Math Competition");
    }

    [Test]
    public async Task GetSingle_WhenCompetitionExists_ReturnsMappedDto()
    {
        // Arrange
        var competition = new Competition 
        { 
            Id = 1, 
            Name = "Physics Competition", 
            Date = DateOnly.FromDateTime(DateTime.Today) 
        };
        _context.Competitions.Add(competition);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetSingle(1);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Physics Competition");
    }

    [Test]
    public void GetSingle_WhenCompetitionDoesNotExist_ThrowsKeyNotFoundException()
    {
        // Act
        Func<Task> act = async () => await _service.GetSingle(999);

        // Assert
        act.Should().ThrowAsync<KeyNotFoundException>();
    }
}
