using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Taskify.API.Controllers;
using Taskify.Application.Commands.Tasks;
using Taskify.Application.DTOs;
using Taskify.Application.Queries.Tasks;
using Taskify.Domain.Enums;
using Xunit;
using TaskStatus = Taskify.Domain.Enums.TaskStatus;

namespace Taskify.API.Tests.Controllers;

public class TasksControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly Mock<ILogger<TasksController>> _loggerMock;
    private readonly TasksController _controller;

    public TasksControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _loggerMock = new Mock<ILogger<TasksController>>();
        _controller = new TasksController(_mediatorMock.Object);
    }

    [Fact]
    public async Task GetTasks_ReturnsOkWithTaskList()
    {
        // Arrange
        var taskList = new List<TaskDto>
        {
            new TaskDto
            {
                Id = Guid.NewGuid(),
                Title = "Test Task",
                Description = "Test Description",
                Status = TaskStatus.Todo,
                Priority = TaskPriority.Medium,
                ProjectId = 1,
                ProjectName = "Test Project"
            }
        };
        var expectedTasks = new PagedResult<TaskDto>(taskList, 1, 1, 10);

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetTasksQuery>(), default))
            .ReturnsAsync(expectedTasks);

        // Act
        var result = await _controller.GetTasks(null, null, null, null, null, null, null, 1, 10, null, false);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var tasks = okResult.Value.Should().BeOfType<PagedResult<TaskDto>>().Subject;
        tasks.Items.Should().HaveCount(1);
        tasks.Items.First().Title.Should().Be("Test Task");
    }

    [Fact]
    public async Task CreateTask_ReturnsCreatedWithTask()
    {
        // Arrange
        var command = new CreateTaskCommand
        {
            Title = "New Task",
            Description = "New Description",
            Priority = TaskPriority.High,
            ProjectId = 1
        };

        var expectedTask = new TaskDto
        {
            Id = Guid.NewGuid(),
            Title = command.Title,
            Description = command.Description,
            Status = TaskStatus.Todo,
            Priority = TaskPriority.High,
            ProjectId = 1
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<CreateTaskCommand>(), default))
            .ReturnsAsync(expectedTask);

        // Act
        var result = await _controller.CreateTask(command);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var task = createdResult.Value.Should().BeOfType<TaskDto>().Subject;
        task.Title.Should().Be("New Task");
    }

    [Fact]
    public async Task UpdateTask_ReturnsOkWithUpdatedTask()
    {
        // Arrange
        var taskId = Guid.NewGuid();
        var command = new UpdateTaskCommand
        {
            Id = taskId,
            Title = "Updated Task",
            Status = TaskStatus.InProgress,
            Priority = TaskPriority.High
        };

        var expectedTask = new TaskDto
        {
            Id = taskId,
            Title = "Updated Task",
            Status = TaskStatus.InProgress,
            Priority = TaskPriority.High
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<UpdateTaskCommand>(), default))
            .ReturnsAsync(expectedTask);

        // Act
        var result = await _controller.UpdateTask(taskId, command);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var task = okResult.Value.Should().BeOfType<TaskDto>().Subject;
        task.Title.Should().Be("Updated Task");
    }

    [Fact]
    public async Task DeleteTask_ReturnsNoContent()
    {
        // Arrange
        var taskId = Guid.NewGuid();
        var command = new DeleteTaskCommand
        {
            Id = taskId
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<DeleteTaskCommand>(), default))
            .ReturnsAsync(Unit.Value);

        // Act
        var result = await _controller.DeleteTask(taskId);

        // Assert
        result.Should().BeOfType<NoContentResult>();
        _mediatorMock.Verify(m => m.Send(It.IsAny<DeleteTaskCommand>(), default), Times.Once);
    }
}
