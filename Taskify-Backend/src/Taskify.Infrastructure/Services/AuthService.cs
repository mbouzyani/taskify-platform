using Microsoft.EntityFrameworkCore;
using Taskify.Application.DTOs;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Domain.Enums;
using Taskify.Infrastructure.Data;

namespace Taskify.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly TaskifyDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthService(TaskifyDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await GetUserByEmailAsync(request.Email, cancellationToken);
        
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = new UserInfoDto
            {
                Id = user.Id.ToString(),
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString(),
                Position = user.Position.ToString(),
                Department = user.Department,
                Avatar = user.Avatar
            }
        };
    }

    public Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        // In a real implementation, you would store refresh tokens in the database
        // and validate them here. For this demo, we'll implement a basic version.
        throw new NotImplementedException("Refresh token functionality not implemented yet.");
    }

    public async Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        // Check if password hash is null or empty to avoid BCrypt salt errors
        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            return false;
        }

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch (Exception)
        {
            // Log the error and return false for any BCrypt verification errors
            return false;
        }
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}
