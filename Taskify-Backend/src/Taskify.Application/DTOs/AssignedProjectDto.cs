using Taskify.Domain.Enums;

namespace Taskify.Application.DTOs;

public class AssignedProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public ProjectStatus Status { get; set; }
    public DateTime AssignedAt { get; set; }
}
