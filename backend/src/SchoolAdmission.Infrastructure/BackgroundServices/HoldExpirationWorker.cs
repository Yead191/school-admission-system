using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SchoolAdmission.Domain.Enums;
using SchoolAdmission.Infrastructure.Persistence;

namespace SchoolAdmission.Infrastructure.BackgroundServices;

/// <summary>
/// Background worker that periodically marks expired holds in the database.
/// This fulfills Rule 2.5: "মেয়াদ শেষ হলে seat নিজে থেকে ফেরত যাবে, কাউকে কোনো API call করতে হবে না।"
/// </summary>
public class HoldExpirationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<HoldExpirationWorker> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(5);

    public HoldExpirationWorker(IServiceProvider serviceProvider, ILogger<HoldExpirationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("HoldExpirationWorker started. Interval: {Interval}s", _checkInterval.TotalSeconds);

        using var timer = new PeriodicTimer(_checkInterval);

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await ExpireStaleHoldsAsync(stoppingToken);
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error occurred while expiring stale holds.");
            }
        }
    }

    private async Task ExpireStaleHoldsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var now = DateTime.UtcNow;

        var expiredCount = await dbContext.Holds
            .Where(h => h.Status == HoldStatus.HELD && h.ExpiresAtUtc <= now)
            .ExecuteUpdateAsync(setter => setter.SetProperty(h => h.Status, HoldStatus.EXPIRED), cancellationToken);

        if (expiredCount > 0)
        {
            _logger.LogInformation("HoldExpirationWorker expired {Count} stale hold(s) at {Time}", expiredCount, now);
        }
    }
}

