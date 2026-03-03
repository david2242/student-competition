---
description: Create and maintain unit tests for the .NET backend using NUnit, Moq, and FluentAssertions.
---

Follow these steps to generate or update unit tests for the backend codebase.

## 1. Setup Environment
Ensure the testing infrastructure is ready.
- Project location: `workspace/apps/backend-test/Workspace.Backend.Test.csproj`
- Base class: `Workspace.Backend.Test.Infrastructure.TestBase<T>`

## 2. Identify Target Service
Identify the service or class that needs testing.
- Locate the source file in `workspace/apps/backend/Services/`.
- Ensure it has an interface (e.g., `IStudentService`) for easier mocking if needed, although we prefer testing the implementation.

## 3. Create Test Class
Create a new test file in `workspace/apps/backend-test/Services/[ServiceName]Tests.cs`.
- Inherit from `TestBase<TService>`.
- Use the `AAA (Arrange-Act-Assert)` pattern.
- Use `InMemoryDatabase` for complex EF Core queries (preferred over mocking `DbSet`).

// turbo
## 4. Example Test Structure
Use the following template for new tests:

```csharp
[TestFixture]
public class MyServiceTests : TestBase<MyService>
{
    private DataContext _context = null!;
    private MyService _service = null!;

    [SetUp]
    public override void Setup()
    {
        base.Setup();
        
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            
        _context = new DataContext(options);
        _context.Database.EnsureCreated();

        _service = new MyService(_context, Mapper, LoggerMock.Object);
    }

    [Test]
    public async Task MethodName_Scenario_ExpectedBehavior()
    {
        // Arrange
        // Add data to _context if needed
        
        // Act
        // var result = await _service.CallMethodAsync();

        // Assert
        // result.Should().Be(...);
    }
}
```

## 5. Execute and Verify
// turbo
Run the tests using the command line:

```powershell
dotnet test workspace/apps/backend-test/Workspace.Backend.Test.csproj
```

- If tests fail, analyze the logs and fix the implementation or test logic.
- Ensure `AutoMapper` configurations are valid by running `AutoMapperTests.cs`.
