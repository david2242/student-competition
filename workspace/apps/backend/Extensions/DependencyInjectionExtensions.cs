using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Workspace.Backend.Services.AuthService;
using Workspace.Backend.Services.CompetitionService;
using Workspace.Backend.Services.LanguageExamService;
using Workspace.Backend.Services.StudentService;
using Workspace.Backend.Services.UserService;

namespace Workspace.Backend.Extensions;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(AutoMapperProfile));
        services.AddHttpContextAccessor();
        services.AddRateLimiter(options =>
        {
            options.AddFixedWindowLimiter("search", policy =>
            {
                policy.Window = TimeSpan.FromMinutes(1);
                policy.PermitLimit = 30;
                policy.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                policy.QueueLimit = 0;
            });
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        });
        services.AddScoped<ICompetitionService, CompetitionService>();
        services.AddScoped<ILanguageExamService, LanguageExamService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IStudentService, StudentService>();

        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false));
            });

        services.Configure<RouteOptions>(options => { options.LowercaseUrls = true; });

        return services;
    }
}
