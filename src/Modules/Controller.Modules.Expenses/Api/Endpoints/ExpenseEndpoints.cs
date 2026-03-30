using System.Security.Claims;
using Controller.Modules.Expenses.Application.DTOs;
using Controller.Modules.Expenses.Application.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Controller.Modules.Expenses.Api.Endpoints;

public static class ExpenseEndpoints
{
    public static IEndpointRouteBuilder MapExpenseEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/expenses").WithTags("Expenses").RequireAuthorization();

        group.MapGet("/", async (ClaimsPrincipal claims, IExpenseService service, DateOnly? from, DateOnly? to) =>
        {
            var userId = GetUserId(claims);
            var expenses = await service.ListAsync(userId, from, to);
            return Results.Ok(expenses);
        });

        group.MapPost("/", async (CreateExpenseRequest request, ClaimsPrincipal claims, IExpenseService service) =>
        {
            var userId = GetUserId(claims);
            var result = await service.CreateAsync(request, userId);
            return result.IsSuccess
                ? Results.Created($"/api/expenses/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateExpenseRequest request, ClaimsPrincipal claims, IExpenseService service) =>
        {
            var userId = GetUserId(claims);
            var result = await service.UpdateAsync(id, request, userId);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { error = result.Error });
        });

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal claims, IExpenseService service) =>
        {
            var userId = GetUserId(claims);
            var result = await service.DeleteAsync(id, userId);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound(new { error = result.Error });
        });

        group.MapGet("/report", async (ClaimsPrincipal claims, IExpenseService service, DateOnly? from, DateOnly? to) =>
        {
            var userId = GetUserId(claims);
            var report = await service.GetReportAsync(userId, from, to);
            return Results.Ok(report);
        });

        group.MapGet("/export-pdf", async (ClaimsPrincipal claims, IExpenseService service, DateOnly? from, DateOnly? to) =>
        {
            var userId = GetUserId(claims);
            var nome = claims.FindFirstValue("nome") ?? "Usuário";
            var pdf = await service.GeneratePdfAsync(userId, nome, from, to);
            return Results.File(pdf, "application/pdf", "relatorio_despesas.pdf");
        });

        return app;
    }

    private static Guid GetUserId(ClaimsPrincipal claims)
        => Guid.Parse(claims.FindFirstValue(ClaimTypes.NameIdentifier) ?? claims.FindFirstValue("sub") ?? "");
}
