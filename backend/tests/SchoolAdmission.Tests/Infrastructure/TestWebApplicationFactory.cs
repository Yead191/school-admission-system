using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SchoolAdmission.Infrastructure.Persistence;

namespace SchoolAdmission.Tests.Infrastructure;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"test_db_{Guid.NewGuid():N}.db";
    private readonly string _connectionString;

    public TestWebApplicationFactory()
    {
        var dbPath = Path.Combine(Path.GetTempPath(), _dbName);
        _connectionString = $"Data Source={dbPath};Cache=Shared";
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove existing ApplicationDbContext descriptor
            var dbContextDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (dbContextDescriptor != null)
            {
                services.Remove(dbContextDescriptor);
            }

            // Remove existing DbContext registration
            var dbContextReg = services.SingleOrDefault(d => d.ServiceType == typeof(ApplicationDbContext));
            if (dbContextReg != null)
            {
                services.Remove(dbContextReg);
            }

            // Remove background worker during tests to avoid race conditions with time simulation
            var hostedServices = services.Where(d => d.ImplementationType?.Name == "HoldExpirationWorker").ToList();
            foreach (var hs in hostedServices)
            {
                services.Remove(hs);
            }

            // Add SQLite database for tests
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlite(_connectionString);
            });
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        // Ensure database schema is created
        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();

        return host;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        // Clean up temp database file
        try
        {
            var dbPath = Path.Combine(Path.GetTempPath(), _dbName);
            if (File.Exists(dbPath))
            {
                File.Delete(dbPath);
            }
        }
        catch
        {
            // Ignore cleanup failure
        }
    }
}

