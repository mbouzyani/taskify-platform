using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Infrastructure.Data;
using TaskLib = System.Threading.Tasks;
using DomainTask = Taskify.Domain.Entities.Task;

namespace Taskify.Infrastructure.Repositories;

public class TaskifyRepositories : ITaskifyContext
{
    private readonly TaskifyDbContext _context;
    private readonly ITaskRepository _taskRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IUserRepository _userRepository;
    private readonly IActivityLogRepository _activityLogRepository;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    public TaskifyRepositories(
        TaskifyDbContext context,
        ITaskRepository taskRepository,
        IProjectRepository projectRepository,
        IUserRepository userRepository,
        IActivityLogRepository activityLogRepository)
    {
        _context = context;
        _taskRepository = taskRepository;
        _projectRepository = projectRepository;
        _userRepository = userRepository;
        _activityLogRepository = activityLogRepository;
    }

    public ITaskRepository Tasks => _taskRepository;
    public IProjectRepository Projects => _projectRepository;
    public IUserRepository Users => _userRepository;
    public IActivityLogRepository ActivityLogRepository => _activityLogRepository;
    public IQueryable<ActivityLog> ActivityLogs => _context.ActivityLogs.AsQueryable();

    // ITaskifyContext implementations
    IQueryable<DomainTask> ITaskifyContext.Tasks => _context.Tasks.AsQueryable();
    IQueryable<Project> ITaskifyContext.Projects => _context.Projects.AsQueryable();
    IQueryable<User> ITaskifyContext.Users => _context.Users.AsQueryable();
    IQueryable<ActivityLog> ITaskifyContext.ActivityLogs => _context.ActivityLogs.AsQueryable();

    public ITaskRepository TaskRepository => _taskRepository;
    public IProjectRepository ProjectRepository => _projectRepository;
    public IUserRepository UserRepository => _userRepository;

    public async TaskLib.Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async TaskLib.Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
        await TaskLib.Task.CompletedTask;
    }

    public async TaskLib.Task CommitTransactionAsync()
    {
        try
        {
            await SaveChangesAsync();
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
            }
        }
        catch
        {
            await RollbackTransactionAsync();
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
        await TaskLib.Task.CompletedTask;
    }

    public async TaskLib.Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
        await TaskLib.Task.CompletedTask;
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _context.Dispose();
            _transaction?.Dispose();
        }
        _disposed = true;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}
