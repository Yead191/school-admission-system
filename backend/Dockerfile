# Multi-stage Dockerfile for SchoolAdmission Backend (.NET 8)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy solution and project files for layer caching
COPY SchoolAdmission.sln ./
COPY src/SchoolAdmission.Domain/SchoolAdmission.Domain.csproj src/SchoolAdmission.Domain/
COPY src/SchoolAdmission.Application/SchoolAdmission.Application.csproj src/SchoolAdmission.Application/
COPY src/SchoolAdmission.Infrastructure/SchoolAdmission.Infrastructure.csproj src/SchoolAdmission.Infrastructure/
COPY src/SchoolAdmission.Api/SchoolAdmission.Api.csproj src/SchoolAdmission.Api/
COPY tests/SchoolAdmission.Tests/SchoolAdmission.Tests.csproj tests/SchoolAdmission.Tests/

# Restore dependencies
RUN dotnet restore

# Copy entire source code and publish
COPY . ./
RUN dotnet publish src/SchoolAdmission.Api/SchoolAdmission.Api.csproj -c Release -o /out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out ./

# Listen on port 8080 as required by specification
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SchoolAdmission.Api.dll"]

