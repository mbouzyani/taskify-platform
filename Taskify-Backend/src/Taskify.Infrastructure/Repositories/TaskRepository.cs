using Microsoft.EntityFrameworkCore;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Infrastructure.Data;
using DomainTask = Taskify.Domain.Entities.Task;

namespace Taskify.Infrastructure.Repositories;

public class TaskRepository : Repository<DomainTask>, ITaskRepository
{
    public TaskRepository(TaskifyDbContext context) : base(context)
    {
    }

    public override IQueryable<DomainTask> GetAll()
    {
        return _dbSet
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .AsQueryable();
    }

    public async Task<DomainTask?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _dbSet
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<List<DomainTask>> GetTasksByProjectIdAsync(int projectId)
    {
        return await _dbSet
            .Include(t => t.Assignee)
            .Where(t => t.ProjectId == projectId)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _dbSet.AnyAsync(t => t.Id == id);
    }

    public override async System.Threading.Tasks.Task AddAsync(DomainTask entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));

        // Validate Project exists
        if (!await _context.Set<Project>().AnyAsync(p => p.Id == entity.ProjectId))
            throw new ArgumentException($"Project with ID {entity.ProjectId} does not exist");

        // Validate Assignee exists if specified
        if (entity.AssigneeId.HasValue && !await _context.Set<User>().AnyAsync(u => u.Id == entity.AssigneeId))
            throw new ArgumentException($"User with ID {entity.AssigneeId} does not exist");

        await base.AddAsync(entity);
    }

    public override void Update(DomainTask entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));

        // We're just updating the entity state here
        // All business logic validation is handled in the domain entity itself
        base.Update(entity);
    }

    public async Task<Dictionary<Domain.Enums.TaskStatus, int>> GetTasksCountByStatusAsync()
    {
        return await _dbSet
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);
    }

    public async Task<Dictionary<Domain.Enums.TaskPriority, int>> GetTasksCountByPriorityAsync()
    {
        return await _dbSet
            .GroupBy(t => t.Priority)
            .Select(g => new { Priority = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Priority, x => x.Count);
    }

    public async Task<bool> ExistsByTitleInProjectAsync(string title, int projectId)
    {
        return await _dbSet.AnyAsync(t => 
            t.Title.ToLower() == title.ToLower() && 
            t.ProjectId == projectId);
    }

    public async Task<int> GetCompletedTasksCountAsync(DateTime fromDate, DateTime toDate)
    {
        return await _dbSet
            .CountAsync(t => t.Status == Domain.Enums.TaskStatus.Completed 
                        && t.CompletedAt.HasValue 
                        && t.CompletedAt.Value >= fromDate 
                        && t.CompletedAt.Value <= toDate);
    }

    public async Task<(IEnumerable<DomainTask> Items, int TotalCount, int Page, int PageSize)> GetTasksAsync(
        Domain.ValueObjects.TaskFilters filter,
        int pageNumber,
        int pageSize,
        string? sortBy = null,
        bool sortDescending = false)
    {
        var query = _dbSet
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .AsQueryable();

        // Apply filters
        if (filter.AssigneeId.HasValue)
            query = query.Where(t => t.AssigneeId == filter.AssigneeId);

        if (filter.DueDateFrom.HasValue)
            query = query.Where(t => t.DueDate >= filter.DueDateFrom);

        if (filter.DueDateTo.HasValue)
            query = query.Where(t => t.DueDate <= filter.DueDateTo);

        // Get total count before applying pagination
        var totalCount = await query.CountAsync();

        // Apply sorting
        if (!string.IsNullOrWhiteSpace(sortBy))
        {
            query = sortBy.ToLower() switch
            {
                "title" => sortDescending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
                "priority" => sortDescending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
                "duedate" => sortDescending ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
                "status" => sortDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
                _ => query.OrderByDescending(t => t.CreatedAt)
            };
        }
        else
        {
            query = query.OrderByDescending(t => t.CreatedAt);
        }

        // Apply pagination
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (Items: items, TotalCount: totalCount, Page: pageNumber, PageSize: pageSize);
    }
}
