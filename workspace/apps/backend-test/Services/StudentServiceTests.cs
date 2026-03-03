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
    public async Task SearchStudentsAsync_WhenFilteringByMultipleCriteria_ReturnsMatchingStudents()
    {
        // Arrange
        var student1 = new Student { Id = 1, FirstName = "John", LastName = "Doe" }; // Term matches, ClassYear matches, Letter matches
        var student2 = new Student { Id = 2, FirstName = "Jane", LastName = "Doe" }; // Term matches, ClassYear matches, Letter MISMATCH
        var student3 = new Student { Id = 3, FirstName = "Bob", LastName = "Brown" }; // Term MISMATCH
        
        _context.Students.AddRange(student1, student2, student3);
        
        _context.CompetitionParticipants.AddRange(
            new CompetitionParticipant(1, 1, 2024, "A", 2023),
            new CompetitionParticipant(1, 2, 2024, "B", 2023)
        );
        
        await _context.SaveChangesAsync();

        var request = new StudentSearchRequestDto 
        { 
            Query = "Doe", 
            ClassYear = 2024,
            ClassLetter = "A"
        };

        // Act
        var result = await _service.SearchStudentsAsync(request);

        // Assert
        result.Results.Should().HaveCount(1);
        result.Results.First().FirstName.Should().Be("John");
    }

    [Test]
    public async Task SearchStudentsAsync_WhenSearchingMultipleTerms_ReturnsStudentsMatchingAllTerms()
    {
        // Arrange
        _context.Students.AddRange(
            new Student { Id = 1, FirstName = "John", LastName = "Doe" },   // Matches "John" AND "Doe"
            new Student { Id = 2, FirstName = "John", LastName = "Smith" }, // Matches "John" ONLY
            new Student { Id = 3, FirstName = "Jane", LastName = "Doe" }    // Matches "Doe" ONLY
        );
        await _context.SaveChangesAsync();

        var request = new StudentSearchRequestDto { Query = "John Doe" };

        // Act
        var result = await _service.SearchStudentsAsync(request);

        // Assert
        result.Results.Should().HaveCount(1);
        result.Results.First().FirstName.Should().Be("John");
        result.Results.First().LastName.Should().Be("Doe");
    }

    [Test]
    public async Task SearchStudentsAsync_WithLimit_RespectsPagination()
    {
        // Arrange
        for (int i = 1; i <= 10; i++)
        {
            _context.Students.Add(new Student { Id = i, FirstName = $"Student{i}", LastName = "Test" });
        }
        await _context.SaveChangesAsync();

        var request = new StudentSearchRequestDto { Query = "", Limit = 5 };

        // Act
        var result = await _service.SearchStudentsAsync(request);

        // Assert
        result.Results.Should().HaveCount(5);
        result.TotalCount.Should().Be(10);
    }
}
