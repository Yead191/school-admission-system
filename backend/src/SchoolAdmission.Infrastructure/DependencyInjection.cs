using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SchoolAdmission.Application.Interfaces;
using SchoolAdmission.Infrastructure.BackgroundServices;
using SchoolAdmission.Infrastructure.Persistence;

namespace SchoolAdmission.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=postgres;Port=5432;Database=school_admission;Username=postgres;Password=postgres";

        var isSqlite = connectionString.Contains(".db", StringComparison.OrdinalIgnoreCase) ||
                       connectionString.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase) ||
                       string.Equals(configuration["DB_PROVIDER"], "sqlite", StringComparison.OrdinalIgnoreCase);

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            if (isSqlite)
            {
                options.UseSqlite(connectionString);
            }
            else
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null);
                });
            }
        });

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        // Register background expiration worker
        services.AddHostedService<HoldExpirationWorker>();

        return services;
    }
}
