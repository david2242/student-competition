using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Workspace.Backend.Models;
using Workspace.Backend.Exceptions;

namespace Workspace.Backend.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new ServiceResponse<object>
        {
            Success = false,
            Message = exception.Message
        };

        switch (exception)
        {
            case System.Collections.Generic.KeyNotFoundException:
            case Workspace.Backend.Exceptions.NotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;
            case System.UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                break;
            case Workspace.Backend.Exceptions.ValidationException:
            case System.ComponentModel.DataAnnotations.ValidationException:
            case System.ArgumentException:
            case System.InvalidOperationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;
            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                if (!_env.IsDevelopment())
                {
                    response.Message = "An internal server error occurred.";
                }
                break;
        }

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(response, options);

        await context.Response.WriteAsync(json);
    }
}
