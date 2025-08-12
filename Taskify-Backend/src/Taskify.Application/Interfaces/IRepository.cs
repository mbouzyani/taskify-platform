using System.Threading.Tasks;
using Taskify.Domain.Common;
using Taskify.Domain.Entities;
using DomainTask = Taskify.Domain.Entities.Task;

namespace Taskify.Application.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    IQueryable<T> GetAll();
    System.Threading.Tasks.Task<T?> GetByIdAsync(Guid id);
    System.Threading.Tasks.Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}

public interface ITaskRepository : IRepository<DomainTask>
{
    System.Threading.Tasks.Task<DomainTask?> GetByIdWithDetailsAsync(Guid id);
    System.Threading.Tasks.Task<List<DomainTask>> GetTasksByProjectIdAsync(int projectId);
    System.Threading.Tasks.Task<bool> ExistsAsync(Guid id);
    System.Threading.Tasks.Task<bool> ExistsByTitleInProjectAsync(string title, int projectId);
    System.Threading.Tasks.Task<Dictionary<Domain.Enums.TaskStatus, int>> GetTasksCountByStatusAsync();
    System.Threading.Tasks.Task<Dictionary<Domain.Enums.TaskPriority, int>> GetTasksCountByPriorityAsync();
    System.Threading.Tasks.Task<int> GetCompletedTasksCountAsync(DateTime fromDate, DateTime toDate);
    System.Threading.Tasks.Task<(IEnumerable<DomainTask> Items, int TotalCount, int Page, int PageSize)> GetTasksAsync(
        Domain.ValueObjects.TaskFilters filter,
        int pageNumber,
        int pageSize,
        string? sortBy = null,
        bool sortDescending = false);
}

public interface IProjectRepository : IIntRepository<Project>
{
    System.Threading.Tasks.Task<Project?> GetByIdWithTasksAsync(int id);
    System.Threading.Tasks.Task<List<Project>> GetAllWithTasksAsync();
    System.Threading.Tasks.Task<bool> ExistsAsync(int id);
}

public interface IUserRepository : IRepository<User>
{
    System.Threading.Tasks.Task<User?> GetByEmailAsync(string email);
    System.Threading.Tasks.Task<bool> ExistsAsync(Guid id);
    System.Threading.Tasks.Task<List<User>> GetUsersWithTasksAsync();
}

public interface IUnitOfWork : IDisposable
{
    ITaskRepository Tasks { get; }
    IProjectRepository Projects { get; }
    IUserRepository Users { get; }
    IQueryable<ActivityLog> ActivityLogs { get; }
    
    System.Threading.Tasks.Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task BeginTransactionAsync();
    System.Threading.Tasks.Task CommitTransactionAsync();
    System.Threading.Tasks.Task RollbackTransactionAsync();
}


