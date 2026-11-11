using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using SchoolAdmission.Application.DTOs;
using SchoolAdmission.Tests.Infrastructure;
using Xunit;

namespace SchoolAdmission.Tests;

public class LifecycleAndIdempotencyTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public LifecycleAndIdempotencyTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CompleteAdmissionLifecycle_ShouldSucceed_AndMaintainCorrectSeatCounts()
    {
        // 1. Create a class with 10 seats
        var createClassReq = new CreateClassRequest("Class 10 - Science", 10);
        var createClassRes = await _client.PostAsJsonAsync("/classes", createClassReq);
        Assert.Equal(HttpStatusCode.Created, createClassRes.StatusCode);

        var createdClass = await createClassRes.Content.ReadFromJsonAsync<CreateClassResponse>(JsonOptions);
        Assert.NotNull(createdClass);
        Assert.StartsWith("c_", createdClass.Id);
        Assert.Equal("Class 10 - Science", createdClass.Name);
        Assert.Equal(10, createdClass.TotalSeats);

        var classId = createdClass.Id;
        var student1 = "20152691234567890";

        // 2. Student 1 holds a seat
        using var holdReq = new HttpRequestMessage(HttpMethod.Post, $"/classes/{classId}/holds");
        holdReq.Headers.Add("X-Student-Id", student1);
        var holdRes = await _client.SendAsync(holdReq);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);

        var holdData = await holdRes.Content.ReadFromJsonAsync<HoldCreatedResponse>(JsonOptions);
        Assert.NotNull(holdData);
        Assert.Equal("HELD", holdData.Status);
        Assert.Equal(classId, holdData.ClassId);
        Assert.Equal(student1, holdData.StudentId);

        // 3. Check class status: heldSeats should be 1, confirmedSeats 0, availableSeats 9
        var classStatusRes = await _client.GetFromJsonAsync<ClassDetailResponse>($"/classes/{classId}", JsonOptions);
        Assert.NotNull(classStatusRes);
        Assert.Equal(1, classStatusRes.HeldSeats);
        Assert.Equal(0, classStatusRes.ConfirmedSeats);
        Assert.Equal(9, classStatusRes.AvailableSeats);

        // 4. Confirm admission fee payment
        using var confirmReq = new HttpRequestMessage(HttpMethod.Post, $"/holds/{holdData.HoldId}/confirm");
        confirmReq.Headers.Add("X-Student-Id", student1);
        var confirmRes = await _client.SendAsync(confirmReq);
        Assert.Equal(HttpStatusCode.OK, confirmRes.StatusCode);

        var confirmData = await confirmRes.Content.ReadFromJsonAsync<ConfirmHoldResponse>(JsonOptions);
        Assert.NotNull(confirmData);
        Assert.Equal("CONFIRMED", confirmData.Status);

        // 5. Verify Idempotency (Rule 5): Re-sending confirm should succeed with CONFIRMED and NOT increase confirmedSeats
        using var duplicateConfirmReq = new HttpRequestMessage(HttpMethod.Post, $"/holds/{holdData.HoldId}/confirm");
        duplicateConfirmReq.Headers.Add("X-Student-Id", student1);
        var duplicateConfirmRes = await _client.SendAsync(duplicateConfirmReq);
        Assert.Equal(HttpStatusCode.OK, duplicateConfirmRes.StatusCode);

        var duplicateConfirmData = await duplicateConfirmRes.Content.ReadFromJsonAsync<ConfirmHoldResponse>(JsonOptions);
        Assert.NotNull(duplicateConfirmData);
        Assert.Equal("CONFIRMED", duplicateConfirmData.Status);

        // 6. Check class status: confirmedSeats must be exactly 1, heldSeats 0, availableSeats 9
        var finalClassStatus = await _client.GetFromJsonAsync<ClassDetailResponse>($"/classes/{classId}", JsonOptions);
        Assert.NotNull(finalClassStatus);
        Assert.Equal(1, finalClassStatus.ConfirmedSeats);
        Assert.Equal(0, finalClassStatus.HeldSeats);
        Assert.Equal(9, finalClassStatus.AvailableSeats);

        // 7. Check student's personal applications (/me/holds)
        using var meReq = new HttpRequestMessage(HttpMethod.Get, "/me/holds");
        meReq.Headers.Add("X-Student-Id", student1);
        var meRes = await _client.SendAsync(meReq);
        Assert.Equal(HttpStatusCode.OK, meRes.StatusCode);

        var studentHolds = await meRes.Content.ReadFromJsonAsync<List<StudentHoldItemResponse>>(JsonOptions);
        Assert.NotNull(studentHolds);
        Assert.Contains(studentHolds, h => h.HoldId == holdData.HoldId && h.Status == "CONFIRMED");
    }

    [Fact]
    public async Task CancelHold_ShouldReleaseSeatImmediately()
    {
        // Create class with 2 seats
        var createClassRes = await _client.PostAsJsonAsync("/classes", new CreateClassRequest("Class 7 - Day", 2));
        var createdClass = await createClassRes.Content.ReadFromJsonAsync<CreateClassResponse>(JsonOptions);
        Assert.NotNull(createdClass);
        var classId = createdClass.Id;
        var studentId = "20152691234567891";

        // Hold seat
        using var holdReq = new HttpRequestMessage(HttpMethod.Post, $"/classes/{classId}/holds");
        holdReq.Headers.Add("X-Student-Id", studentId);
        var holdRes = await _client.SendAsync(holdReq);
        var holdData = await holdRes.Content.ReadFromJsonAsync<HoldCreatedResponse>(JsonOptions);
        Assert.NotNull(holdData);

        // Verify available seats decreased to 1
        var classState1 = await _client.GetFromJsonAsync<ClassDetailResponse>($"/classes/{classId}", JsonOptions);
        Assert.Equal(1, classState1?.AvailableSeats);

        // Cancel hold
        using var cancelReq = new HttpRequestMessage(HttpMethod.Delete, $"/holds/{holdData.HoldId}");
        cancelReq.Headers.Add("X-Student-Id", studentId);
        var cancelRes = await _client.SendAsync(cancelReq);
        Assert.Equal(HttpStatusCode.NoContent, cancelRes.StatusCode);

        // Verify hold status is now CANCELLED
        var statusRes = await _client.GetFromJsonAsync<HoldStatusResponse>($"/holds/{holdData.HoldId}", JsonOptions);
        Assert.Equal("CANCELLED", statusRes?.Status);

        // Verify available seats increased back to 2
        var classState2 = await _client.GetFromJsonAsync<ClassDetailResponse>($"/classes/{classId}", JsonOptions);
        Assert.Equal(2, classState2?.AvailableSeats);
        Assert.Equal(0, classState2?.HeldSeats);
    }
}

