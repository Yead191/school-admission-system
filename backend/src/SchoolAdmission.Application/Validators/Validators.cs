using FluentValidation;
using SchoolAdmission.Application.DTOs;

namespace SchoolAdmission.Application.Validators;

public class CreateClassRequestValidator : AbstractValidator<CreateClassRequest>
{
    public CreateClassRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Class name is required.")
            .MaximumLength(200).WithMessage("Class name must not exceed 200 characters.");

        RuleFor(x => x.TotalSeats)
            .GreaterThan(0).WithMessage("Total seats must be greater than zero.");
    }
}

public static class StudentIdValidator
{
    public static bool IsValid(string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            return false;

        // Must be exactly 17 digits numeric
        return studentId.Length == 17 && studentId.All(char.IsDigit);
    }
}

