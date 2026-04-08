using System.Security.Claims;
using Controller.Modules.Expenses.Application.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Controller.Modules.Expenses.Api.Endpoints;

public static class ReportEndpoints
{
    public static IEndpointRouteBuilder MapReportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reports").WithTags("Reports").RequireAuthorization();

        group.MapGet("/cashflow", async (ClaimsPrincipal claims, IReportsService service, int? months) =>
            Results.Ok(await service.GetCashflowAsync(GetUserId(claims), months ?? 12)));

        group.MapGet("/projection", async (ClaimsPrincipal claims, IReportsService service) =>
            Results.Ok(await service.GetProjectionAsync(GetUserId(claims))));

        group.MapGet("/category-trend", async (ClaimsPrincipal claims, IReportsService service, string categoria, int? months) =>
            Results.Ok(await service.GetCategoryTrendAsync(GetUserId(claims), categoria, months ?? 6)));

        var calGroup = app.MapGroup("/api/calendar").WithTags("Calendar").RequireAuthorization();
        calGroup.MapGet("/", async (ClaimsPrincipal claims, IReportsService service, int year, int month) =>
            Results.Ok(await service.GetCalendarAsync(GetUserId(claims), year, month)));

        return app;
    }

    private static Guid GetUserId(ClaimsPrincipal claims)
        => Guid.Parse(claims.FindFirstValue(ClaimTypes.NameIdentifier) ?? claims.FindFirstValue("sub") ?? "");
}
