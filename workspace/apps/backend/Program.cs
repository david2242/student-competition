global using Microsoft.EntityFrameworkCore;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;
using Workspace.Backend.Data;
using Workspace.Backend.Services.CompetitionService;
using Swashbuckle.AspNetCore.Filters;
using Workspace.Backend;
using Workspace.Backend.Services.AuthService;
using Workspace.Backend.Services.DatabaseInitializerService;
using Workspace.Backend.Services.KeepAliveService;
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
  options.SchemaFilter<DateOnlySchemaFilter>();
  options.AddSecurityRequirement(new OpenApiSecurityRequirement
  {
    {
      new OpenApiSecurityScheme
        {
          Reference = new OpenApiReference
            {
              Type = ReferenceType.SecurityScheme,
              Id = "oauth2"
            }
        },
      new List<string>()
    }
  });
});

var psqlHost = Environment.GetEnvironmentVariable("SQL_SERVER_HOST");
var psqlServerPassword = Environment.GetEnvironmentVariable("SQL_SERVER_PASSWORD");
var psqlServerUsername = Environment.GetEnvironmentVariable("SQL_SERVER_USERNAME");
var psqlDatabaseName = Environment.GetEnvironmentVariable("SQL_DATABASE_NAME");
var psqlServerPort = Environment.GetEnvironmentVariable("SQL_SERVER_PORT");
var connectionString =
  $"User ID={psqlServerUsername};Password={psqlServerPassword};Host={psqlHost};Port={psqlServerPort};Database={psqlDatabaseName};Pooling=true;";
builder.Services.AddDbContext<DataContext>(options => options.UseNpgsql(connectionString));

// Identity setup
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
  {
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
  })
  .AddEntityFrameworkStores<DataContext>()
  .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
  options.Cookie.HttpOnly = true;
  options.ExpireTimeSpan = TimeSpan.FromDays(7);

  options.LoginPath = string.Empty;
  options.AccessDeniedPath = string.Empty;

  options.Events = new CookieAuthenticationEvents
  {
    OnRedirectToLogin = context =>
    {
      context.Response.StatusCode = StatusCodes.Status401Unauthorized;
      return Task.CompletedTask;
    },
    OnRedirectToAccessDenied = context =>
    {
      context.Response.StatusCode = StatusCodes.Status403Forbidden;
      return Task.CompletedTask;
    }
  };

  options.SlidingExpiration = true;
  options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
  options.Cookie.SameSite = SameSiteMode.None;
});

builder.Services.AddCors(options =>
{
  options.AddPolicy(
    name: "_myAllowSpecificOrigins",
    policy =>
    {
      policy.WithOrigins(["http://localhost:4200", "https://localhost:3000"])
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

builder.Services.AddAutoMapper(typeof(AutoMapperProfile));
builder.Services.AddHostedService<KeepAliveService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICompetitionService, CompetitionService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddControllers()
  .AddJsonOptions(options =>
  {
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false));
  });

builder.Services.Configure<RouteOptions>(options => { options.LowercaseUrls = true; });

var app = builder.Build();

if (app.Environment.IsDevelopment() || Environment.GetEnvironmentVariable("SWAGGER") == "True")
{
  app.UseDeveloperExceptionPage();
  app.UseSwagger();
  app.UseSwaggerUI();
}

if (app.Environment.IsDevelopment())
{
  app.UseCors("_myAllowSpecificOrigins");
}

if (!app.Environment.IsDevelopment())
{
  app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

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
app.Run();
