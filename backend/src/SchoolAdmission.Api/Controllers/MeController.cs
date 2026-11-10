using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Application.DTOs;
using SchoolAdmission.Application.Interfaces;
using SchoolAdmission.Domain.Exceptions;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("me")]
public class MeController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public MeController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    /// <summary>
    /// GET /me/holds - Get all admission holds/applications for the authenticated student
    /// </summary>
    [HttpGet("holds")]
    public async Task<ActionResult<IReadOnlyList<StudentHoldItemResponse>>> GetMyHolds(
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            throw new BadRequestException("Missing required 'X-Student-Id' header.");
        }

        var response = await _admissionService.GetStudentHoldsAsync(studentId, cancellationToken);
        return Ok(response);
    }
}
