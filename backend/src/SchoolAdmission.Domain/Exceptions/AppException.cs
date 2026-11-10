using System.Net;

namespace SchoolAdmission.Domain.Exceptions;

public abstract class AppException : Exception
{
    public HttpStatusCode StatusCode { get; }

    protected AppException(string message, HttpStatusCode statusCode) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message, HttpStatusCode.NotFound)
    {
    }
}

public class ConflictException : AppException
{
    public ConflictException(string message) : base(message, HttpStatusCode.Conflict)
    {
    }
}

public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message, HttpStatusCode.BadRequest)
    {
    }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message) : base(message, HttpStatusCode.Forbidden)
    {
    }
}
