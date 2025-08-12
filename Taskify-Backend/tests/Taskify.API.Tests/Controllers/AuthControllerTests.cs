using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Taskify.API.Controllers;
using Taskify.Application.Commands.Auth;
using Taskify.Application.DTOs;
using Xunit;

namespace Taskify.API.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new AuthController(_mediatorMock.Object);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkWithToken()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var expectedResponse = new LoginResponse
        {
            AccessToken = "jwt-access-token",
            RefreshToken = "jwt-refresh-token",
            User = new UserInfoDto
            {
                Id = "user-id",
                Name = "Test User",
                Email = "test@example.com",
                Role = "User",
                Position = "Developer"
            }
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<LoginCommand>(), default))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<LoginResponse>().Subject;
        response.AccessToken.Should().Be("jwt-access-token");
        response.RefreshToken.Should().Be("jwt-refresh-token");
        response.User.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "wrongpassword"
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<LoginCommand>(), default))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid credentials"));

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task Login_WithException_ReturnsBadRequest()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "password123"
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<LoginCommand>(), default))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task RefreshToken_WithValidToken_ReturnsOkWithNewTokens()
    {
        // Arrange
        var refreshRequest = new RefreshTokenRequest
        {
            RefreshToken = "valid-refresh-token"
        };

        var expectedResponse = new LoginResponse
        {
            AccessToken = "new-access-token",
            RefreshToken = "new-refresh-token",
            User = new UserInfoDto
            {
                Id = "user-id",
                Name = "Test User",
                Email = "test@example.com",
                Role = "User",
                Position = "Developer"
            }
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<RefreshTokenCommand>(), default))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.RefreshToken(refreshRequest);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<LoginResponse>().Subject;
        response.AccessToken.Should().Be("new-access-token");
        response.RefreshToken.Should().Be("new-refresh-token");
    }

    [Fact]
    public async Task RefreshToken_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var refreshRequest = new RefreshTokenRequest
        {
            RefreshToken = "invalid-refresh-token"
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<RefreshTokenCommand>(), default))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid refresh token"));

        // Act
        var result = await _controller.RefreshToken(refreshRequest);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task RefreshToken_WithException_ReturnsBadRequest()
    {
        // Arrange
        var refreshRequest = new RefreshTokenRequest
        {
            RefreshToken = "some-token"
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<RefreshTokenCommand>(), default))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.RefreshToken(refreshRequest);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }
}
