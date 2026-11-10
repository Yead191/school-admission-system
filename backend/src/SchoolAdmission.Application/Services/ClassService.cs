using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Application.DTOs;
using SchoolAdmission.Application.Interfaces;
using SchoolAdmission.Domain.Entities;
using SchoolAdmission.Domain.Enums;
using SchoolAdmission.Domain.Exceptions;

namespace SchoolAdmission.Application.Services;

public class ClassService : IClassService
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<CreateClassRequest> _validator;

    public ClassService(IApplicationDbContext context, IValidator<CreateClassRequest> validator)
    {
        _context = context;
        _validator = validator;
    }

    public async Task<CreateClassResponse> CreateClassAsync(CreateClassRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new BadRequestException(string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)));
        }

        var classEntity = new ClassEntity
        {
            Id = $"c_{Guid.NewGuid():N}"[..10],
            Name = request.Name.Trim(),
            TotalSeats = request.TotalSeats,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _context.Classes.Add(classEntity);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateClassResponse(classEntity.Id, classEntity.Name, classEntity.TotalSeats);
    }

    public async Task<IReadOnlyList<ClassDetailResponse>> GetAllClassesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var classes = await _context.Classes
            .AsNoTracking()
            .Include(c => c.Holds)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        var result = new List<ClassDetailResponse>(classes.Count);

        foreach (var cls in classes)
        {
            var confirmedCount = cls.Holds.Count(h => h.Status == HoldStatus.CONFIRMED);
            var heldCount = cls.Holds.Count(h => h.Status == HoldStatus.HELD && h.ExpiresAtUtc > now);
            var availableCount = Math.Max(0, cls.TotalSeats - (confirmedCount + heldCount));

            result.Add(new ClassDetailResponse(
                cls.Id,
                cls.Name,
                cls.TotalSeats,
                heldCount,
                confirmedCount,
                availableCount
            ));
        }

        return result;
    }

    public async Task<ClassDetailResponse> GetClassByIdAsync(string classId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var cls = await _context.Classes
            .AsNoTracking()
            .Include(c => c.Holds)
            .FirstOrDefaultAsync(c => c.Id == classId, cancellationToken);

        if (cls == null)
        {
            throw new NotFoundException($"Class with id '{classId}' not found.");
        }

        var confirmedCount = cls.Holds.Count(h => h.Status == HoldStatus.CONFIRMED);
        var heldCount = cls.Holds.Count(h => h.Status == HoldStatus.HELD && h.ExpiresAtUtc > now);
        var availableCount = Math.Max(0, cls.TotalSeats - (confirmedCount + heldCount));

        return new ClassDetailResponse(
            cls.Id,
            cls.Name,
            cls.TotalSeats,
            heldCount,
            confirmedCount,
            availableCount
        );
    }
}
