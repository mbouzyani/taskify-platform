using Microsoft.EntityFrameworkCore;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Infrastructure.Data;

namespace Taskify.Infrastructure.Repositories;

public class ProjectRepository : IntRepository<Project>, IProjectRepository
{
    public ProjectRepository(TaskifyDbContext context) : base(context)
    {
    }

    public override async Task<Project?> GetByIdAsync(int id)
    {
        return await _context.Projects
            .Include(p => p.AssignedUsers)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Project?> GetByIdWithTasksAsync(int id)
    {
        return await _context.Projects
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<List<Project>> GetAllWithTasksAsync()
    {
        return await _context.Projects
            .Include(p => p.Tasks)
            .Include(p => p.AssignedUsers)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Projects.AnyAsync(p => p.Id == id);
    }

    // Override the base Delete method to ensure proper cascade deletion
    public override void Delete(Project entity)
    {
        // Load related tasks if they're not already loaded
        if (!_context.Entry(entity).Collection(p => p.Tasks).IsLoaded)
        {
            _context.Entry(entity).Collection(p => p.Tasks).Load();
        }

        // Now call the base Delete method which will remove the entity
        base.Delete(entity);
    }
}
