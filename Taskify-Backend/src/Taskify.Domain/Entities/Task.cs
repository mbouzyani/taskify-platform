using Taskify.Domain.Common;
using Taskify.Domain.Enums;
using Taskify.Domain.Events;
using Taskify.Domain.Exceptions;

namespace Taskify.Domain.Entities;

public class Task : BaseEntity, IAggregateRoot
{
    public string Title { get; private set; }
    public string Description { get; private set; }
    public Enums.TaskStatus Status { get; private set; }
    public TaskPriority Priority { get; private set; }
    public int ProjectId { get; private set; }
    public Guid? AssigneeId { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    
    // Navigation properties
    public Project Project { get; private set; } = null!;
    public User? Assignee { get; private set; }
    public ICollection<DomainEvent> Events { get; private set; } = new List<DomainEvent>();

    private Task(string title, string description, TaskPriority priority, Enums.TaskStatus status, int projectId, Guid? assigneeId = null, DateTime? dueDate = null)
    {
        Title = !string.IsNullOrWhiteSpace(title) ? title : throw new ArgumentException("Title cannot be empty", nameof(title));
        Description = description ?? string.Empty;
        Status = status;
        Priority = priority;
        ProjectId = projectId;
        AssigneeId = assigneeId;
        DueDate = dueDate;
    }

    public static Task Create(string title, string description, TaskPriority priority, Enums.TaskStatus status, int projectId, Guid? assigneeId = null, DateTime? dueDate = null)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException("Title cannot be empty", nameof(title));
        }

        if (projectId <= 0)
        {
            throw new ArgumentException("Project ID must be greater than 0", nameof(projectId));
        }

        var task = new Task(title, description ?? string.Empty, priority, status, projectId, assigneeId, dueDate);
        task.AddDomainEvent(new TaskCreatedEvent(task.Id, task.Title, task.ProjectId, task.AssigneeId, task.Priority));
        return task;
    }

    public void UpdateStatus(Enums.TaskStatus newStatus)
    {
        if (!IsValidStatusTransition(Status, newStatus))
        {
            throw new InvalidTaskStatusTransitionException(Status, newStatus);
        }

        var oldStatus = Status;
        Status = newStatus;
        AddDomainEvent(new TaskStatusChangedEvent(Id, oldStatus, newStatus, Title, AssigneeId));

        if (newStatus == Enums.TaskStatus.Completed)
        {
            MarkAsCompleted();
        }
    }

    public void AssignTo(Guid userId)
    {
        var oldAssigneeId = AssigneeId;
        AssigneeId = userId;
        UpdateModifiedDate();
        AddDomainEvent(new TaskAssignedEvent(Id, Title, oldAssigneeId, userId, userId));
    }

    public void UnassignTask()
    {
        if (AssigneeId.HasValue)
        {
            AssigneeId = null;
            Assignee = null;
            UpdateModifiedDate();
        }
    }

    public void SetDueDate(DateTime dueDate)
    {
        var today = DateTime.UtcNow.Date;
        if (dueDate.Date < today)
        {
            throw new ArgumentException("Due date cannot be in the past", nameof(dueDate));
        }

        DueDate = dueDate;
        UpdateModifiedDate();
    }

    public void MarkAsCompleted()
    {
        if (Status != Enums.TaskStatus.Completed)
        {
            Status = Enums.TaskStatus.Completed;
        }
        
        CompletedAt = DateTime.UtcNow;
        UpdateModifiedDate();
        AddDomainEvent(new TaskCompletedEvent(Id, ProjectId, Title, AssigneeId, CompletedAt.Value));
    }

    public void UpdateDetails(string title, string description, TaskPriority priority)
    {
        var oldTitle = Title;
        var oldDescription = Description;
        var oldPriority = Priority;
        
        Title = !string.IsNullOrWhiteSpace(title) ? title : throw new ArgumentException("Title cannot be empty", nameof(title));
        Description = description;
        Priority = priority;
        UpdateModifiedDate();

        // Only raise event if something actually changed
        if (oldTitle != title || oldDescription != description || oldPriority != priority)
        {
            AddDomainEvent(new TaskEditedEvent(
                Id,
                oldTitle,
                title,
                oldDescription,
                description,
                oldPriority,
                priority,
                AssigneeId)); // Using current assignee as editor
        }
    }
    
    public void ChangeProject(int projectId)
    {
        if (projectId <= 0)
        {
            throw new ArgumentException("Project ID must be greater than 0", nameof(projectId));
        }
        
        var oldProjectId = ProjectId;
        ProjectId = projectId;
        UpdateModifiedDate();
        AddDomainEvent(new TaskProjectChangedEvent(Id, Title, oldProjectId, projectId));
    }

    private static bool IsValidStatusTransition(Enums.TaskStatus currentStatus, Enums.TaskStatus newStatus)
    {
        // Allow staying in the same status
        if (currentStatus == newStatus)
            return true;
            
        return (currentStatus, newStatus) switch
        {
            // From Todo
            (Enums.TaskStatus.Todo, Enums.TaskStatus.InProgress) => true,
            (Enums.TaskStatus.Todo, Enums.TaskStatus.Completed) => true, // Allow direct completion
            
            // From InProgress
            (Enums.TaskStatus.InProgress, Enums.TaskStatus.Todo) => true, // Allow moving back
            (Enums.TaskStatus.InProgress, Enums.TaskStatus.Review) => true,
            (Enums.TaskStatus.InProgress, Enums.TaskStatus.Completed) => true, // Allow direct completion
            
            // From Review
            (Enums.TaskStatus.Review, Enums.TaskStatus.Todo) => true, // Allow moving back for rework
            (Enums.TaskStatus.Review, Enums.TaskStatus.InProgress) => true, // Allow moving back
            (Enums.TaskStatus.Review, Enums.TaskStatus.Completed) => true,
            
            // From Completed - generally don't allow moving back, but allow re-opening if needed
            (Enums.TaskStatus.Completed, Enums.TaskStatus.Todo) => true, // Allow re-opening
            (Enums.TaskStatus.Completed, Enums.TaskStatus.InProgress) => true, // Allow re-opening
            (Enums.TaskStatus.Completed, Enums.TaskStatus.Review) => true, // Allow re-opening
            
            _ => false
        };
    }

    public void Delete(Guid? deletedBy = null)
    {
        AddDomainEvent(new TaskDeletedEvent(Id, Title, ProjectId, Status, deletedBy));
    }
}
