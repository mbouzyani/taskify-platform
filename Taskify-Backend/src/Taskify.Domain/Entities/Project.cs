using Taskify.Domain.Common;
using Taskify.Domain.Enums;

namespace Taskify.Domain.Entities;

public class Project : BaseIntEntity, IAggregateRoot
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public string Color { get; private set; }
    public ProjectStatus Status { get; private set; }
    
    public ICollection<Task> Tasks { get; private set; } = new List<Task>();
    public ICollection<User> AssignedUsers { get; private set; } = new List<User>();

    private Project(string name, string description, string color)
    {
        Name = !string.IsNullOrWhiteSpace(name) ? name : throw new ArgumentException("Name cannot be empty", nameof(name));
        Description = description;
        Color = ValidateColor(color);
        Status = ProjectStatus.Active;
    }

    public static Project Create(string name, string description, string color)
    {
        return new Project(name, description, color);
    }

    public void AddTask(Task task)
    {
        Tasks.Add(task);
        UpdateModifiedDate();
    }

    public void UpdateDetails(string name, string description, string color)
    {
        Name = !string.IsNullOrWhiteSpace(name) ? name : throw new ArgumentException("Name cannot be empty", nameof(name));
        Description = description;
        Color = ValidateColor(color);
        UpdateModifiedDate();
    }

    public void Archive()
    {
        Status = ProjectStatus.Archived;
        UpdateModifiedDate();
    }

    public void AssignUser(User user)
    {
        if (user == null) throw new ArgumentNullException(nameof(user));
        
        if (!AssignedUsers.Any(u => u.Id == user.Id))
        {
            AssignedUsers.Add(user);
            UpdateModifiedDate();
        }
    }

    public void RemoveUser(User user)
    {
        if (user == null) throw new ArgumentNullException(nameof(user));
        
        var existingUser = AssignedUsers.FirstOrDefault(u => u.Id == user.Id);
        if (existingUser != null)
        {
            AssignedUsers.Remove(existingUser);
            UpdateModifiedDate();
        }
    }

    public void ClearAssignedUsers()
    {
        AssignedUsers.Clear();
        UpdateModifiedDate();
    }

    public int GetCompletedTasksCount()
    {
        return Tasks.Count(t => t.Status == Enums.TaskStatus.Completed);
    }

    public int GetTodoTasksCount()
    {
        return Tasks.Count(t => t.Status == Enums.TaskStatus.Todo);
    }

    public int GetInProgressTasksCount()
    {
        return Tasks.Count(t => t.Status == Enums.TaskStatus.InProgress);
    }

    public int GetReviewTasksCount()
    {
        return Tasks.Count(t => t.Status == Enums.TaskStatus.Review);
    }

    public double GetCompletionPercentage()
    {
        if (!Tasks.Any()) return 0;
        return (double)GetCompletedTasksCount() / Tasks.Count * 100;
    }

    private static string ValidateColor(string color)
    {
        if (string.IsNullOrWhiteSpace(color) || !color.StartsWith("#") || (color.Length != 7 && color.Length != 4))
        {
            throw new ArgumentException("Color must be a valid hex color code (e.g., #FF0000)", nameof(color));
        }
        return color;
    }
}
