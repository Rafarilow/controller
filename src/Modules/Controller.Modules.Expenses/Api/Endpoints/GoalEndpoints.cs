using System.Security.Claims;
using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Controller.Modules.Expenses.Api.Endpoints;

public static class GoalEndpoints
{
    public static IEndpointRouteBuilder MapGoalEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/goals").WithTags("Goals").RequireAuthorization();

        group.MapGet("/", async (ClaimsPrincipal claims, IGoalService service) =>
            Results.Ok(await service.ListAsync(GetUserId(claims))));

        group.MapPost("/", async (CreateGoalRequest request, ClaimsPrincipal claims, IGoalService service) =>
        {
            var result = await service.CreateAsync(request, GetUserId(claims));
            return result.IsSuccess
                ? Results.Created($"/api/goals/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateGoalRequest request, ClaimsPrincipal claims, IGoalService service) =>
        {
            var result = await service.UpdateAsync(id, request, GetUserId(claims));
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { error = result.Error });
        });

        group.MapPost("/{id:guid}/contribuir", async (Guid id, ContribuirGoalRequest request, ClaimsPrincipal claims, IGoalService service) =>
        {
            var result = await service.ContribuirAsync(id, request, GetUserId(claims));
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { error = result.Error });
        });

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal claims, IGoalService service) =>
        {
            var result = await service.DeleteAsync(id, GetUserId(claims));
            return result.IsSuccess ? Results.NoContent() : Results.NotFound(new { error = result.Error });
        });

        return app;
    }

    private static Guid GetUserId(ClaimsPrincipal claims)
        => Guid.Parse(claims.FindFirstValue(ClaimTypes.NameIdentifier) ?? claims.FindFirstValue("sub") ?? "");
}
