using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Taskify.API.Controllers;
using Taskify.Application.Commands.Projects;
using Taskify.Application.DTOs;
using Taskify.Application.Queries.Projects;
using Taskify.Domain.Enums;
using Xunit;

namespace Taskify.API.Tests.Controllers;

public class ProjectsControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly ProjectsController _controller;

    public ProjectsControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new ProjectsController(_mediatorMock.Object);
    }

    [Fact]
    public async Task GetProjects_ReturnsOkWithProjectsList()
    {
        // Arrange
        var expectedProjects = new List<ProjectDto>
        {
            new ProjectDto
            {
                Id = 1,
                Name = "Project Alpha",
                Description = "First project description",
                Color = "#FF0000",
                Status = ProjectStatus.Active,
                TaskCount = 5,
                CompletedTasks = 2,
                CompletionPercentage = 40.0
            }
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetAllProjectsQuery>(), default))
            .ReturnsAsync(expectedProjects);

        // Act
        var result = await _controller.GetProjects();

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var projects = okResult.Value.Should().BeAssignableTo<List<ProjectDto>>().Subject;
        projects.Should().HaveCount(1);
        projects[0].Name.Should().Be("Project Alpha");
    }

    [Fact]
    public async Task CreateProject_WithValidData_ReturnsCreatedWithProject()
    {
        // Arrange
        var command = new CreateProjectCommand
        {
            Name = "New Project",
            Description = "New project description",
            Color = "#0000FF"
        };

        var expectedProject = new ProjectDto
        {
            Id = 1,
            Name = "New Project",
            Description = "New project description",
            Color = "#0000FF",
            Status = ProjectStatus.Active
        };

        _mediatorMock
            .Setup(m => m.Send(command, default))
            .ReturnsAsync(expectedProject);

        // Act
        var result = await _controller.CreateProject(command);

        // Assert
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var project = createdResult.Value.Should().BeOfType<ProjectDto>().Subject;
        project.Name.Should().Be("New Project");
    }

    [Fact]
    public async Task UpdateProject_WithValidData_ReturnsOkWithUpdatedProject()
    {
        // Arrange
        var projectId = 1;
        var command = new UpdateProjectCommand
        {
            Id = projectId,
            Name = "Updated Project",
            Description = "Updated description",
            Color = "#FF00FF"
        };

        var expectedProject = new ProjectDto
        {
            Id = projectId,
            Name = "Updated Project",
            Description = "Updated description",
            Color = "#FF00FF",
            Status = ProjectStatus.Active
        };

        _mediatorMock
            .Setup(m => m.Send(command, default))
            .ReturnsAsync(expectedProject);

        // Act
        var result = await _controller.UpdateProject(projectId, command);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var project = okResult.Value.Should().BeOfType<ProjectDto>().Subject;
        project.Name.Should().Be("Updated Project");
    }

    [Fact]
    public async Task DeleteProject_WithValidId_ReturnsNoContent()
    {
        // Arrange
        var projectId = 1;

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<DeleteProjectCommand>(), default))
            .ReturnsAsync(Unit.Value);

        // Act
        var result = await _controller.DeleteProject(projectId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<NoContentResult>();
    }
}
