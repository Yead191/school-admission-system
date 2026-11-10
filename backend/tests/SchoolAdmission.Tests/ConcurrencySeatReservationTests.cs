using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using SchoolAdmission.Application.DTOs;
using SchoolAdmission.Tests.Infrastructure;
using Xunit;

namespace SchoolAdmission.Tests;

public class ConcurrencySeatReservationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public ConcurrencySeatReservationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ExtremeConcurrency_WhenSeatsAreLimited_NeverExceedsTotalSeats()
    {
        var adminClient = _factory.CreateClient();

        // 1. Create a class with only 5 seats
        const int totalSeats = 5;
        var createRes = await adminClient.PostAsJsonAsync("/classes", new CreateClassRequest("Class 6 - Concurrency Arena", totalSeats));
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);

        var createdClass = await createRes.Content.ReadFromJsonAsync<CreateClassResponse>(JsonOptions);
        Assert.NotNull(createdClass);
        var classId = createdClass.Id;

        // 2. Prepare 30 concurrent parents/students with distinct 17-digit student IDs
        const int totalConcurrentRequests = 30;
        var studentIds = Enumerable.Range(1, totalConcurrentRequests)
            .Select(i => $"201526910000{i:D5}") // 17 digits: "20152691000000001", "20152691000000002", ...
            .ToList();

        var successCount = 0;
        var conflictCount = 0;
        var otherResponses = new ConcurrentBag<HttpStatusCode>();

        // 3. Fire all requests concurrently
        var tasks = studentIds.Select(async studentId =>
        {
            var client = _factory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Post, $"/classes/{classId}/holds");
            request.Headers.Add("X-Student-Id", studentId);

            var response = await client.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.Created)
            {
                Interlocked.Increment(ref successCount);
            }
            else if (response.StatusCode == HttpStatusCode.Conflict)
            {
                Interlocked.Increment(ref conflictCount);
            }
            else
            {
                otherResponses.Add(response.StatusCode);
            }
        });

        await Task.WhenAll(tasks);

        // 4. Assertions: Zero overbooking
        // Exactly totalSeats (5) must succeed
        Assert.Equal(totalSeats, successCount);

        // Remaining 25 must get 409 Conflict
        Assert.Equal(totalConcurrentRequests - totalSeats, conflictCount);

        // No unexpected status codes (no 500s!)
        Assert.Empty(otherResponses);

        // 5. Verify final seat count directly from API
        var finalClassStatus = await adminClient.GetFromJsonAsync<ClassDetailResponse>($"/classes/{classId}", JsonOptions);
        Assert.NotNull(finalClassStatus);
        Assert.Equal(totalSeats, finalClassStatus.HeldSeats + finalClassStatus.ConfirmedSeats);
        Assert.Equal(0, finalClassStatus.AvailableSeats);
    }
}
