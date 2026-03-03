using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Workspace.Backend.Exceptions;
using Workspace.Backend.Middlewares;
using Workspace.Backend.Models;

namespace Workspace.Backend.Test.Middlewares;

[TestFixture]
public class ExceptionMiddlewareTests
{
    private Mock<ILogger<ExceptionMiddleware>> _loggerMock = null!;
    private Mock<IHostEnvironment> _envMock = null!;
    private DefaultHttpContext _context = null!;

    [SetUp]
    public void Setup()
    {
        _loggerMock = new Mock<ILogger<ExceptionMiddleware>>();
        _envMock = new Mock<IHostEnvironment>();
        _context = new DefaultHttpContext();
        // Mock the response stream to capture output
        _context.Response.Body = new MemoryStream();
    }

    [Test]
    public async Task InvokeAsync_WhenNoException_CallsNext()
    {
        // Arrange
        var nextCalled = false;
        RequestDelegate next = (ctx) =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };
        var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        nextCalled.Should().BeTrue();
    }

    [Test]
    public async Task InvokeAsync_WhenNotFoundException_Returns404()
    {
        // Arrange
        RequestDelegate next = (ctx) => throw new NotFoundException("Not found");
        var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        _context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        var response = await GetResponse<ServiceResponse<object>>();
        response.Success.Should().BeFalse();
        response.Message.Should().Be("Not found");
    }

    [Test]
    public async Task InvokeAsync_WhenUnauthorizedAccessException_Returns403()
    {
        // Arrange
        RequestDelegate next = (ctx) => throw new UnauthorizedAccessException("Forbidden");
        var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        _context.Response.StatusCode.Should().Be((int)HttpStatusCode.Forbidden);
        var response = await GetResponse<ServiceResponse<object>>();
        response.Success.Should().BeFalse();
        response.Message.Should().Be("Forbidden");
    }

    [Test]
    public async Task InvokeAsync_WhenValidationException_Returns400()
    {
        // Arrange
        RequestDelegate next = (ctx) => throw new ValidationException("Invalid data");
        var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        _context.Response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        var response = await GetResponse<ServiceResponse<object>>();
        response.Success.Should().BeFalse();
        response.Message.Should().Be("Invalid data");
    }

    [Test]
    public async Task InvokeAsync_WhenGeneralException_Returns500()
    {
        // Arrange
        RequestDelegate next = (ctx) => throw new Exception("Unexpected error");
        _envMock.Setup(x => x.EnvironmentName).Returns(Environments.Production);
        var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        _context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        var response = await GetResponse<ServiceResponse<object>>();
        response.Success.Should().BeFalse();
        response.Message.Should().Be("An internal server error occurred.");
    }

    [Test]
    public async Task InvokeAsync_WhenGeneralExceptionInDevelopment_ReturnsDetailedMessage()
    {
        // Arrange
        RequestDelegate next = (ctx) => throw new Exception("Detailed error");
        _envMock.Setup(x => x.EnvironmentName).Returns(Environments.Development);
        var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        _context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        var response = await GetResponse<ServiceResponse<object>>();
        response.Success.Should().BeFalse();
        response.Message.Should().Contain("Detailed error");
    }

    private async Task<T> GetResponse<T>()
    {
        _context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(_context.Response.Body);
        var body = await reader.ReadToEndAsync();
        return JsonSerializer.Deserialize<T>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
    }
}
