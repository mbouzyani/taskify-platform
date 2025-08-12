using Taskify.Domain.Common;
using Taskify.Domain.Enums;
using Taskify.Domain.Events;

namespace Taskify.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; private set; }
    public string Email { get; private set; }
    public string? Avatar { get; private set; }
    public UserRole Role { get; private set; }
    public Position Position { get; private set; }
    public string? Department { get; private set; }
    public string PasswordHash { get; private set; } = string.Empty;
    
    public ICollection<Task> AssignedTasks { get; private set; } = new List<Task>();
    public ICollection<Project> AssignedProjects { get; private set; } = new List<Project>();

    private User(
        string name, 
        string email, 
        UserRole role = UserRole.Member, 
        Position position = Position.TeamMember,
        string? department = null,
        string? avatar = null,
        string passwordHash = "")
    {
        Name = !string.IsNullOrWhiteSpace(name) ? name : throw new ArgumentException("Name cannot be empty", nameof(name));
        Email = ValidateEmail(email);
        Role = role;
        Position = position;
        Department = department;
        Avatar = avatar;
        PasswordHash = passwordHash;
    }

    public static User Create(
        string name, 
        string email, 
        UserRole role = UserRole.Member, 
        Position position = Position.TeamMember,
        string? department = null,
        string? avatar = null)
    {
        var user = new User(name, email, role, position, department, avatar);
        user.AddDomainEvent(new TeamMemberInvitedEvent(user.Id, user.Name, user.Email, user.Role));
        return user;
    }

    public static User CreateWithPassword(
        string name, 
        string email, 
        string passwordHash,
        UserRole role = UserRole.Member, 
        Position position = Position.TeamMember,
        string? department = null,
        string? avatar = null)
    {
        var user = new User(name, email, role, position, department, avatar, passwordHash);
        user.AddDomainEvent(new TeamMemberInvitedEvent(user.Id, user.Name, user.Email, user.Role));
        return user;
    }

    public void SetPasswordHash(string passwordHash)
    {
        PasswordHash = !string.IsNullOrWhiteSpace(passwordHash) ? passwordHash : throw new ArgumentException("Password hash cannot be empty", nameof(passwordHash));
        UpdateModifiedDate();
    }

    public void UpdateProfile(string name, string? avatar)
    {
        var oldName = Name;
        var oldAvatar = Avatar;

        Name = !string.IsNullOrWhiteSpace(name) ? name : throw new ArgumentException("Name cannot be empty", nameof(name));
        Avatar = avatar;
        
        AddDomainEvent(new TeamMemberProfileUpdatedEvent(Id, oldName, Name, oldAvatar, Avatar));
        UpdateModifiedDate();
    }

    public void ChangeRole(UserRole newRole)
    {
        var oldRole = Role;
        Role = newRole;
        
        AddDomainEvent(new TeamMemberRoleChangedEvent(Id, Name, oldRole, Role));
        UpdateModifiedDate();
    }

    public void UpdatePosition(Position newPosition)
    {
        var oldPosition = Position;
        Position = newPosition;
        
        AddDomainEvent(new TeamMemberPositionChangedEvent(Id, Name, oldPosition, Position));
        UpdateModifiedDate();
    }

    public void UpdateDepartment(string? newDepartment)
    {
        var oldDepartment = Department;
        Department = newDepartment;
        
        AddDomainEvent(new TeamMemberDepartmentChangedEvent(Id, Name, oldDepartment, Department));
        UpdateModifiedDate();
    }

    public void AssignToProject(Project project)
    {
        if (!AssignedProjects.Contains(project))
        {
            AssignedProjects.Add(project);
            AddDomainEvent(new TeamMemberProjectAssignedEvent(Id, Name, project.Id, project.Name));
            UpdateModifiedDate();
        }
    }

    public void UnassignFromProject(Project project)
    {
        if (AssignedProjects.Remove(project))
        {
            AddDomainEvent(new TeamMemberProjectUnassignedEvent(Id, Name, project.Id, project.Name));
            UpdateModifiedDate();
        }
    }

    private static string ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email cannot be empty", nameof(email));
        }

        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address;
        }
        catch
        {
            throw new ArgumentException("Invalid email format", nameof(email));
        }
    }
}
