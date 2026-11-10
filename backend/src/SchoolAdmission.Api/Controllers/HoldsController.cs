using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Application.DTOs;
using SchoolAdmission.Application.Interfaces;
using SchoolAdmission.Domain.Exceptions;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("holds")]
public class HoldsController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public HoldsController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    /// <summary>
    /// GET /holds/{holdId} - Get current status of a hold
    /// </summary>
    [HttpGet("{holdId}")]
    public async Task<ActionResult<HoldStatusResponse>> GetHoldStatus(
        string holdId,
        CancellationToken cancellationToken)
    {
        var response = await _admissionService.GetHoldStatusAsync(holdId, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// POST /holds/{holdId}/confirm - Confirm admission fee payment and seat
    /// </summary>
    [HttpPost("{holdId}/confirm")]
    public async Task<ActionResult<ConfirmHoldResponse>> ConfirmHold(
        string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            throw new BadRequestException("Missing required 'X-Student-Id' header.");
        }

        var response = await _admissionService.ConfirmHoldAsync(holdId, studentId, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// DELETE /holds/{holdId} - Cancel a hold
    /// </summary>
    [HttpDelete("{holdId}")]
    public async Task<IActionResult> CancelHold(
        string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            throw new BadRequestException("Missing required 'X-Student-Id' header.");
        }

        await _admissionService.CancelHoldAsync(holdId, studentId, cancellationToken);
        return NoContent();
    }
}
