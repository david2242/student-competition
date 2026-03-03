global using Microsoft.EntityFrameworkCore;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using DotNetEnv;
using Workspace.Backend.Extensions;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    Env.Load();
}

// Add services to the container.
builder.Services
    .AddSwaggerDocumentation()
    .AddDatabaseContext(builder.Configuration)
    .AddIdentityServices()
    .AddCorsPolicy()
    .AddApplicationServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwaggerDocumentation();
app.UseApplicationMiddlewares();

await app.InitializeDatabaseAsync();

app.Run();
