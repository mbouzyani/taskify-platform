using Taskify.Domain.Entities;
using DomainTask = Taskify.Domain.Entities.Task;

namespace Taskify.Application.Interfaces;

public interface ITaskifyRepositories : IUnitOfWork
{
    new IQueryable<DomainTask> Tasks { get; }
    new IQueryable<Project> Projects { get; }
    new IQueryable<User> Users { get; }
    
    ITaskRepository TaskRepository { get; }
    IProjectRepository ProjectRepository { get; }
    IUserRepository UserRepository { get; }
    
    new System.Threading.Tasks.Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
