using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Taskify.Application.DTOs;
using Taskify.Application.Queries.Dashboard;

namespace Taskify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<DashboardController> _logger;
    
    public DashboardController(IMediator mediator, ILogger<DashboardController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }
    
    /// <summary>
    /// Simple test endpoint to verify API connectivity
    /// </summary>
    [HttpGet("test")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public ActionResult GetTest()
    {
        return Ok(new { message = "API is working!", timestamp = DateTime.UtcNow, status = "healthy" });
    }
    
    /// <summary>
    /// Get comprehensive dashboard data including statistics, activities, and visualizations
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(DashboardDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardDataResponse>> GetDashboardData()
    {
        try
        {
            var result = await _mediator.Send(new GetDashboardDataQuery());
            
            // Ensure we're returning valid data
            if (result?.Stats == null)
            {
                return BadRequest(new { message = "Invalid dashboard data" });
            }
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            // Log the exception details
            _logger.LogError(ex, "Error fetching dashboard data");
            
            return StatusCode(500, new
            {
                message = "An error occurred while fetching dashboard data",
                detail = ex.Message
            });
        }
    }

    /// <summary>
    /// Get dashboard statistics
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        try
        {
            var result = await _mediator.Send(new GetDashboardDataQuery());
            
            if (result?.Stats == null)
            {
                return BadRequest(new { message = "Invalid dashboard stats" });
            }
            
            return Ok(result.Stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching dashboard stats");
            
            return StatusCode(500, new
            {
                message = "An error occurred while fetching dashboard stats",
                detail = ex.Message
            });
        }
    }

    /// <summary>
    /// Get overview statistics
    /// </summary>
    [HttpGet("overview")]
    [ProducesResponseType(typeof(OverviewStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<OverviewStatsDto>> GetOverviewStats()
    {
        try
        {
            var result = await _mediator.Send(new GetDashboardDataQuery());
            
            if (result?.Stats == null)
            {
                return BadRequest(new { message = "Invalid overview stats" });
            }

            // Calculate overview stats from dashboard data and available information
            var overviewStats = new OverviewStatsDto
            {
                TotalProjects = result.ProjectProgress?.Count ?? 0,
                TotalTasks = result.Stats.TotalTasks,
                TotalUsers = result.TeamWorkload?.Count ?? 0,
                CompletedTasks = result.Stats.CompletedTasks,
                ActiveProjects = result.ProjectProgress?.Count(p => p.CompletionPercentage < 100) ?? 0,
                TeamMembers = result.TeamWorkload?.Count ?? 0,
                CompletionRate = result.Stats.TotalTasks > 0 ? (double)result.Stats.CompletedTasks / result.Stats.TotalTasks * 100 : 0,
                ProductivityScore = result.Stats.ProductivityScore
            };
            
            return Ok(overviewStats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching overview stats");
            
            return StatusCode(500, new
            {
                message = "An error occurred while fetching overview stats",
                detail = ex.Message
            });
        }
    }
}
