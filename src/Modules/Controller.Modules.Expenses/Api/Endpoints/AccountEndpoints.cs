using System.Security.Claims;
using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Controller.Modules.Expenses.Api.Endpoints;

public static class AccountEndpoints
{
    public static IEndpointRouteBuilder MapAccountEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/accounts").WithTags("Accounts").RequireAuthorization();

        group.MapGet("/", async (ClaimsPrincipal claims, IAccountService service) =>
            Results.Ok(await service.ListAsync(GetUserId(claims))));

        group.MapPost("/", async (CreateAccountRequest request, ClaimsPrincipal claims, IAccountService service) =>
        {
            var result = await service.CreateAsync(request, GetUserId(claims));
            return result.IsSuccess
                ? Results.Created($"/api/accounts/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateAccountRequest request, ClaimsPrincipal claims, IAccountService service) =>
        {
            var result = await service.UpdateAsync(id, request, GetUserId(claims));
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { error = result.Error });
        });

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal claims, IAccountService service) =>
        {
            var result = await service.DeleteAsync(id, GetUserId(claims));
            return result.IsSuccess ? Results.NoContent() : Results.NotFound(new { error = result.Error });
        });

        return app;
    }

    private static Guid GetUserId(ClaimsPrincipal claims)
        => Guid.Parse(claims.FindFirstValue(ClaimTypes.NameIdentifier) ?? claims.FindFirstValue("sub") ?? "");
}
