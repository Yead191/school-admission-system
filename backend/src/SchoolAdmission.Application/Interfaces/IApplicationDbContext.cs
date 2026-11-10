using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SchoolAdmission.Domain.Entities;

namespace SchoolAdmission.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<ClassEntity> Classes { get; }
    DbSet<HoldEntity> Holds { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task LockClassForUpdateAsync(string classId, CancellationToken cancellationToken = default);
}
