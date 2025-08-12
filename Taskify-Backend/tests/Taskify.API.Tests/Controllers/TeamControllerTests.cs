using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Taskify.API.Controllers;
using Taskify.Application.Commands.Team;
using Taskify.Application.DTOs;
using Taskify.Application.Queries.Team;
using Taskify.Domain.Enums;
using Taskify.Domain.Exceptions;
using Xunit;

namespace Taskify.API.Tests.Controllers;

public class TeamControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly Mock<ILogger<TeamController>> _loggerMock;
    private readonly TeamController _controller;

    public TeamControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _loggerMock = new Mock<ILogger<TeamController>>();
        _controller = new TeamController(_mediatorMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task GetTeamMembers_WithIncludeTaskStats_ReturnsOkWithTeamMembers()
    {
        // Arrange
        var expectedMembers = new List<TeamMemberDto>
        {
            new TeamMemberDto
            {
                Id = Guid.NewGuid(),
                Name = "Mark Barklet",
                Email = "mark@example.com",
                Role = UserRole.Member,
                Position = Position.BackendDeveloper,
                AssignedTasks = 5,
                CompletedTasks = 3
            }
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetTeamMembersQuery>(), default))
            .ReturnsAsync(expectedMembers);

        // Act
        var result = await _controller.GetTeamMembers(includeTaskStats: true);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var members = okResult.Value.Should().BeAssignableTo<List<TeamMemberDto>>().Subject;
        members.Should().HaveCount(1);
        members[0].Name.Should().Be("Mark Barklet");
    }

    [Fact]
    public async Task GetTeamMember_WithValidId_ReturnsOkWithTeamMember()
    {
        // Arrange
        var memberId = Guid.NewGuid();
        var expectedMember = new TeamMemberDto
        {
            Id = memberId,
            Name = "Mark Barklet",
            Email = "mark@example.com",
            Role = UserRole.Member,
            Position = Position.FullStackDeveloper
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetTeamMemberByIdQuery>(), default))
            .ReturnsAsync(expectedMember);

        // Act
        var result = await _controller.GetTeamMember(memberId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var member = okResult.Value.Should().BeOfType<TeamMemberDto>().Subject;
        member.Id.Should().Be(memberId);
        member.Name.Should().Be("Mark Barklet");
    }

    [Fact]
    public async Task GetTeamMember_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var memberId = Guid.NewGuid();

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetTeamMemberByIdQuery>(), default))
            .ThrowsAsync(new UserNotFoundException(memberId));

        // Act
        var result = await _controller.GetTeamMember(memberId);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task InviteTeamMember_WithValidData_ReturnsCreatedWithTeamMember()
    {
        // Arrange
        var command = new InviteTeamMemberCommand
        {
            Email = "newmember@example.com",
            Name = "New Member",
            Role = UserRole.Member,
            Position = Position.FrontendDeveloper
        };

        var expectedMember = new TeamMemberDto
        {
            Id = Guid.NewGuid(),
            Name = "New Member",
            Email = "newmember@example.com",
            Role = UserRole.Member,
            Position = Position.FrontendDeveloper
        };

        _mediatorMock
            .Setup(m => m.Send(command, default))
            .ReturnsAsync(expectedMember);

        // Act
        var result = await _controller.InviteTeamMember(command);

        // Assert
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var member = createdResult.Value.Should().BeOfType<TeamMemberDto>().Subject;
        member.Email.Should().Be("newmember@example.com");
        member.Name.Should().Be("New Member");
    }

    [Fact]
    public async Task RemoveTeamMember_WithValidId_ReturnsNoContent()
    {
        // Arrange
        var memberId = Guid.NewGuid();

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<RemoveTeamMemberCommand>(), default))
            .ReturnsAsync(Unit.Value);

        // Act
        var result = await _controller.RemoveTeamMember(memberId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<NoContentResult>();
    }
}
