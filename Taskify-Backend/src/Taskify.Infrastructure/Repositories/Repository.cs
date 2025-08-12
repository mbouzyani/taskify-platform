using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Taskify.Application.Interfaces;
using Taskify.Domain.Common;
using Taskify.Infrastructure.Data;

namespace Taskify.Infrastructure.Repositories;

public abstract class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly TaskifyDbContext _context;
    protected readonly DbSet<T> _dbSet;

    protected Repository(TaskifyDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual IQueryable<T> GetAll()
    {
        return _dbSet.AsQueryable();
    }

    public virtual async Task<T?> GetByIdAsync(Guid id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task AddAsync(T entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));
            
        await _dbSet.AddAsync(entity);
    }

    public virtual void Update(T entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));
            
        _dbSet.Update(entity);
    }

    public virtual void Delete(T entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));
            
        _dbSet.Remove(entity);
    }
}
