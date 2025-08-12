namespace Taskify.Domain.Enums;

public enum TaskStatus
{
    Todo = 0,
    InProgress = 1,
    Review = 2,
    Completed = 3
}

public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Urgent = 3
}

public enum ProjectStatus
{
    Active = 0,
    OnHold = 1,
    Completed = 2,
    Archived = 3
}

public enum UserRole
{
    Member = 0,
    ProjectManager = 1,
    Admin = 2
}
