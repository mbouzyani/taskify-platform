using Taskify.Domain.Entities;

namespace Taskify.Application.Interfaces;

public interface IActivityLogRepository : IIntRepository<ActivityLog>
{
    Task<List<ActivityLog>> GetRecentActivitiesAsync(int count, CancellationToken cancellationToken = default);
}
