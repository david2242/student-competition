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
    [Test]
    public async Task AddCompetition_WhenSuccessful_CreatesCompetitionAndParticipants()
    {
        // Arrange
        var userId = "user-123";
        var user = new IdentityUser { Id = userId, UserName = "test@example.com" };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _userManagerMock.Setup(x => x.FindByIdAsync(userId)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.IsInRoleAsync(user, "admin")).ReturnsAsync(true);

        var request = new AddCompetitionRequestDto
        {
            Name = "New Competition",
            Location = "Test Loc",
            Date = DateOnly.FromDateTime(DateTime.Today),
            Participants = new List<ParticipantDto>
            {
                new() { FirstName = "New", LastName = "Student", ClassYear = 10, ClassLetter = "A" }
            }
        };

        // Act
        var result = await _service.AddCompetition(request, userId);

        // Assert
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("New Competition");
        
        var competitions = await _context.Competitions.Include(c => c.CompetitionParticipants).ToListAsync();
        competitions.Should().HaveCount(1);
        competitions[0].CompetitionParticipants.Should().HaveCount(1);
        
        var students = await _context.Students.ToListAsync();
        students.Should().HaveCount(1);
        students[0].FirstName.Should().Be("New");
    }

    [Test]
    public async Task UpdateCompetition_WhenUserIsCreator_UpdatesSuccessfully()
    {
        // Arrange
        var userId = "creator-123";
        var user = new IdentityUser { Id = userId };
        _context.Users.Add(user);

        var competition = new Competition 
        { 
            Id = 1, 
            Name = "Old Name", 
            CreatorId = userId,
            Date = DateOnly.FromDateTime(DateTime.Today)
        };
        _context.Competitions.Add(competition);
        await _context.SaveChangesAsync();

        _userManagerMock.Setup(x => x.FindByIdAsync(userId)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.IsInRoleAsync(user, "admin")).ReturnsAsync(false);

        var updateRequest = new UpdateCompetitionRequestDto
        {
            Name = "New Name",
            Date = DateOnly.FromDateTime(DateTime.Today)
        };

        // Act
        var result = await _service.UpdateCompetition(1, updateRequest, userId);

        // Assert
        result.Name.Should().Be("New Name");
        var dbComp = await _context.Competitions.FindAsync(1);
        dbComp!.Name.Should().Be("New Name");
    }

    [Test]
    public async Task UpdateCompetition_WhenUserNotCreatorAndNotAdmin_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var creatorId = "creator-123";
        var otherUserId = "other-123";
        var otherUser = new IdentityUser { Id = otherUserId };
        
        var competition = new Competition { Id = 1, CreatorId = creatorId };
        _context.Competitions.Add(competition);
        await _context.SaveChangesAsync();

        _userManagerMock.Setup(x => x.FindByIdAsync(otherUserId)).ReturnsAsync(otherUser);
        _userManagerMock.Setup(x => x.IsInRoleAsync(otherUser, "admin")).ReturnsAsync(false);

        // Act
        Func<Task> act = async () => await _service.UpdateCompetition(1, new UpdateCompetitionRequestDto(), otherUserId);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }
}
