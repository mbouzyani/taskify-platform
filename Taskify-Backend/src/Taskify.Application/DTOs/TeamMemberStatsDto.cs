namespace Taskify.Application.DTOs;

public class TeamMemberStatsDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double CompletionRate { get; set; }
    public TimeSpan AverageTaskCompletionTime { get; set; }
    public List<TasksByProjectDto> TasksByProject { get; set; } = new();
}
