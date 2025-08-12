using Taskify.Domain.Common;
using Taskify.Domain.Enums;

namespace Taskify.Domain.Events;

public class TeamMemberInvitedEvent : DomainEvent
{
    public Guid UserId { get; }
    public string Name { get; }
    public string Email { get; }
    public UserRole Role { get; }
    public DateTime InvitedAt { get; }

    public TeamMemberInvitedEvent(Guid userId, string name, string email, UserRole role)
    {
        UserId = userId;
        Name = name;
        Email = email;
        Role = role;
        InvitedAt = DateTime.UtcNow;
    }
}

public class TeamMemberProfileUpdatedEvent : DomainEvent
{
    public Guid UserId { get; }
    public string OldName { get; }
    public string NewName { get; }
    public string? OldAvatar { get; }
    public string? NewAvatar { get; }
    public DateTime UpdatedAt { get; }

    public TeamMemberProfileUpdatedEvent(Guid userId, string oldName, string newName, string? oldAvatar, string? newAvatar)
    {
        UserId = userId;
        OldName = oldName;
        NewName = newName;
        OldAvatar = oldAvatar;
        NewAvatar = newAvatar;
        UpdatedAt = DateTime.UtcNow;
    }
}

public class TeamMemberRoleChangedEvent : DomainEvent
{
    public Guid UserId { get; }
    public string UserName { get; }
    public UserRole OldRole { get; }
    public UserRole NewRole { get; }
    public DateTime ChangedAt { get; }

    public TeamMemberRoleChangedEvent(Guid userId, string userName, UserRole oldRole, UserRole newRole)
    {
        UserId = userId;
        UserName = userName;
        OldRole = oldRole;
        NewRole = newRole;
        ChangedAt = DateTime.UtcNow;
    }
}

public class TeamMemberRemovedEvent : DomainEvent
{
    public Guid UserId { get; }
    public string Name { get; }
    public string Email { get; }
    public UserRole Role { get; }
    public DateTime RemovedAt { get; }

    public TeamMemberRemovedEvent(Guid userId, string name, string email, UserRole role)
    {
        UserId = userId;
        Name = name;
        Email = email;
        Role = role;
        RemovedAt = DateTime.UtcNow;
    }
}
