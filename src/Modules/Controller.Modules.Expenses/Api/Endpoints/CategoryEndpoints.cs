using System.Security.Claims;
using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Controller.Modules.Expenses.Api.Endpoints;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/categories").WithTags("Categories").RequireAuthorization();

        group.MapGet("/", async (ClaimsPrincipal claims, IExpenseService service) =>
        {
            var userId = GetUserId(claims);
            var categories = await service.ListCategoriesAsync(userId);
            return Results.Ok(categories);
        });

        group.MapPost("/", async (CreateCategoryRequest request, ClaimsPrincipal claims, IExpenseService service) =>
        {
            var userId = GetUserId(claims);
            var result = await service.CreateCategoryAsync(request, userId);
            return result.IsSuccess
                ? Results.Created($"/api/categories/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        });

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal claims, IExpenseService service) =>
        {
            var userId = GetUserId(claims);
            var result = await service.DeleteCategoryAsync(id, userId);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound(new { error = result.Error });
        });

        return app;
    }

    private static Guid GetUserId(ClaimsPrincipal claims)
        => Guid.Parse(claims.FindFirstValue(ClaimTypes.NameIdentifier) ?? claims.FindFirstValue("sub") ?? "");
}
