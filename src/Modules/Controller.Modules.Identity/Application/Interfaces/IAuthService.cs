using Controller.Modules.Identity.Application.DTOs;
using Controller.SharedKernel.Application;

namespace Controller.Modules.Identity.Application.Interfaces;

public interface IAuthService
{
    Task<Result<AuthResponse>> AuthenticateAsync(string email, string password);
    Task<Result<UserDto>> RegisterAsync(string nome, string email, string password);
    Task<UserDto?> GetUserByIdAsync(Guid userId);
    Task<Result<UserDto>> UpdateProfileAsync(Guid userId, string nome);
    Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
    Task<Result<string>> ForgotPasswordAsync(string email);
    Task<Result> ResetPasswordAsync(string token, string newPassword);
}
