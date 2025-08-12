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

public record GetSimpleDashboardDataQuery() : IRequest<SimpleDashboardDataResponse>;

public class SimpleDashboardDataResponse
{
    public List<ProjectProgressDto> ProjectProgress { get; set; } = new();
    public List<ActivityLogDto> RecentActivities { get; set; } = new();
    public List<TeamWorkloadDto> TeamWorkload { get; set; } = new();
    public List<ProductivityTrendDto> ProductivityTrends { get; set; } = new();
}

public class GetSimpleDashboardDataQueryHandler : IRequestHandler<GetSimpleDashboardDataQuery, SimpleDashboardDataResponse>
{
    private readonly ITaskifyContext _context;
    private readonly ILogger<GetSimpleDashboardDataQueryHandler> _logger;

    public GetSimpleDashboardDataQueryHandler(ITaskifyContext context, ILogger<GetSimpleDashboardDataQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<SimpleDashboardDataResponse> Handle(GetSimpleDashboardDataQuery request, CancellationToken cancellationToken)
    {
        var response = new SimpleDashboardDataResponse();
        var now = DateTime.UtcNow;
        var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek);

        // Get project progress
        var projectProgressList = await _context.Projects
            .AsNoTracking()
            .Select(p => new 
            {
                ProjectId = p.Id,
                ProjectName = p.Name,
                TotalTasks = p.Tasks.Count,
                CompletedTasks = p.Tasks.Count(t => t.Status == TaskStatus.Completed),
                CompletionPercentage = p.Tasks.Any() 
                    ? (double)p.Tasks.Count(t => t.Status == TaskStatus.Completed) / p.Tasks.Count * 100 
                    : 0,
                Tasks = p.Tasks.ToList()
            })
            .ToListAsync(cancellationToken);

        response.ProjectProgress = projectProgressList.Select(p => new ProjectProgressDto
        {
            ProjectId = p.ProjectId,
            ProjectName = p.ProjectName,
            TotalTasks = p.TotalTasks,
            CompletedTasks = p.CompletedTasks,
            CompletionPercentage = p.CompletionPercentage
        }).ToList();

        // Get recent activities
        response.RecentActivities = await GetRecentActivities(cancellationToken);

        // Get team workload
        response.TeamWorkload = await GetTeamWorkload(cancellationToken);

        // Get productivity trends
        response.ProductivityTrends = await GetProductivityTrends(startOfWeek, cancellationToken);

        return response;
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
