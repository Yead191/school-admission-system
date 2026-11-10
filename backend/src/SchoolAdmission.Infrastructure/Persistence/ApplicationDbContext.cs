using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SchoolAdmission.Application.Interfaces;
using SchoolAdmission.Domain.Entities;
using SchoolAdmission.Domain.Enums;

namespace SchoolAdmission.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<ClassEntity> Classes => Set<ClassEntity>();
    public DbSet<HoldEntity> Holds => Set<HoldEntity>();

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        return Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task LockClassForUpdateAsync(string classId, CancellationToken cancellationToken = default)
    {
        // For PostgreSQL in production and multi-instance concurrency
        if (Database.IsNpgsql())
        {
            await Database.ExecuteSqlInterpolatedAsync(
                $"SELECT id FROM classes WHERE id = {classId} FOR UPDATE",
                cancellationToken);
        }
        else if (Database.IsSqlite())
        {
            // SQLite locks entire DB per write transaction automatically
            await Task.CompletedTask;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ClassEntity>(entity =>
        {
            entity.ToTable("classes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.TotalSeats).IsRequired();
            entity.Property(e => e.CreatedAtUtc).IsRequired();
            entity.Property(e => e.UpdatedAtUtc).IsRequired();

            entity.HasMany(e => e.Holds)
                .WithOne(e => e.Class)
                .HasForeignKey(e => e.ClassId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<HoldEntity>(entity =>
        {
            entity.ToTable("holds");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50);
            entity.Property(e => e.ClassId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.StudentId).IsRequired().HasMaxLength(17);

            entity.Property(e => e.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(e => e.ExpiresAtUtc).IsRequired();
            entity.Property(e => e.CreatedAtUtc).IsRequired();
            entity.Property(e => e.ConfirmedAtUtc);

            // High-throughput query indexes
            entity.HasIndex(e => new { e.ClassId, e.Status, e.ExpiresAtUtc })
                .HasDatabaseName("idx_holds_class_status_expires");

            entity.HasIndex(e => e.StudentId)
                .HasDatabaseName("idx_holds_student_id");
        });
    }
}
