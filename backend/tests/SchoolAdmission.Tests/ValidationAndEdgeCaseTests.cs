using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using SchoolAdmission.Application.DTOs;
using SchoolAdmission.Tests.Infrastructure;
using Xunit;

namespace SchoolAdmission.Tests;

public class ValidationAndEdgeCaseTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public ValidationAndEdgeCaseTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Theory]
    [InlineData("")]
    [InlineData("123")]
    [InlineData("abc12345678901234")]
    [InlineData("2015269123456789")]  // 16 digits
    [InlineData("201526912345678901")] // 18 digits
    public async Task InvalidStudentId_ShouldReturnBadRequest_400(string invalidStudentId)
    {
        using var holdReq = new HttpRequestMessage(HttpMethod.Post, "/classes/c_test/holds");
        if (!string.IsNullOrEmpty(invalidStudentId))
        {
            holdReq.Headers.Add("X-Student-Id", invalidStudentId);
        }

        var response = await _client.SendAsync(holdReq);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SameStudent_CannotHoldMultipleSeatsInSameClass_Rule3()
    {
        // Create class
        var createRes = await _client.PostAsJsonAsync("/classes", new CreateClassRequest("Class 8 - Active Hold Limit Test", 50));
        var created = await createRes.Content.ReadFromJsonAsync<CreateClassResponse>(JsonOptions);
        Assert.NotNull(created);

        var studentId = "20152691234567899";

        // First hold succeeds
        using var hold1 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{created.Id}/holds");
        hold1.Headers.Add("X-Student-Id", studentId);
        var res1 = await _client.SendAsync(hold1);
        Assert.Equal(HttpStatusCode.Created, res1.StatusCode);

        // Second hold in same class must return 409 Conflict
        using var hold2 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{created.Id}/holds");
        hold2.Headers.Add("X-Student-Id", studentId);
        var res2 = await _client.SendAsync(hold2);
        Assert.Equal(HttpStatusCode.Conflict, res2.StatusCode);
    }

    [Fact]
    public async Task ConfirmingAnotherStudentsHold_ShouldReturnForbidden_403()
    {
        var createRes = await _client.PostAsJsonAsync("/classes", new CreateClassRequest("Class 9 - Shift Test", 20));
        var created = await createRes.Content.ReadFromJsonAsync<CreateClassResponse>(JsonOptions);
        Assert.NotNull(created);

        var student1 = "20152691234567801";
        var student2 = "20152691234567802";

        // Student 1 holds
        using var holdReq = new HttpRequestMessage(HttpMethod.Post, $"/classes/{created.Id}/holds");
        holdReq.Headers.Add("X-Student-Id", student1);
        var holdRes = await _client.SendAsync(holdReq);
        var holdData = await holdRes.Content.ReadFromJsonAsync<HoldCreatedResponse>(JsonOptions);
        Assert.NotNull(holdData);

        // Student 2 tries to confirm student 1's hold
        using var confirmReq = new HttpRequestMessage(HttpMethod.Post, $"/holds/{holdData.HoldId}/confirm");
        confirmReq.Headers.Add("X-Student-Id", student2);
        var confirmRes = await _client.SendAsync(confirmReq);

        Assert.Equal(HttpStatusCode.Forbidden, confirmRes.StatusCode);
    }

    [Fact]
    public async Task NonExistentClass_ShouldReturnNotFound_404()
    {
        var res = await _client.GetAsync("/classes/non_existent_class_id");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }
}
