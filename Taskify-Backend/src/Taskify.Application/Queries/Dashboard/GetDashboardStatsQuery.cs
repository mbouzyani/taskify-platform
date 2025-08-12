using MediatR;
using Taskify.Application.DTOs;

namespace Taskify.Application.Queries.Dashboard;

public class GetDashboardStatsQuery : IRequest<DashboardStatsDto>
{
    public Guid? UserId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
