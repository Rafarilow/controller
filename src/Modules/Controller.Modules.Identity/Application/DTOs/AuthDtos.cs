namespace Controller.Modules.Identity.Application.DTOs;

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Nome, string Email, string Password);
public record AuthResponse(string Token, UserDto User);
public record UserDto(Guid Id, string Nome, string Email);
public record UpdateProfileRequest(string Nome);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
