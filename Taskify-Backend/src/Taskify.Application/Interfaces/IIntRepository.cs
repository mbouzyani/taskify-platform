using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Taskify.Domain.Common;

namespace Taskify.Application.Interfaces;

public interface IIntRepository<T> where T : BaseIntEntity
{
    IQueryable<T> GetAll();
    System.Threading.Tasks.Task<T?> GetByIdAsync(int id);
    System.Threading.Tasks.Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}
