namespace SchoolAdmission.Application.DTOs;

public record CreateClassRequest(
    string Name,
    int TotalSeats
);

public record CreateClassResponse(
    string Id,
    string Name,
    int TotalSeats
);

public record ClassDetailResponse(
    string Id,
    string Name,
    int TotalSeats,
    int HeldSeats,
    int ConfirmedSeats,
    int AvailableSeats
);

public record HoldCreatedResponse(
    string HoldId,
    string ClassId,
    string StudentId,
    string Status,
    DateTime ExpiresAt
);

public record HoldStatusResponse(
    string HoldId,
    string ClassId,
    string Status,
    DateTime ExpiresAt
);

public record ConfirmHoldResponse(
    string HoldId,
    string Status
);

public record StudentHoldItemResponse(
    string HoldId,
    string ClassId,
    string ClassName,
    string Status,
    DateTime ExpiresAt
);

