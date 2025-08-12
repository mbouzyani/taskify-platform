using AutoMapper;
using MediatR;
using Taskify.Application.DTOs;
using Taskify.Application.Interfaces;
using Taskify.Domain.Exceptions;
using TaskFilters = Taskify.Domain.ValueObjects.TaskFilters;

namespace Taskify.Application.Queries.Tasks;

public record GetTasksQuery : IRequest<PagedResult<TaskDto>>
{
    public TaskFilters? Filters { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; }
}

public class GetTasksQueryHandler : IRequestHandler<GetTasksQuery, PagedResult<TaskDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetTasksQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<TaskDto>> Handle(GetTasksQuery request, CancellationToken cancellationToken)
    {
        var result = await _unitOfWork.Tasks.GetTasksAsync(
            request.Filters ?? new TaskFilters(),
            request.Page,
            request.PageSize,
            request.SortBy,
            request.SortDescending);

        return new PagedResult<TaskDto>(
            _mapper.Map<List<TaskDto>>(result.Items),
            result.TotalCount,
            result.Page,
            result.PageSize);
    }
}

public record GetTaskByIdQuery : IRequest<TaskDto>
{
    public Guid Id { get; init; }
}

public class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, TaskDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetTaskByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TaskDto> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.Tasks.GetByIdWithDetailsAsync(request.Id)
            ?? throw new TaskNotFoundException(request.Id);

        return _mapper.Map<TaskDto>(task);
    }
}

public record GetDashboardStatsQuery : IRequest<DashboardStatsDto>
{
    public Guid? UserId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetDashboardStatsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var fromDate = request.FromDate ?? DateTime.UtcNow.AddDays(-30);
        var toDate = request.ToDate ?? DateTime.UtcNow;

        var tasksByStatus = await _unitOfWork.Tasks.GetTasksCountByStatusAsync();
        var tasksByPriority = await _unitOfWork.Tasks.GetTasksCountByPriorityAsync();
        var completedTasksCount = await _unitOfWork.Tasks.GetCompletedTasksCountAsync(fromDate, toDate);
        var projects = await _unitOfWork.Projects.GetAllWithTasksAsync();

        var stats = new DashboardStatsDto
        {
            TotalTasks = tasksByStatus.Values.Sum(),
            CompletedTasks = tasksByStatus.GetValueOrDefault(Domain.Enums.TaskStatus.Completed),
            InProgressTasks = tasksByStatus.GetValueOrDefault(Domain.Enums.TaskStatus.InProgress),
            TasksCompletedThisWeek = completedTasksCount,
            TasksByStatus = tasksByStatus
                .Select(kvp => new TasksByStatusDto { Status = kvp.Key, Count = kvp.Value })
                .ToList(),
            TasksByPriority = tasksByPriority
                .Select(kvp => new TasksByPriorityDto { Priority = kvp.Key, Count = kvp.Value })
                .ToList(),
            ProjectProgress = _mapper.Map<List<ProjectProgressDto>>(projects),
            ProductivityScore = CalculateProductivityScore(tasksByStatus, completedTasksCount)
        };

        return stats;
    }

    private static double CalculateProductivityScore(Dictionary<Domain.Enums.TaskStatus, int> tasksByStatus, int completedTasksThisWeek)
    {
        var totalTasks = tasksByStatus.Values.Sum();
        if (totalTasks == 0) return 0;

        var completedTasks = tasksByStatus.GetValueOrDefault(Domain.Enums.TaskStatus.Completed);
        var baseScore = (completedTasks / (double)totalTasks) * 70;
        var weeklyBonus = Math.Min(completedTasksThisWeek * 5, 30);

        return Math.Round(baseScore + weeklyBonus, 2);
    }
}
