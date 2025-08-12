using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Taskify.Application.DTOs;
using Taskify.Application.Interfaces;
using Taskify.Domain.Common;
using Taskify.Domain.Entities;
using Taskify.Domain.Enums;
using Taskify.Domain.Events;
using DomainTask = Taskify.Domain.Entities.Task;
using TaskStatus = Taskify.Domain.Enums.TaskStatus;

namespace Taskify.Application.Queries.Dashboard;

public record GetDashboardDataQuery() : IRequest<DashboardDataResponse>;

public class DashboardDataResponse
{
    public DashboardStatsDto Stats { get; set; } = new();
    public List<ActivityLogDto> RecentActivities { get; set; } = new();
    public List<ProjectProgressDto> ProjectProgress { get; set; } = new();
    public List<TeamWorkloadDto> TeamWorkload { get; set; } = new();
    public List<ProductivityTrendDto> ProductivityTrends { get; set; } = new();
}

public class GetDashboardDataQueryHandler : IRequestHandler<GetDashboardDataQuery, DashboardDataResponse>
{
    private readonly ITaskifyContext _context;
    private readonly ILogger<GetDashboardDataQueryHandler> _logger;

    public GetDashboardDataQueryHandler(ITaskifyContext context, ILogger<GetDashboardDataQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DashboardDataResponse> Handle(GetDashboardDataQuery request, CancellationToken cancellationToken)
    {
        var response = new DashboardDataResponse();
        var now = DateTime.UtcNow;
        var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek);

        // Get basic task statistics with necessary includes
        var tasks = await _context.Tasks
            .AsNoTracking()
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .ToListAsync(cancellationToken);

        // Calculate task statistics
        var taskStats = new DashboardStatsDto
        {
            TotalTasks = tasks.Count,
            CompletedTasks = tasks.Count(t => t.Status == TaskStatus.Completed),
            InProgressTasks = tasks.Count(t => t.Status == TaskStatus.InProgress),
            OverdueTasks = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < now && t.Status != TaskStatus.Completed),
            TasksCompletedThisWeek = tasks.Count(t => t.Status == TaskStatus.Completed && 
                t.CompletedAt.HasValue && t.CompletedAt.Value >= startOfWeek),
            TasksByStatus = tasks.GroupBy(t => t.Status)
                .Select(g => new TasksByStatusDto { Status = g.Key, Count = g.Count() }).ToList(),
            TasksByPriority = tasks.GroupBy(t => t.Priority)
                .Select(g => new TasksByPriorityDto { Priority = g.Key, Count = g.Count() }).ToList(),
            ProductivityScore = tasks.Any() 
                ? (double)tasks.Count(t => t.Status == TaskStatus.Completed) / tasks.Count * 100 
                : 0
        };

        response.Stats = taskStats;

        // Get project progress
        var projectProgressList = await _context.Projects
            .AsNoTracking()
            .Select(p => new 
            {
                ProjectId = p.Id,
                ProjectName = p.Name,
                Color = p.Color,
                Status = p.Status,
                TotalTasks = p.Tasks.Count,
                CompletedTasks = p.Tasks.Count(t => t.Status == TaskStatus.Completed),
                InProgressTasks = p.Tasks.Count(t => t.Status == TaskStatus.InProgress),
                TodoTasks = p.Tasks.Count(t => t.Status == TaskStatus.Todo),
                CompletionPercentage = p.Tasks.Any() 
                    ? (double)p.Tasks.Count(t => t.Status == TaskStatus.Completed) / p.Tasks.Count * 100 
                    : 0
            })
            .ToListAsync(cancellationToken);

        response.ProjectProgress = projectProgressList.Select(p => new ProjectProgressDto
        {
            ProjectId = p.ProjectId,
            ProjectName = p.ProjectName,
            TotalTasks = p.TotalTasks,
            CompletedTasks = p.CompletedTasks,
            InProgressTasks = p.InProgressTasks,
            TodoTasks = p.TodoTasks,
            CompletionPercentage = p.CompletionPercentage,
            Color = p.Color,
            Status = p.Status
        }).ToList();

