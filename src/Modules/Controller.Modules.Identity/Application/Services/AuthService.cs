using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Controller.Modules.Identity.Application.DTOs;
using Controller.Modules.Identity.Application.Interfaces;
using Controller.Modules.Identity.Domain.Entities;
using Controller.SharedKernel.Application;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Controller.Modules.Identity.Application.Services;

public class AuthService : IAuthService
{
    private readonly IIdentityRepository _repository;
    private readonly IConfiguration _configuration;

    public AuthService(IIdentityRepository repository, IConfiguration configuration)
    {
        _repository = repository;
        _configuration = configuration;
    }

    public async Task<Result<AuthResponse>> AuthenticateAsync(string email, string password)
    {
        var user = await _repository.GetUserByEmailAsync(email.ToLowerInvariant());
        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return Result.Failure<AuthResponse>("Email ou senha incorretos");

        var token = GenerateToken(user);
        var dto = new UserDto(user.Id, user.Nome, user.Email);
        return Result.Success(new AuthResponse(token, dto));
    }

    public async Task<Result<UserDto>> RegisterAsync(string nome, string email, string password)
    {
        if (string.IsNullOrWhiteSpace(nome) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return Result.Failure<UserDto>("Todos os campos são obrigatórios");

        if (password.Length < 6)
            return Result.Failure<UserDto>("A senha deve ter pelo menos 6 caracteres");

        var existing = await _repository.GetUserByEmailAsync(email.ToLowerInvariant());
        if (existing is not null)
            return Result.Failure<UserDto>("Este email já está cadastrado");

        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        var user = User.Create(nome, email, hash);

        await _repository.AddUserAsync(user);
        await _repository.SaveChangesAsync();

        return Result.Success(new UserDto(user.Id, user.Nome, user.Email));
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId)
    {
        var user = await _repository.GetUserByIdAsync(userId);
        return user is null ? null : new UserDto(user.Id, user.Nome, user.Email);
    }

    public async Task<Result<UserDto>> UpdateProfileAsync(Guid userId, string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result.Failure<UserDto>("Nome é obrigatório");

        var user = await _repository.GetUserByIdAsync(userId);
        if (user is null)
            return Result.Failure<UserDto>("Usuário não encontrado");

        user.UpdateProfile(nome);
        await _repository.SaveChangesAsync();

        return Result.Success(new UserDto(user.Id, user.Nome, user.Email));
    }

    public async Task<Result<string>> ForgotPasswordAsync(string email)
    {
        var user = await _repository.GetUserByEmailAsync(email.ToLowerInvariant());
        // Always return success to avoid email enumeration — but only generate token if user exists
        if (user is null)
            return Result.Success("Se este email estiver cadastrado, um token foi gerado.");

        var resetToken = PasswordResetToken.Create(email);
        await _repository.AddResetTokenAsync(resetToken);
        await _repository.SaveChangesAsync();

        return Result.Success(resetToken.Token);
    }

    public async Task<Result> ResetPasswordAsync(string token, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            return Result.Failure("A senha deve ter pelo menos 6 caracteres");

        var resetToken = await _repository.GetResetTokenAsync(token);
        if (resetToken is null || resetToken.IsExpired())
            return Result.Failure("Token inválido ou expirado");

        var user = await _repository.GetUserByEmailAsync(resetToken.Email);
        if (user is null)
            return Result.Failure("Usuário não encontrado");

        user.SetPasswordHash(BCrypt.Net.BCrypt.HashPassword(newPassword));
        _repository.RemoveResetToken(resetToken);
        await _repository.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            return Result.Failure("A nova senha deve ter pelo menos 6 caracteres");

        var user = await _repository.GetUserByIdAsync(userId);
        if (user is null)
            return Result.Failure("Usuário não encontrado");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            return Result.Failure("Senha atual incorreta");

        user.SetPasswordHash(BCrypt.Net.BCrypt.HashPassword(newPassword));
        await _repository.SaveChangesAsync();

        return Result.Success();
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("nome", user.Nome),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var expiry = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "1440");

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiry),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
