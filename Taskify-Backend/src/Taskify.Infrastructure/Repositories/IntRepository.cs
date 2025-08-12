using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Taskify.Application.Interfaces;
using Taskify.Domain.Common;
using Taskify.Infrastructure.Data;

namespace Taskify.Infrastructure.Repositories;

public abstract class IntRepository<T> : IIntRepository<T> where T : BaseIntEntity
{
    protected readonly TaskifyDbContext _context;

    protected IntRepository(TaskifyDbContext context)
    {
        _context = context;
    }

    public virtual IQueryable<T> GetAll()
    {
        return _context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(int id)
    {
        return await _context.Set<T>().FindAsync(id);
    }

    public virtual async Task AddAsync(T entity)
    {
        await _context.Set<T>().AddAsync(entity);
    }

    public virtual void Update(T entity)
    {
        _context.Entry(entity).State = EntityState.Modified;
    }

    public virtual void Delete(T entity)
    {
        _context.Set<T>().Remove(entity);
    }
}
