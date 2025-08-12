using Taskify.Domain.Common;
using Taskify.Domain.Entities;
using Taskify.Domain.Enums;

namespace Taskify.Domain.Entities;

public class ActivityLog : BaseIntEntity
{
    public string Title { get; private set; }
    public string Description { get; private set; }
    public DateTime Timestamp { get; private set; }
    public ActivityType Type { get; private set; }
    public Guid? UserId { get; private set; }
    
    // Navigation properties
    public User? User { get; private set; }

    private ActivityLog(string title, string description, ActivityType type, Guid? userId = null)
    {
        Title = !string.IsNullOrWhiteSpace(title) ? title : throw new ArgumentException("Title cannot be empty", nameof(title));
        Description = description;
        Type = type;
        UserId = userId;
        Timestamp = DateTime.UtcNow;
    }

    public static ActivityLog Create(string title, string description, ActivityType type, Guid? userId = null)
    {
        return new ActivityLog(title, description, type, userId);
    }
}
