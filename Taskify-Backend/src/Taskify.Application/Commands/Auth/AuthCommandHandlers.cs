using MediatR;
using Taskify.Application.Commands.Auth;
using Taskify.Application.DTOs;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Domain.Enums;

namespace Taskify.Application.Commands.Auth;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IAuthService _authService;

    public LoginCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        return await _authService.LoginAsync(new LoginRequest 
        { 
            Email = request.Email, 
            Password = request.Password 
        }, cancellationToken);
    }
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, LoginResponse>
{
    private readonly IAuthService _authService;

    public RefreshTokenCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<LoginResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        return await _authService.RefreshTokenAsync(new RefreshTokenRequest 
        { 
            RefreshToken = request.RefreshToken 
        }, cancellationToken);
    }
}
