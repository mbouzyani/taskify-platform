using MediatR;
using Microsoft.AspNetCore.Mvc;
using Taskify.Application.Commands.Tasks;
using Taskify.Application.DTOs;
using Taskify.Application.Queries.Tasks;
using Taskify.API.Models;
using TaskFilters = Taskify.Domain.ValueObjects.TaskFilters;

namespace Taskify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;
    
    public TasksController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
    /// <summary>
    /// Get all tasks with optional filtering and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<TaskDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<TaskDto>>> GetTasks(
        [FromQuery] Domain.Enums.TaskStatus[]? statuses,
        [FromQuery] Domain.Enums.TaskPriority[]? priorities,
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? assigneeId,
        [FromQuery] string? searchTerm,
        [FromQuery] DateTime? dueDateFrom,
        [FromQuery] DateTime? dueDateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var filters = new TaskFilters(statuses, priorities, projectId, assigneeId, searchTerm, dueDateFrom, dueDateTo);
        var query = new GetTasksQuery { Filters = filters, Page = page, PageSize = pageSize, SortBy = sortBy, SortDescending = sortDescending };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    
    /// <summary>
    /// Get a specific task by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskDto>> GetTask(Guid id)
    {
        var query = new GetTaskByIdQuery { Id = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    
    /// <summary>
    /// Create a new task
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetTask), new { id = result.Id }, result);
    }
    
    /// <summary>
    /// Update an existing task
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskDto>> UpdateTask(Guid id, [FromBody] UpdateTaskCommand command)
    {
        // Since UpdateTaskCommand has init-only properties, we need to create it with all properties at once
        if (id != command.Id)
        {
            return BadRequest(new ErrorResponse 
            { 
                Message = "ID in URL must match ID in request body",
                StatusCode = StatusCodes.Status400BadRequest
            });
        }
        
        var result = await _mediator.Send(command);
        return Ok(result);
    }
    
    /// <summary>
    /// Delete a task
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var command = new DeleteTaskCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }
}
