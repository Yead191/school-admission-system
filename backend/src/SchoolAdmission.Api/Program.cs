using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using SchoolAdmission.Api.Middlewares;
using SchoolAdmission.Application;
using SchoolAdmission.Domain.Entities;
using SchoolAdmission.Infrastructure;
using SchoolAdmission.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Configure port to listen on 8080 by default (per spec http://localhost:8080)
var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS");
if (string.IsNullOrEmpty(urls))
{
    builder.WebHost.UseUrls("http://+:8080");
}

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// CORS: allow frontend to make requests
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger / OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "School Admission System API",
        Version = "v1",
        Description = "Production-grade School Admission System with high-concurrency seat reservation."
    });

    c.AddSecurityDefinition("StudentIdHeader", new OpenApiSecurityScheme
    {
        Name = "X-Student-Id",
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Description = "17-digit Birth Registration Number of the student"
    });
});

// Register Application and Infrastructure layers
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

var app = builder.Build();

// Global exception handling (Ensures 4xx on business errors, never unhandled 500)
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

// Enable Swagger in all environments for ease of testing & evaluation
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "School Admission API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Auto-migrate / ensure DB created & seed default classes if empty
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Ensure database tables exist
        if (db.Database.IsRelational())
        {
            await db.Database.EnsureCreatedAsync();
        }

        // Seed initial classes if none exist
        if (!await db.Classes.AnyAsync())
        {
            logger.LogInformation("Seeding initial classes...");
            db.Classes.AddRange(
                new ClassEntity
                {
                    Id = "c_morning_6",
                    Name = "Class 6 - Morning Shift",
                    TotalSeats = 120,
                    CreatedAtUtc = DateTime.UtcNow,
                    UpdatedAtUtc = DateTime.UtcNow
                },
                new ClassEntity
                {
                    Id = "c_day_6",
                    Name = "Class 6 - Day Shift",
                    TotalSeats = 120,
                    CreatedAtUtc = DateTime.UtcNow,
                    UpdatedAtUtc = DateTime.UtcNow
                }
            );
            await db.SaveChangesAsync();
            logger.LogInformation("Seeding completed.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

app.Run();

// For WebApplicationFactory in integration tests
public partial class Program { }
