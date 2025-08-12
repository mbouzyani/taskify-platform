using Microsoft.EntityFrameworkCore.Storage;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Infrastructure.Data;
using TaskLib = System.Threading.Tasks;

namespace Taskify.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly TaskifyDbContext _context;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    public ITaskRepository Tasks { get; }
    public IProjectRepository Projects { get; }
    public IUserRepository Users { get; }
    public IQueryable<ActivityLog> ActivityLogs => _context.ActivityLogs;

    public UnitOfWork(
        TaskifyDbContext context,
        ITaskRepository tasks,
        IProjectRepository projects,
        IUserRepository users)
    {
        _context = context;
        Tasks = tasks;
        Projects = projects;
        Users = users;
    }

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
            await _context.SaveChangesAsync();
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
