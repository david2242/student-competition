using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Workspace.Backend.Models;

namespace Workspace.Backend.Test.Integration;

[TestFixture]
[Category("Integration")]
public class ErrorHandlingIntegrationTests
{
    private WebApplicationFactory<Program> _factory = null!;
    private HttpClient _client = null!;

    [SetUp]
    public void Setup()
    {
        _factory = new WebApplicationFactory<Program>();
        _client = _factory.CreateClient();
    }

    [TearDown]
    public void TearDown()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    [Test]
    public async Task GetNotFound_Returns404WithServiceResponse()
    {
        // Act
        var response = await _client.GetAsync("/api/test/notfound");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var content = await response.Content.ReadFromJsonAsync<ServiceResponse<object>>();
        content!.Success.Should().BeFalse();
        content.Message.Should().Be("Test NotFound Exception");
    }

    [Test]
    public async Task GetUnauthorized_Returns403WithServiceResponse()
    {
        // Act
        var response = await _client.GetAsync("/api/test/unauthorized");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        var content = await response.Content.ReadFromJsonAsync<ServiceResponse<object>>();
        content!.Success.Should().BeFalse();
        content.Message.Should().Be("Test Unauthorized Exception");
    }

    [Test]
    public async Task GetValidation_Returns400WithServiceResponse()
    {
        // Act
        var response = await _client.GetAsync("/api/test/validation");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadFromJsonAsync<ServiceResponse<object>>();
        content!.Success.Should().BeFalse();
        content.Message.Should().Be("Test Validation Exception");
    }

    [Test]
    public async Task GetGeneralError_Returns500WithServiceResponse()
    {
        // Act
        var response = await _client.GetAsync("/api/test/error");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        var content = await response.Content.ReadFromJsonAsync<ServiceResponse<object>>();
        content!.Success.Should().BeFalse();
        // Since WebApplicationFactory usually runs in Development mode by default,
        // it might return the detailed message or the generic one depending on config.
        content.Message.Should().NotBeNullOrEmpty();
    }
}
