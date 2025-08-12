using Taskify.Domain.Entities;
using DomainTask = Taskify.Domain.Entities.Task;

namespace Taskify.Application.Interfaces;

public interface ITaskifyContext : IUnitOfWork
{
    new IQueryable<DomainTask> Tasks { get; }
    new IQueryable<Project> Projects { get; }
    new IQueryable<User> Users { get; }
    new IQueryable<ActivityLog> ActivityLogs { get; }
    ITaskRepository TaskRepository { get; }
    IProjectRepository ProjectRepository { get; }
    IUserRepository UserRepository { get; }
    IActivityLogRepository ActivityLogRepository { get; }
}
