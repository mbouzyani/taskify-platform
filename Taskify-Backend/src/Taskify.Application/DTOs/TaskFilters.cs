namespace Taskify.Application.DTOs;

public class TaskFilters
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? AssigneeId { get; set; }
}
