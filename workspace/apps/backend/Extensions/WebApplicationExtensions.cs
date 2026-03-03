using Microsoft.AspNetCore.Identity;
using Workspace.Backend.Data;
using Workspace.Backend.Services.DatabaseInitializerService;

namespace Workspace.Backend.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseSwaggerDocumentation(this WebApplication app)
    {
        if (app.Environment.IsDevelopment() || Environment.GetEnvironmentVariable("SWAGGER") == "True")
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        return app;
    }

    public static WebApplication UseApplicationMiddlewares(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseCors("_myAllowSpecificOrigins");
        }

        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
        app.MapFallbackToFile("index.html");

        app.UseDefaultFiles();
        app.UseStaticFiles();

        return app;
    }
}
