using SchoolAdmission.Domain.Enums;

namespace SchoolAdmission.Domain.Entities;

public class HoldEntity
{
    public string Id { get; set; } = string.Empty;
    public string ClassId { get; set; } = string.Empty;
    public ClassEntity? Class { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public HoldStatus Status { get; set; } = HoldStatus.HELD;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ConfirmedAtUtc { get; set; }

    /// <summary>
    /// Computes the effective real-time status of this hold considering UTC timestamp.
    /// If DB status is still HELD but ExpiresAtUtc is in the past, it is effectively EXPIRED.
    /// </summary>
    public HoldStatus GetEffectiveStatus(DateTime currentUtc)
    {
        if (Status == HoldStatus.HELD && ExpiresAtUtc <= currentUtc)
        {
            return HoldStatus.EXPIRED;
        }

        return Status;
    }
}
