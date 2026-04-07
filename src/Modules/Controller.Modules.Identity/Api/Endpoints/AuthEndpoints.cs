using System.Security.Claims;
using Controller.Modules.Identity.Application.DTOs;
using Controller.Modules.Identity.Application.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Controller.Modules.Identity.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterRequest request, IAuthService authService) =>
        {
            var result = await authService.RegisterAsync(request.Nome, request.Email, request.Password);
            return result.IsSuccess
                ? Results.Created("/api/auth/me", new { message = "Conta criada com sucesso" })
                : Results.BadRequest(new { error = result.Error });
        });

        group.MapPost("/login", async (LoginRequest request, IAuthService authService) =>
        {
            var result = await authService.AuthenticateAsync(request.Email, request.Password);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.Unauthorized();
        });

        group.MapGet("/me", async (ClaimsPrincipal claims, IAuthService authService) =>
        {
            var userId = GetUserId(claims);
            var user = await authService.GetUserByIdAsync(userId);
            return user is not null ? Results.Ok(user) : Results.NotFound();
        }).RequireAuthorization();

        group.MapPut("/me", async (UpdateProfileRequest request, ClaimsPrincipal claims, IAuthService authService) =>
        {
            var userId = GetUserId(claims);
            var result = await authService.UpdateProfileAsync(userId, request.Nome);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        }).RequireAuthorization();

        group.MapPut("/password", async (ChangePasswordRequest request, ClaimsPrincipal claims, IAuthService authService) =>
        {
            var userId = GetUserId(claims);
            var result = await authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
            return result.IsSuccess ? Results.Ok(new { message = "Senha alterada com sucesso" }) : Results.BadRequest(new { error = result.Error });
        }).RequireAuthorization();

        group.MapPost("/forgot-password", async (ForgotPasswordRequest request, IAuthService authService) =>
        {
            var result = await authService.ForgotPasswordAsync(request.Email);
            return result.IsSuccess
                ? Results.Ok(new { token = result.Value, message = "Token gerado com sucesso. Use-o para redefinir sua senha." })
                : Results.BadRequest(new { error = result.Error });
        });

        group.MapPost("/reset-password", async (ResetPasswordRequest request, IAuthService authService) =>
        {
            var result = await authService.ResetPasswordAsync(request.Token, request.NewPassword);
            return result.IsSuccess
                ? Results.Ok(new { message = "Senha redefinida com sucesso" })
                : Results.BadRequest(new { error = result.Error });
        });

        return app;
    }

    private static Guid GetUserId(ClaimsPrincipal claims)
    {
        return Guid.Parse(claims.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? claims.FindFirstValue("sub") ?? "");
    }
}
