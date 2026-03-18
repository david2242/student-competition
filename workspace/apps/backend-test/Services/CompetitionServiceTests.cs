using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using Workspace.Backend.Data;
using Workspace.Backend.Models;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Dtos.Student;
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
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
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

    // ---- SearchCompetitionsAsync tests ----

    private async Task SeedSearchData()
    {
        var student1 = new Student { Id = 1, FirstName = "Kovács", LastName = "Anna" };
        var student2 = new Student { Id = 2, FirstName = "Kiss", LastName = "Béla" };
        _context.Students.AddRange(student1, student2);

        var c1 = new Competition
        {
            Id = 10,
            Name = "OKTV Matematika",
            Subject = new[] { "Matematika" },
            Teacher = new[] { "Kovács Tanár" },
            Level = Models.Level.National,
            Round = Models.Round.National,
            Date = new DateOnly(2025, 3, 1),
            Result = new Result { Position = 1, NextRound = false }
        };
        var c2 = new Competition
        {
            Id = 11,
            Name = "Fizika verseny",
            Subject = new[] { "Fizika" },
            Teacher = new[] { "Nagy Tanár" },
            Level = Models.Level.Local,
            Round = Models.Round.School,
            Date = new DateOnly(2024, 11, 15),
            Result = new Result { NextRound = true }
        };
        var c3 = new Competition
        {
            Id = 12,
            Name = "Kémia olimpia",
            Subject = new[] { "Kémia" },
            Teacher = new[] { "Kovács Tanár" },
            Level = Models.Level.Regional,
            Round = Models.Round.Regional,
            Date = new DateOnly(2025, 1, 20),
            Result = new Result { SpecialPrize = true }
        };
        _context.Competitions.AddRange(c1, c2, c3);
        await _context.SaveChangesAsync();

        _context.CompetitionParticipants.AddRange(
            new CompetitionParticipant(10, 1, 11, "A", 2024),
            new CompetitionParticipant(11, 2, 9, "B", 2024),
            new CompetitionParticipant(12, 1, 11, "A", 2024)
        );
        await _context.SaveChangesAsync();
    }

    [Test]
    public async Task SearchCompetitions_NoFilters_ReturnsAll()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto());
        result.Should().HaveCount(3);
    }

    [Test]
    public async Task SearchCompetitions_ByName_ReturnsPartialMatch()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { Name = "mat" });
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("OKTV Matematika");
    }

    [Test]
    public async Task SearchCompetitions_BySubject_ReturnsInMemoryMatch()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { Subject = "fizik" });
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Fizika verseny");
    }

    [Test]
    public async Task SearchCompetitions_ByTeacher_ReturnsInMemoryMatch()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { Teacher = "Kovács" });
        result.Should().HaveCount(2);
    }

    [Test]
    public async Task SearchCompetitions_ByLevel_ReturnsExactMatch()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { Level = Models.Level.Local });
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Fizika verseny");
    }

    [Test]
    public async Task SearchCompetitions_ByRound_ReturnsExactMatch()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { Round = Models.Round.National });
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("OKTV Matematika");
    }

    [Test]
    public async Task SearchCompetitions_ByDateFrom_ReturnsResultsOnOrAfter()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { DateFrom = new DateOnly(2025, 1, 1) });
        result.Should().HaveCount(2);
        result.Should().NotContain(r => r.Name == "Fizika verseny");
    }

    [Test]
    public async Task SearchCompetitions_ByDateTo_ReturnsResultsOnOrBefore()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { DateTo = new DateOnly(2024, 12, 31) });
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Fizika verseny");
    }

    [Test]
    public async Task SearchCompetitions_ByStudentName_ReturnsCompetitionsWithParticipant()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { StudentName = "Kovács" });
        result.Should().HaveCount(2);
    }

    [Test]
    public async Task SearchCompetitions_ByStudentId_ReturnsCompetitionsWithParticipant()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { StudentId = 2 });
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Fizika verseny");
    }

    [Test]
    public async Task SearchCompetitions_ByNextRound_ReturnsMatchingCompetitions()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { NextRound = true });
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Fizika verseny");
    }

    [Test]
    public async Task SearchCompetitions_ByHasResult_ReturnsCompetitionsWithAnyResult()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { HasResult = true });
        result.Should().HaveCount(3);
    }

    [Test]
    public async Task SearchCompetitions_CombinedFilters_AppliesAndLogic()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto
        {
            Teacher = "Kovács",
            Level = Models.Level.National
        });
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("OKTV Matematika");
    }

    [Test]
    public async Task SearchCompetitions_IsOktv_ReturnsOnlyOktvLevelCompetitions()
    {
        await SeedSearchData();

        var oktvComp = new Competition
        {
            Id = 20,
            Name = "OKTV Fizika",
            Subject = new[] { "Fizika" },
            Teacher = new[] { "Tanár" },
            Level = Models.Level.National,
            Round = "OKTV_ROUND_TWO",
            Date = new DateOnly(2025, 2, 10),
            Result = new Result()
        };
        _context.Competitions.Add(oktvComp);
        await _context.SaveChangesAsync();

        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { IsOktv = true });
        result.Should().HaveCount(1);
        result[0].Name.Should().Be("OKTV Fizika");
    }

    [Test]
    public async Task SearchCompetitions_NoMatch_ReturnsEmptyList()
    {
        await SeedSearchData();
        var result = await _service.SearchCompetitionsAsync(new CompetitionSearchRequestDto { Name = "nonexistent-xyzzy" });
        result.Should().BeEmpty();
    }
}
