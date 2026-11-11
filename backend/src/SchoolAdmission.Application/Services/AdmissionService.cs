using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SchoolAdmission.Application.DTOs;
using SchoolAdmission.Application.Interfaces;
using SchoolAdmission.Application.Validators;
using SchoolAdmission.Domain.Entities;
using SchoolAdmission.Domain.Enums;
using SchoolAdmission.Domain.Exceptions;

namespace SchoolAdmission.Application.Services;

public class AdmissionService : IAdmissionService
{
    private readonly IApplicationDbContext _context;
    private readonly int _holdDurationSeconds;

    public AdmissionService(IApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;

        // Default 600 seconds as specified in rule 2.5
        var envSecondsStr = configuration["HOLD_DURATION_SECONDS"];
        if (int.TryParse(envSecondsStr, out var parsed) && parsed > 0)
        {
            _holdDurationSeconds = parsed;
        }
        else
        {
            _holdDurationSeconds = 600;
        }
    }

    public async Task<HoldCreatedResponse> CreateHoldAsync(string classId, string studentId, CancellationToken cancellationToken = default)
    {
        if (!StudentIdValidator.IsValid(studentId))
        {
            throw new BadRequestException("Student ID must be a valid 17-digit birth registration number.");
        }

        // Start ACID transaction to protect against concurrent race conditions
        await using var transaction = await _context.BeginTransactionAsync(cancellationToken);

        // Lock class row at DB level (Pessimistic concurrency / SELECT FOR UPDATE)
        await _context.LockClassForUpdateAsync(classId, cancellationToken);

        var classEntity = await _context.Classes
            .Include(c => c.Holds)
            .FirstOrDefaultAsync(c => c.Id == classId, cancellationToken);

        if (classEntity == null)
        {
            throw new NotFoundException($"Class with id '{classId}' not found.");
        }

        var now = DateTime.UtcNow;

        // Rule 3: A student cannot have more than one active hold or confirmed admission in the same class
        var existingActiveOrConfirmed = classEntity.Holds.Any(h =>
            h.StudentId == studentId &&
            (h.Status == HoldStatus.CONFIRMED ||
             (h.Status == HoldStatus.HELD && h.ExpiresAtUtc > now)));

        if (existingActiveOrConfirmed)
        {
            throw new ConflictException("Student already has an active hold or confirmed admission in this class.");
        }

        // Rule 1: Under no circumstance can held + confirmed exceed totalSeats
        var confirmedSeats = classEntity.Holds.Count(h => h.Status == HoldStatus.CONFIRMED);
        var heldSeats = classEntity.Holds.Count(h => h.Status == HoldStatus.HELD && h.ExpiresAtUtc > now);
        var availableSeats = classEntity.TotalSeats - (confirmedSeats + heldSeats);

        if (availableSeats <= 0)
        {
            throw new ConflictException("No seats available for this class.");
        }

        var expiresAt = now.AddSeconds(_holdDurationSeconds);
        var hold = new HoldEntity
        {
            Id = $"h_{Guid.NewGuid():N}"[..10],
            ClassId = classId,
            StudentId = studentId,
            Status = HoldStatus.HELD,
            ExpiresAtUtc = expiresAt,
            CreatedAtUtc = now
        };

        _context.Holds.Add(hold);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new HoldCreatedResponse(
            hold.Id,
            hold.ClassId,
            hold.StudentId,
            hold.Status.ToString(),
            hold.ExpiresAtUtc
        );
    }

    public async Task<HoldStatusResponse> GetHoldStatusAsync(string holdId, CancellationToken cancellationToken = default)
    {
        var hold = await _context.Holds
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

        if (hold == null)
        {
            throw new NotFoundException($"Hold with id '{holdId}' not found.");
        }

        var now = DateTime.UtcNow;
        var effectiveStatus = hold.GetEffectiveStatus(now);

        return new HoldStatusResponse(
            hold.Id,
            hold.ClassId,
            effectiveStatus.ToString(),
            hold.ExpiresAtUtc
        );
    }

    public async Task<ConfirmHoldResponse> ConfirmHoldAsync(string holdId, string studentId, CancellationToken cancellationToken = default)
    {
        if (!StudentIdValidator.IsValid(studentId))
        {
            throw new BadRequestException("Student ID must be a valid 17-digit birth registration number.");
        }

        await using var transaction = await _context.BeginTransactionAsync(cancellationToken);

        var hold = await _context.Holds
            .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

        if (hold == null)
        {
            throw new NotFoundException($"Hold with id '{holdId}' not found.");
        }

        // Rule 4: Only the student's own hold can be confirmed
        if (hold.StudentId != studentId)
        {
            throw new ForbiddenException("You can only confirm your own hold.");
        }

        // Rule 5: Idempotency: If confirm request comes multiple times for the same hold, confirmedSeats increases only ONCE
        if (hold.Status == HoldStatus.CONFIRMED)
        {
            return new ConfirmHoldResponse(hold.Id, HoldStatus.CONFIRMED.ToString());
        }

        var now = DateTime.UtcNow;

        if (hold.Status == HoldStatus.CANCELLED)
        {
            throw new BadRequestException("Hold has been cancelled and cannot be confirmed.");
        }

        if (hold.Status == HoldStatus.EXPIRED || hold.ExpiresAtUtc <= now)
        {
            hold.Status = HoldStatus.EXPIRED;
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            throw new BadRequestException("Hold has expired and cannot be confirmed.");
        }

        hold.Status = HoldStatus.CONFIRMED;
        hold.ConfirmedAtUtc = now;

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new ConfirmHoldResponse(hold.Id, HoldStatus.CONFIRMED.ToString());
    }

    public async Task CancelHoldAsync(string holdId, string studentId, CancellationToken cancellationToken = default)
    {
        if (!StudentIdValidator.IsValid(studentId))
        {
            throw new BadRequestException("Student ID must be a valid 17-digit birth registration number.");
        }

        var hold = await _context.Holds
            .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

        if (hold == null)
        {
            throw new NotFoundException($"Hold with id '{holdId}' not found.");
        }

        if (hold.StudentId != studentId)
        {
            throw new ForbiddenException("You can only cancel your own hold.");
        }

        if (hold.Status == HoldStatus.CONFIRMED)
        {
            throw new BadRequestException("Cannot cancel an already confirmed admission.");
        }

        if (hold.Status == HoldStatus.CANCELLED)
        {
            // Already cancelled, idempotent success
            return;
        }

        hold.Status = HoldStatus.CANCELLED;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StudentHoldItemResponse>> GetStudentHoldsAsync(string studentId, CancellationToken cancellationToken = default)
    {
        if (!StudentIdValidator.IsValid(studentId))
        {
            throw new BadRequestException("Student ID must be a valid 17-digit birth registration number.");
        }

        var now = DateTime.UtcNow;

        var holds = await _context.Holds
            .AsNoTracking()
            .Include(h => h.Class)
            .Where(h => h.StudentId == studentId)
            .OrderByDescending(h => h.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return holds.Select(h => new StudentHoldItemResponse(
            h.Id,
            h.ClassId,
            h.Class?.Name ?? string.Empty,
            h.GetEffectiveStatus(now).ToString(),
            h.ExpiresAtUtc
        )).ToList();
    }
}
