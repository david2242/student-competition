global using Microsoft.EntityFrameworkCore;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi.Models;
using Workspace.Backend.Data;
using Workspace.Backend.Services.CompetitionService;
using Swashbuckle.AspNetCore.Filters;
using Workspace.Backend;
using Workspace.Backend.Services.DatabaseInitializerService;
using Workspace.Backend.Services.UserService;

var builder = WebApplication.CreateBuilder(args);

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

var sqlServerIp = Environment.GetEnvironmentVariable("SQL_SERVER_IP");
var sqlServerPassword = Environment.GetEnvironmentVariable("SQL_SERVER_PASSWORD");
var connectionString = $"Server={sqlServerIp};Database=competition;Trusted_Connection=False;TrustServerCertificate=True;User Id=sa;Password={sqlServerPassword};";

if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
{
  connectionString =  builder.Configuration.GetConnectionString("DefaultConnection");
}

builder.Services.AddDbContext<DataContext>(options => options.UseSqlServer(connectionString));
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

var url = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://localhost:5000";
builder.WebHost.UseUrls(url);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapIdentityApi<IdentityUser>();
app.UseHttpsRedirection();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
	var context = scope.ServiceProvider.GetRequiredService<DataContext>();
	context.Database.Migrate();

  try
  {
    var userManager = scope.ServiceProvider.GetService(typeof(UserManager<IdentityUser>)) as UserManager<IdentityUser>;
    var roleManager = scope.ServiceProvider.GetService(typeof(RoleManager<IdentityRole>)) as RoleManager<IdentityRole>;
    Console.WriteLine("Seeding data");
    await DatabaseInitializerService.SeedDataAsync(userManager, roleManager);
  }
  catch (Exception e)
  {
    Console.WriteLine(e.Message);
  }
}

if (app.Environment.IsDevelopment() || Environment.GetEnvironmentVariable("SWAGGER") == "True")
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
  FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, "wwwroot"))
});

app.MapControllers();

app.Run();
