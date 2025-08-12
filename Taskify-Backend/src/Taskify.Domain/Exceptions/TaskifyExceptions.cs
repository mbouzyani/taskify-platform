using TaskStatus = Taskify.Domain.Enums.TaskStatus;

namespace Taskify.Domain.Exceptions;

public class TaskNotFoundException : DomainException
{
    public TaskNotFoundException(Guid taskId) 
        : base($"Task with ID {taskId} was not found.")
    {
    }
}

public class InvalidTaskStatusTransitionException : DomainException
{
    public InvalidTaskStatusTransitionException(TaskStatus from, TaskStatus to)
        : base($"Cannot transition task status from {from} to {to}.")
    {
    }
}

public class ProjectNotFoundException : DomainException
{
    public ProjectNotFoundException(int projectId)
        : base($"Project with ID {projectId} was not found.")
    {
    }
}

public class UserNotFoundException : DomainException
{
    public UserNotFoundException(Guid userId)
        : base($"User with ID {userId} was not found.")
    {
    }
}
