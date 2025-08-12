namespace Taskify.Application.DTOs;

public class LoginRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class LoginResponse
{
    public string AccessToken { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public UserInfoDto User { get; set; } = null!;
}

public class UserInfoDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string Position { get; set; } = null!;
    public string? Department { get; set; }
    public string? Avatar { get; set; }
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = null!;
}
