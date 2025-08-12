using MediatR;
using Taskify.Application.DTOs;

namespace Taskify.Application.Commands.Auth;

public class LoginCommand : IRequest<LoginResponse>
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class RefreshTokenCommand : IRequest<LoginResponse>
{
    public string RefreshToken { get; set; } = null!;
}
