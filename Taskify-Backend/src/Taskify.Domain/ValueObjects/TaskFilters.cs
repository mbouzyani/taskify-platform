using Taskify.Domain.Common;
using TaskStatus = Taskify.Domain.Enums.TaskStatus;
using TaskPriority = Taskify.Domain.Enums.TaskPriority;

namespace Taskify.Domain.ValueObjects;

public class TaskFilters : ValueObject
{
    public IReadOnlyList<TaskStatus>? Statuses { get; }
    public IReadOnlyList<TaskPriority>? Priorities { get; }
    public Guid? ProjectId { get; }
    public Guid? AssigneeId { get; }
    public string? SearchTerm { get; }
    public DateTime? DueDateFrom { get; }
    public DateTime? DueDateTo { get; }

    public TaskFilters(
        IReadOnlyList<TaskStatus>? statuses = null,
        IReadOnlyList<TaskPriority>? priorities = null,
        Guid? projectId = null,
        Guid? assigneeId = null,
        string? searchTerm = null,
        DateTime? dueDateFrom = null,
        DateTime? dueDateTo = null)
    {
        Statuses = statuses;
        Priorities = priorities;
        ProjectId = projectId;
        AssigneeId = assigneeId;
        SearchTerm = searchTerm;
        DueDateFrom = dueDateFrom;
        DueDateTo = dueDateTo;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        if (Statuses != null) yield return Statuses;
        if (Priorities != null) yield return Priorities;
        if (ProjectId.HasValue) yield return ProjectId.Value;
        if (AssigneeId.HasValue) yield return AssigneeId.Value;
        if (SearchTerm != null) yield return SearchTerm;
        if (DueDateFrom.HasValue) yield return DueDateFrom.Value;
        if (DueDateTo.HasValue) yield return DueDateTo.Value;
    }
}