        // Get recent activities
        response.RecentActivities = await GetRecentActivities(cancellationToken);

        // Get team workload
        response.TeamWorkload = await GetTeamWorkload(cancellationToken);

        // Get productivity trends
        response.ProductivityTrends = await GetProductivityTrends(startOfWeek, cancellationToken);

        return response;
    }

    private static double? CalculateAverageCompletionTime(List<Domain.Entities.Task> tasks)
    {
        var completedTasks = tasks.Where(t => t.Status == TaskStatus.Completed && t.CompletedAt.HasValue)
            .ToList();

        if (!completedTasks.Any())
            return null;

        return completedTasks.Average(t => (t.CompletedAt!.Value - t.CreatedAt).TotalHours);
    }

    private static DateTime? CalculateEstimatedCompletion(List<Domain.Entities.Task> tasks)
    {
        if (!tasks.Any() || tasks.All(t => t.Status == TaskStatus.Completed))
            return null;

        var completedTasks = tasks.Where(t => t.Status == TaskStatus.Completed);
        if (!completedTasks.Any())
            return null;

        var avgCompletionTime = completedTasks
            .Average(t => (t.Events.OfType<TaskCompletedEvent>().First().OccurredOn - 
                          t.Events.OfType<TaskCreatedEvent>().First().OccurredOn).TotalDays);

        var remainingTasks = tasks.Count(t => t.Status != TaskStatus.Completed);
        
        return DateTime.UtcNow.AddDays(avgCompletionTime * remainingTasks);
    }

    private async Task<List<ActivityLogDto>> GetRecentActivities(CancellationToken cancellationToken)
    {
        var activities = await _context.ActivityLogRepository.GetRecentActivitiesAsync(10, cancellationToken);
        
        return activities.Select(a => new ActivityLogDto
        {
            Id = a.Id,
            Title = a.Title,
            Description = a.Description,
            Timestamp = a.Timestamp,
            Type = a.Type,
            UserId = a.UserId,
            UserName = a.User?.Name ?? "Unknown",
            UserAvatar = a.User?.Avatar
        }).ToList();
    }

    private async Task<List<TeamWorkloadDto>> GetTeamWorkload(CancellationToken cancellationToken)
    {
        return await _context.Users
            .AsNoTracking()
            .Select(u => new TeamWorkloadDto
            {
                MemberId = u.Id,
                MemberName = u.Name,
                MemberAvatar = u.Avatar,
                AssignedTasks = u.AssignedTasks.Count,
                CompletedTasks = u.AssignedTasks.Count(t => t.Status == TaskStatus.Completed),
                OverdueTasks = u.AssignedTasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow && t.Status != TaskStatus.Completed),
                UtilizationRate = u.AssignedTasks.Any()
                    ? (double)u.AssignedTasks.Count(t => t.Status == TaskStatus.Completed) / u.AssignedTasks.Count * 100
                    : 0
            })
            .ToListAsync(cancellationToken);
    }

    private async Task<List<ProductivityTrendDto>> GetProductivityTrends(DateTime startDate, CancellationToken cancellationToken)
    {
        var trends = new List<ProductivityTrendDto>();
        var completedTasks = await _context.Tasks
            .Where(t => t.CompletedAt >= startDate)
            .ToListAsync(cancellationToken);

        var createdTasks = await _context.Tasks
            .Where(t => t.CreatedAt >= startDate)
            .ToListAsync(cancellationToken);

        for (var date = startDate.Date; date.Date <= DateTime.UtcNow.Date; date = date.AddDays(1))
        {
            var completedOnDate = completedTasks.Count(t => t.CompletedAt?.Date == date.Date);
            var createdOnDate = createdTasks.Count(t => t.CreatedAt.Date == date.Date);

            trends.Add(new ProductivityTrendDto
            {
                Date = date,
                TasksCompleted = completedOnDate,
                TasksCreated = createdOnDate,
                ProductivityScore = createdOnDate > 0
                    ? (double)completedOnDate / createdOnDate * 100
                    : completedOnDate > 0 ? 100 : 0
            });
        }

        return trends;
    }
}
