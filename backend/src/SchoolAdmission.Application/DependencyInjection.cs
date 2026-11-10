using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using SchoolAdmission.Application.Interfaces;
using SchoolAdmission.Application.Services;
using SchoolAdmission.Application.Validators;

namespace SchoolAdmission.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<CreateClassRequestValidator>();

        services.AddScoped<IClassService, ClassService>();
        services.AddScoped<IAdmissionService, AdmissionService>();

        return services;
    }
}
