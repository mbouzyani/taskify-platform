using System;
using Taskify.Domain.Enums;

namespace Taskify.Application.DTOs;

public class TeamMemberDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public UserRole Role { get; set; }
    public Position Position { get; set; }
    public string? Department { get; set; }
    public List<AssignedProjectDto> AssignedProjects { get; set; } = new();
    public TeamMemberStatsDto? Stats { get; set; }
    public int AssignedTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OverdueTasks { get; set; }
}
