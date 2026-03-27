using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Workspace.Backend.Models;

namespace Workspace.Backend.Test.Integration;

[TestFixture]
[Category("Integration")]
public class ErrorHandlingIntegrationTests
{
    private BackendWebApplicationFactory _factory = null!;
    private HttpClient _client = null!;

    [SetUp]
    public void Setup()
    {
        _factory = new BackendWebApplicationFactory();
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
        content.Message.Should().NotBeNullOrEmpty();
    }
}
