using System.Security.Claims;
using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Controller.Modules.Expenses.Api.Endpoints;

public static class RecurringEndpoints
{
    public static IEndpointRouteBuilder MapRecurringEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/recurring").WithTags("Recurring").RequireAuthorization();

        group.MapGet("/", async (ClaimsPrincipal claims, IRecurringService service, bool? ativo) =>
        {
            var userId = GetUserId(claims);
            return Results.Ok(await service.ListAsync(userId, ativo));
        });

        group.MapPost("/", async (CreateRecurringRequest request, ClaimsPrincipal claims, IRecurringService service) =>
        {
            var userId = GetUserId(claims);
            var result = await service.CreateAsync(request, userId);
            return result.IsSuccess
                ? Results.Created($"/api/recurring/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateRecurringRequest request, ClaimsPrincipal claims, IRecurringService service) =>
        {
            var userId = GetUserId(claims);
            var result = await service.UpdateAsync(id, request, userId);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { error = result.Error });
        });

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal claims, IRecurringService service) =>
        {
            var userId = GetUserId(claims);
            var result = await service.DeleteAsync(id, userId);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound(new { error = result.Error });
        });

        group.MapPost("/{id:guid}/run", async (Guid id, ClaimsPrincipal claims, IRecurringService service) =>
        {
            var userId = GetUserId(claims);
            var result = await service.RunAsync(id, userId);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { error = result.Error });
        });

        return app;
    }

    private static Guid GetUserId(ClaimsPrincipal claims)
        => Guid.Parse(claims.FindFirstValue(ClaimTypes.NameIdentifier) ?? claims.FindFirstValue("sub") ?? "");
}
