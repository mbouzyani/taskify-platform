using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Taskify.API.Controllers;
using Taskify.Application.DTOs;
using Taskify.Application.Queries.Dashboard;
using Taskify.Domain.Enums;
using Xunit;

namespace Taskify.API.Tests.Controllers;

public class DashboardControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly Mock<ILogger<DashboardController>> _loggerMock;
    private readonly DashboardController _controller;

    public DashboardControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _loggerMock = new Mock<ILogger<DashboardController>>();
        _controller = new DashboardController(_mediatorMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task GetDashboardData_Should_Return_OkResult_With_DashboardDataResponse()
    {
        // Arrange
        var dashboardData = new DashboardDataResponse
        {
            Stats = new DashboardStatsDto
            {
                TotalTasks = 10,
                CompletedTasks = 5,
                InProgressTasks = 3,
                OverdueTasks = 2
            },
            ProjectProgress = new List<ProjectProgressDto>
            {
                new ProjectProgressDto
                {
                    ProjectId = 1,
                    ProjectName = "Test Project",
                    CompletionPercentage = 75.5,
                    CompletedTasks = 3,
                    TotalTasks = 4
                }
            },
            RecentActivities = new List<ActivityLogDto>
            {
                new ActivityLogDto
                {
                    Id = 1,
                    Title = "Test Activity",
                    Description = "Task created",
                    Type = ActivityType.TaskCreated,
                    Timestamp = DateTime.UtcNow,
                    UserId = Guid.NewGuid()
                }
            },
            TeamWorkload = new List<TeamWorkloadDto>
            {
                new TeamWorkloadDto
                {
                    MemberId = Guid.NewGuid(),
                    MemberName = "John Doe",
                    AssignedTasks = 5,
                    CompletedTasks = 3,
                    UtilizationRate = 60.0
                }
            }
        };

        _mediatorMock.Setup(m => m.Send(It.IsAny<GetDashboardDataQuery>(), default))
                     .ReturnsAsync(dashboardData);

        // Act
        var result = await _controller.GetDashboardData();

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<DashboardDataResponse>().Subject;
        
        response.Stats.TotalTasks.Should().Be(10);
        response.ProjectProgress.Should().HaveCount(1);
        response.RecentActivities.Should().HaveCount(1);
        response.TeamWorkload.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetDashboardStats_Should_Return_OkResult_With_DashboardStatsDto()
    {
        // Arrange
        var dashboardData = new DashboardDataResponse
        {
            Stats = new DashboardStatsDto
            {
                TotalTasks = 15,
                CompletedTasks = 8,
                InProgressTasks = 4,
                OverdueTasks = 3
            }
        };

        _mediatorMock.Setup(m => m.Send(It.IsAny<GetDashboardDataQuery>(), default))
                     .ReturnsAsync(dashboardData);

        // Act
        var result = await _controller.GetDashboardStats();

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var stats = okResult.Value.Should().BeOfType<DashboardStatsDto>().Subject;
        
        stats.TotalTasks.Should().Be(15);
        stats.CompletedTasks.Should().Be(8);
        stats.InProgressTasks.Should().Be(4);
        stats.OverdueTasks.Should().Be(3);
    }

    [Fact]
    public async Task GetOverviewStats_Should_Return_OkResult_With_OverviewStatsDto()
    {
        // Arrange
        var dashboardData = new DashboardDataResponse
        {
            Stats = new DashboardStatsDto
            {
                TotalTasks = 25,
                CompletedTasks = 15,
                InProgressTasks = 6,
                OverdueTasks = 4,
                ProductivityScore = 85.5
            },
            ProjectProgress = new List<ProjectProgressDto>
            {
                new ProjectProgressDto 
                { 
                    ProjectId = 1, 
                    ProjectName = "Project 1",
                    CompletionPercentage = 100 
                },
                new ProjectProgressDto 
                { 
                    ProjectId = 2, 
                    ProjectName = "Project 2",
                    CompletionPercentage = 75 
                }
            },
            TeamWorkload = new List<TeamWorkloadDto>
            {
                new TeamWorkloadDto 
                { 
                    MemberId = Guid.NewGuid(), 
                    MemberName = "User 1",
                    AssignedTasks = 5
                },
                new TeamWorkloadDto 
                { 
                    MemberId = Guid.NewGuid(), 
                    MemberName = "User 2",
                    AssignedTasks = 7
                }
            }
        };

        _mediatorMock.Setup(m => m.Send(It.IsAny<GetDashboardDataQuery>(), default))
                     .ReturnsAsync(dashboardData);

        // Act
        var result = await _controller.GetOverviewStats();

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var stats = okResult.Value.Should().BeOfType<OverviewStatsDto>().Subject;
        
        stats.TotalProjects.Should().Be(2);
        stats.TotalTasks.Should().Be(25);
        stats.TotalUsers.Should().Be(2);
        stats.CompletedTasks.Should().Be(15);
        stats.ActiveProjects.Should().Be(1); // Only projects with < 100% completion
        stats.ProductivityScore.Should().Be(85.5);
    }

    [Fact]
    public async Task GetDashboardData_Should_Return_BadRequest_When_Stats_Are_Null()
    {
        // Arrange
        var dashboardData = new DashboardDataResponse
        {
            Stats = null
        };

        _mediatorMock.Setup(m => m.Send(It.IsAny<GetDashboardDataQuery>(), default))
                     .ReturnsAsync(dashboardData);

        // Act
        var result = await _controller.GetDashboardData();

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task GetDashboardStats_Should_Return_BadRequest_When_Stats_Are_Null()
    {
        // Arrange
        var dashboardData = new DashboardDataResponse
        {
            Stats = null
        };

        _mediatorMock.Setup(m => m.Send(It.IsAny<GetDashboardDataQuery>(), default))
                     .ReturnsAsync(dashboardData);

        // Act
        var result = await _controller.GetDashboardStats();

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task GetOverviewStats_Should_Return_BadRequest_When_Stats_Are_Null()
    {
        // Arrange
        var dashboardData = new DashboardDataResponse
        {
            Stats = null
        };

        _mediatorMock.Setup(m => m.Send(It.IsAny<GetDashboardDataQuery>(), default))
                     .ReturnsAsync(dashboardData);

        // Act
        var result = await _controller.GetOverviewStats();

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }
}
