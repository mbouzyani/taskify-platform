using Microsoft.EntityFrameworkCore;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Infrastructure.Data;

namespace Taskify.Infrastructure.Repositories;

public class ActivityLogRepository : IntRepository<ActivityLog>, IActivityLogRepository
{
    public ActivityLogRepository(TaskifyDbContext context) : base(context)
    {
    }

    public async Task<List<ActivityLog>> GetRecentActivitiesAsync(int count, CancellationToken cancellationToken = default)
    {
        return await _context.Set<ActivityLog>()
            .AsNoTracking()
            .Include(a => a.User)
            .OrderByDescending(a => a.Timestamp)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public override IQueryable<ActivityLog> GetAll()
    {
        return _context.Set<ActivityLog>()
            .Include(a => a.User);
    }
}
