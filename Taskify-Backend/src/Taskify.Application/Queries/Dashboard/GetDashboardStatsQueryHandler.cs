using MediatR;
using Taskify.Application.DTOs;
using Taskify.Application.Interfaces;
using Taskify.Domain.Enums;
using System.Linq;

namespace Taskify.Application.Queries.Dashboard;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetDashboardStatsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var filter = new Domain.ValueObjects.TaskFilters(
            assigneeId: request.UserId,
            dueDateFrom: request.FromDate,
            dueDateTo: request.ToDate);

        var result = await _unitOfWork.Tasks.GetTasksAsync(filter, 1, int.MaxValue, null, false);
        var tasks = result.Items;
        var now = DateTime.UtcNow;

        var completedThisWeek = tasks.Count(t => 
            t.Status == Domain.Enums.TaskStatus.Completed && 
            t.CompletedAt.HasValue && 
            t.CompletedAt.Value >= DateTime.UtcNow.AddDays(-7));

        var completedTasks = tasks.Count(t => t.Status == Domain.Enums.TaskStatus.Completed);

        var stats = new DashboardStatsDto
        {
            TotalTasks = tasks.Count(),
            CompletedTasks = completedTasks,
            InProgressTasks = tasks.Count(t => t.Status == Domain.Enums.TaskStatus.InProgress),
            OverdueTasks = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < now && t.Status != Domain.Enums.TaskStatus.Completed),
            TasksCompletedThisWeek = completedThisWeek,
            ProductivityScore = tasks.Any() ? (completedTasks * 100.0 / tasks.Count()) : 0,
            TasksByStatus = tasks
                .GroupBy(t => t.Status)
                .Select(g => new TasksByStatusDto { Status = g.Key, Count = g.Count() })
                .ToList(),
            TasksByPriority = tasks
                .GroupBy(t => t.Priority)
                .Select(g => new TasksByPriorityDto { Priority = g.Key, Count = g.Count() })
                .ToList(),
            ProjectProgress = tasks
                .GroupBy(t => t.Project)
                .Select(g => new ProjectProgressDto 
                { 
                    ProjectId = g.Key.Id,
                    ProjectName = g.Key.Name, 
                    TotalTasks = g.Count(),
                    CompletedTasks = g.Count(t => t.Status == Domain.Enums.TaskStatus.Completed)
                })
                .ToList()
        };

        return stats;
    }
}
