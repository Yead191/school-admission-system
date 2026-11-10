using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Application.DTOs;
using SchoolAdmission.Application.Interfaces;
using SchoolAdmission.Domain.Exceptions;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;
    private readonly IAdmissionService _admissionService;

    public ClassesController(IClassService classService, IAdmissionService admissionService)
    {
        _classService = classService;
        _admissionService = admissionService;
    }

    /// <summary>
    /// POST /classes - Create a new class with total seats
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CreateClassResponse>> CreateClass(
        [FromBody] CreateClassRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _classService.CreateClassAsync(request, cancellationToken);
        return Created($"/classes/{response.Id}", response);
    }

    /// <summary>
    /// GET /classes - List all classes with live seat counts
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ClassDetailResponse>>> GetAllClasses(
        CancellationToken cancellationToken)
    {
        var response = await _classService.GetAllClassesAsync(cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// GET /classes/{classId} - Get details and live seat status for a specific class
    /// </summary>
    [HttpGet("{classId}")]
    public async Task<ActionResult<ClassDetailResponse>> GetClassById(
        string classId,
        CancellationToken cancellationToken)
    {
        var response = await _classService.GetClassByIdAsync(classId, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// POST /classes/{classId}/holds - Apply for a seat hold
    /// </summary>
    [HttpPost("{classId}/holds")]
    public async Task<ActionResult<HoldCreatedResponse>> CreateHold(
        string classId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            throw new BadRequestException("Missing required 'X-Student-Id' header.");
        }

        var response = await _admissionService.CreateHoldAsync(classId, studentId, cancellationToken);
        return Created($"/holds/{response.HoldId}", response);
    }
}
