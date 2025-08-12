using Taskify.Domain.Common;
using Taskify.Domain.Enums;

namespace Taskify.Domain.Events;

public class TeamMemberPositionChangedEvent : DomainEvent
{
    public Guid UserId { get; }
    public string UserName { get; }
    public Position OldPosition { get; }
    public Position NewPosition { get; }
    public DateTime ChangedAt { get; }

    public TeamMemberPositionChangedEvent(Guid userId, string userName, Position oldPosition, Position newPosition)
    {
        UserId = userId;
        UserName = userName;
        OldPosition = oldPosition;
        NewPosition = newPosition;
        ChangedAt = DateTime.UtcNow;
    }
}

public class TeamMemberProjectAssignedEvent : DomainEvent
{
    public Guid UserId { get; }
    public string UserName { get; }
    public int ProjectId { get; }
    public string ProjectName { get; }
    public DateTime AssignedAt { get; }

    public TeamMemberProjectAssignedEvent(Guid userId, string userName, int projectId, string projectName)
    {
        UserId = userId;
        UserName = userName;
        ProjectId = projectId;
        ProjectName = projectName;
        AssignedAt = DateTime.UtcNow;
    }
}

public class TeamMemberProjectUnassignedEvent : DomainEvent
{
    public Guid UserId { get; }
    public string UserName { get; }
    public int ProjectId { get; }
    public string ProjectName { get; }
    public DateTime UnassignedAt { get; }

    public TeamMemberProjectUnassignedEvent(Guid userId, string userName, int projectId, string projectName)
    {
        UserId = userId;
        UserName = userName;
        ProjectId = projectId;
        ProjectName = projectName;
        UnassignedAt = DateTime.UtcNow;
    }
}

public class TeamMemberDepartmentChangedEvent : DomainEvent
{
    public Guid UserId { get; }
    public string UserName { get; }
    public string? OldDepartment { get; }
    public string? NewDepartment { get; }
    public DateTime ChangedAt { get; }

    public TeamMemberDepartmentChangedEvent(Guid userId, string userName, string? oldDepartment, string? newDepartment)
    {
        UserId = userId;
        UserName = userName;
        OldDepartment = oldDepartment;
        NewDepartment = newDepartment;
        ChangedAt = DateTime.UtcNow;
    }
}
