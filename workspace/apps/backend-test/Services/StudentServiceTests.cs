using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MockQueryable.Moq;
using Moq;
using NUnit.Framework;
using Workspace.Backend.Data;
using Workspace.Backend.Dtos.Student;
using Workspace.Backend.Models;
using Workspace.Backend.Services.StudentService;
using Workspace.Backend.Test.Infrastructure;

namespace Workspace.Backend.Test.Services;

[TestFixture]
public class StudentServiceTests : TestBase<StudentService>
{
    private DataContext _context = null!;
    private StudentService _service = null!;

    [SetUp]
    public override void Setup()
    {
        base.Setup();
        
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            
        _context = new DataContext(options);
        // Ensure database is clean
        _context.Database.EnsureDeleted();
        _context.Database.EnsureCreated();

        _service = new StudentService(_context, Mapper, LoggerMock.Object);
    }

    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }

    [Test]
    public async Task SearchStudentsAsync_WhenRequestIsNull_ThrowsArgumentNullException()
    {
        // Act
        Func<Task> act = async () => await _service.SearchStudentsAsync(null!);

        // Assert
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Test]
    public async Task SearchStudentsAsync_WhenSearchingByName_ReturnsMatchingStudents()
    {
        // Arrange
        _context.Students.AddRange(
            new Student { Id = 1, FirstName = "John", LastName = "Doe" },
            new Student { Id = 2, FirstName = "Jane", LastName = "Smith" },
            new Student { Id = 3, FirstName = "Bob", LastName = "Brown" }
        );
        await _context.SaveChangesAsync();

        var request = new StudentSearchRequestDto { Query = "John" };

        // Act
        var result = await _service.SearchStudentsAsync(request);

        // Assert
        result.Results.Should().HaveCount(1);
        result.Results.First().FirstName.Should().Be("John");
        result.TotalCount.Should().Be(1);
    }

    [Test]
    public async Task SearchStudentsAsync_WhenFilteringByClassYear_ReturnsMatchingStudents()
    {
        // Arrange
        var student1 = new Student { Id = 1, FirstName = "John", LastName = "Doe" };
        var student2 = new Student { Id = 2, FirstName = "Jane", LastName = "Smith" };
        
        _context.Students.AddRange(student1, student2);
        
        var participant1 = new CompetitionParticipant(1, 1, 2024, "A", 2023);
        _context.CompetitionParticipants.Add(participant1);
        
        await _context.SaveChangesAsync();

        var request = new StudentSearchRequestDto { Query = "", ClassYear = 2024 };

        // Act
        var result = await _service.SearchStudentsAsync(request);

        // Assert
        result.Results.Should().HaveCount(1);
        result.Results.First().FirstName.Should().Be("John");
    }
}
