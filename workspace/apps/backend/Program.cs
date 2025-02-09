global using Microsoft.EntityFrameworkCore;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using DotNetEnv;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;
using Workspace.Backend.Data;
using Workspace.Backend.Services.CompetitionService;
using Swashbuckle.AspNetCore.Filters;
using Workspace.Backend;
using Workspace.Backend.Services.DatabaseInitializerService;
using Workspace.Backend.Services.UserService;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
  Env.Load();
}

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
  options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
  {
    In = ParameterLocation.Header,
    Name = "Authorization",
    Type = SecuritySchemeType.ApiKey
  });
  options.OperationFilter<SecurityRequirementsOperationFilter>();
});

builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

var psqlHost = Environment.GetEnvironmentVariable("SQL_SERVER_HOST");
var psqlServerPassword = Environment.GetEnvironmentVariable("SQL_SERVER_PASSWORD");
var psqlServerUsername = Environment.GetEnvironmentVariable("SQL_SERVER_USERNAME");
var psqlDatabaseName = Environment.GetEnvironmentVariable("SQL_DATABASE_NAME");
var psqlServerPort = Environment.GetEnvironmentVariable("SQL_SERVER_PORT");
var connectionString = $"User ID={psqlServerUsername};Password={psqlServerPassword};Host={psqlHost};Port={psqlServerPort};Database={psqlDatabaseName};Pooling=true;";

builder.Services.AddDbContext<DataContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddCors(options =>
{
  options.AddPolicy(
    name: "_myAllowSpecificOrigins",
    policy =>
    {
      policy.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<IdentityUser>()
  .AddRoles<IdentityRole>()
  .AddEntityFrameworkStores<DataContext>();
builder.Services.AddControllers();
builder.Services.Configure<RouteOptions>(options =>
{
  options.LowercaseUrls = true;
});
builder.Services.AddScoped<ICompetitionService, CompetitionService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<UserManager<IdentityUser>>();

var app = builder.Build();

if (app.Environment.IsDevelopment() || Environment.GetEnvironmentVariable("SWAGGER") == "True")
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

if (app.Environment.IsDevelopment())
{
  app.UseCors("_myAllowSpecificOrigins");
}
app.MapGroup("/api").MapIdentityApi<IdentityUser>();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
  var context = scope.ServiceProvider.GetRequiredService<DataContext>();

  try
  {
   context.Database.Migrate();

   var userManager = scope.ServiceProvider.GetService(typeof(UserManager<IdentityUser>)) as UserManager<IdentityUser>;
   var roleManager = scope.ServiceProvider.GetService(typeof(RoleManager<IdentityRole>)) as RoleManager<IdentityRole>;
    Console.WriteLine("Seeding data");
    await DatabaseInitializerService.SeedDataAsync(userManager, roleManager);
  }
  catch (Exception e)
  {
    Console.WriteLine($"An error occurred while migrating or seeding the database: {e.Message}");
  }
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.Run();
