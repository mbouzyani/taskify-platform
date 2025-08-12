using Taskify.Domain.Common;
using Taskify.Domain.Enums;
using TaskStatus = Taskify.Domain.Enums.TaskStatus;

namespace Taskify.Domain.Events;

public class TaskCreatedEvent : DomainEvent
{
    public Guid TaskId { get; }
    public string Title { get; }
    public int ProjectId { get; }
    public Guid? AssigneeId { get; }
    public DateTime CreatedAt { get; }
    public TaskPriority Priority { get; }

    public TaskCreatedEvent(Guid taskId, string title, int projectId, Guid? assigneeId, TaskPriority priority)
    {
        TaskId = taskId;
        Title = title;
        ProjectId = projectId;
        AssigneeId = assigneeId;
        Priority = priority;
        CreatedAt = DateTime.UtcNow;
    }
}

public class TaskStatusChangedEvent : DomainEvent
{
    public Guid TaskId { get; }
    public TaskStatus OldStatus { get; }
    public TaskStatus NewStatus { get; }
    public DateTime ChangedAt { get; }
    public Guid? ChangedBy { get; }
    public string TaskTitle { get; }

    public TaskStatusChangedEvent(Guid taskId, TaskStatus oldStatus, TaskStatus newStatus, string taskTitle, Guid? changedBy)
    {
        TaskId = taskId;
        OldStatus = oldStatus;
        NewStatus = newStatus;
        TaskTitle = taskTitle;
        ChangedBy = changedBy;
        ChangedAt = DateTime.UtcNow;
    }
}

public class TaskCompletedEvent : DomainEvent
{
    public Guid TaskId { get; }
    public int ProjectId { get; }
    public DateTime CompletedAt { get; }
    public Guid? CompletedBy { get; }
    public string TaskTitle { get; }
    public TimeSpan Duration { get; }

    public TaskCompletedEvent(Guid taskId, int projectId, string taskTitle, Guid? completedBy, DateTime createdAt)
    {
        TaskId = taskId;
        ProjectId = projectId;
        TaskTitle = taskTitle;
        CompletedBy = completedBy;
        CompletedAt = DateTime.UtcNow;
        Duration = CompletedAt - createdAt;
    }
}

public class TaskAssignedEvent : DomainEvent
{
    public Guid TaskId { get; }
    public string TaskTitle { get; }
    public Guid? OldAssigneeId { get; }
    public Guid NewAssigneeId { get; }
    public DateTime AssignedAt { get; }
    public Guid AssignedBy { get; }

    public TaskAssignedEvent(Guid taskId, string taskTitle, Guid? oldAssigneeId, Guid newAssigneeId, Guid assignedBy)
    {
        TaskId = taskId;
        TaskTitle = taskTitle;
        OldAssigneeId = oldAssigneeId;
        NewAssigneeId = newAssigneeId;
        AssignedBy = assignedBy;
        AssignedAt = DateTime.UtcNow;
    }
}

public class TaskPriorityChangedEvent : DomainEvent
{
    public Guid TaskId { get; }
    public string TaskTitle { get; }
    public TaskPriority OldPriority { get; }
    public TaskPriority NewPriority { get; }
    public DateTime ChangedAt { get; }
    public Guid ChangedBy { get; }

    public TaskPriorityChangedEvent(Guid taskId, string taskTitle, TaskPriority oldPriority, TaskPriority newPriority, Guid changedBy)
    {
        TaskId = taskId;
        TaskTitle = taskTitle;
        OldPriority = oldPriority;
        NewPriority = newPriority;
        ChangedBy = changedBy;
        ChangedAt = DateTime.UtcNow;
    }
}

public class TaskProjectChangedEvent : DomainEvent
{
    public Guid TaskId { get; }
    public string TaskTitle { get; }
    public int OldProjectId { get; }
    public int NewProjectId { get; }
    public DateTime ChangedAt { get; }

    public TaskProjectChangedEvent(Guid taskId, string taskTitle, int oldProjectId, int newProjectId)
    {
        TaskId = taskId;
        TaskTitle = taskTitle;
        OldProjectId = oldProjectId;
        NewProjectId = newProjectId;
        ChangedAt = DateTime.UtcNow;
    }
}

public class TaskEditedEvent : DomainEvent
{
    public Guid TaskId { get; }
    public string OldTitle { get; }
    public string NewTitle { get; }
    public string OldDescription { get; }
    public string NewDescription { get; }
    public TaskPriority OldPriority { get; }
    public TaskPriority NewPriority { get; }
    public DateTime EditedAt { get; }
    public Guid? EditedBy { get; }

    public TaskEditedEvent(
        Guid taskId,
        string oldTitle,
        string newTitle,
        string oldDescription,
        string newDescription,
        TaskPriority oldPriority,
        TaskPriority newPriority,
        Guid? editedBy)
    {
        TaskId = taskId;
        OldTitle = oldTitle;
        NewTitle = newTitle;
        OldDescription = oldDescription;
        NewDescription = newDescription;
        OldPriority = oldPriority;
        NewPriority = newPriority;
        EditedBy = editedBy;
        EditedAt = DateTime.UtcNow;
    }
}

public class TaskDeletedEvent : DomainEvent
{
    public Guid TaskId { get; }
    public string Title { get; }
    public int ProjectId { get; }
    public TaskStatus Status { get; }
    public DateTime DeletedAt { get; }
    public Guid? DeletedBy { get; }

    public TaskDeletedEvent(Guid taskId, string title, int projectId, TaskStatus status, Guid? deletedBy)
    {
        TaskId = taskId;
        Title = title;
        ProjectId = projectId;
        Status = status;
        DeletedBy = deletedBy;
        DeletedAt = DateTime.UtcNow;
    }
}
