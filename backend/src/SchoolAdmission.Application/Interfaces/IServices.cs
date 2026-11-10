using SchoolAdmission.Application.DTOs;

namespace SchoolAdmission.Application.Interfaces;

public interface IClassService
{
    Task<CreateClassResponse> CreateClassAsync(CreateClassRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ClassDetailResponse>> GetAllClassesAsync(CancellationToken cancellationToken = default);
    Task<ClassDetailResponse> GetClassByIdAsync(string classId, CancellationToken cancellationToken = default);
}

public interface IAdmissionService
{
    Task<HoldCreatedResponse> CreateHoldAsync(string classId, string studentId, CancellationToken cancellationToken = default);
    Task<HoldStatusResponse> GetHoldStatusAsync(string holdId, CancellationToken cancellationToken = default);
    Task<ConfirmHoldResponse> ConfirmHoldAsync(string holdId, string studentId, CancellationToken cancellationToken = default);
    Task CancelHoldAsync(string holdId, string studentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StudentHoldItemResponse>> GetStudentHoldsAsync(string studentId, CancellationToken cancellationToken = default);
}
