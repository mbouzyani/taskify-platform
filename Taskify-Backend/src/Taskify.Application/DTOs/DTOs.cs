using TaskStatus = Taskify.Domain.Enums.TaskStatus;
using Taskify.Domain.Enums;

namespace Taskify.Application.DTOs;

public class PagedResultDto<T>
{
    public List<T> Items { get; set; } = new List<T>();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNext => PageNumber < TotalPages;
    public bool HasPrevious => PageNumber > 1;
}

public class TaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public TaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = null!;
    public string ProjectColor { get; set; } = null!;
    public Guid? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeAvatar { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Color { get; set; } = null!;
    public ProjectStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TaskCount { get; set; }
    public int CompletedTasks { get; set; }
    public double CompletionPercentage { get; set; }
    public int TodoTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int ReviewTasks { get; set; }
    public List<ProjectMemberDto> AssignedMembers { get; set; } = new();
    public int TotalMembers { get; set; }
}

public class DashboardStatsDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int TasksCompletedThisWeek { get; set; }
    public double ProductivityScore { get; set; }
    public List<TasksByStatusDto> TasksByStatus { get; set; } = new();
    public List<TasksByPriorityDto> TasksByPriority { get; set; } = new();
    public List<ProjectProgressDto> ProjectProgress { get; set; } = new();
    public List<ActivityLogDto> RecentActivities { get; set; } = new();
    public List<TeamWorkloadDto> TeamWorkload { get; set; } = new();
    public List<ProductivityTrendDto> ProductivityTrends { get; set; } = new();
}

public class TasksByStatusDto
{
    public TaskStatus Status { get; set; }
    public int Count { get; set; }
}

public class ActivityLogDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public ActivityType Type { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserAvatar { get; set; }
}

public class TeamWorkloadDto
{
    public Guid MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public string? MemberAvatar { get; set; }
    public int AssignedTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double UtilizationRate { get; set; }
}

public class ProductivityTrendDto
{
    public DateTime Date { get; set; }
    public int TasksCompleted { get; set; }
    public int TasksCreated { get; set; }
    public double ProductivityScore { get; set; }
}

public class TasksByPriorityDto
{
    public TaskPriority Priority { get; set; }
    public int Count { get; set; }
}

public class ProjectProgressDto
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = null!;
    public string Color { get; set; } = null!;
    public ProjectStatus Status { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int TodoTasks { get; set; }
    public double CompletionPercentage { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; }
    public int TotalCount { get; }
    public int Page { get; }
    public int PageSize { get; }
    public int TotalPages { get; }

    public PagedResult(List<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
    }
}

public class ProjectMemberDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Avatar { get; set; }
}

public class OverviewStatsDto
{
    public int TotalProjects { get; set; }
    public int TotalTasks { get; set; }
    public int TotalUsers { get; set; }
    public int CompletedTasks { get; set; }
    public int ActiveProjects { get; set; }
    public int TeamMembers { get; set; }
    public double CompletionRate { get; set; }
    public double ProductivityScore { get; set; }
}

public class ProjectAssignmentResultDto
{
    public TeamMemberDto UpdatedMember { get; set; } = null!;
    public ProjectDto UpdatedProject { get; set; } = null!;
    public string Message { get; set; } = string.Empty;
}

public class TaskAssignmentResultDto
{
    public TaskDto UpdatedTask { get; set; } = null!;
    public TeamMemberDto? UpdatedMember { get; set; }
    public string Message { get; set; } = string.Empty;
}
