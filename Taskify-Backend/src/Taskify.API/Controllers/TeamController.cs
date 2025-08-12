using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Taskify.Application.Commands.Team;
using Taskify.Application.DTOs;
using Taskify.Application.Queries.Team;
using Taskify.Domain.Exceptions;

namespace Taskify.API.Controllers;

[ApiController]
[Route("api/team")]
public class TeamController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TeamController> _logger;

    public TeamController(IMediator mediator, ILogger<TeamController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all team members with optional task statistics
    /// </summary>
    [HttpGet("members")]
    [ProducesResponseType(typeof(List<TeamMemberDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TeamMemberDto>>> GetTeamMembers([FromQuery] bool includeTaskStats = false)
    {
        var query = new GetTeamMembersQuery { IncludeTaskStats = includeTaskStats };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific team member by ID
    /// </summary>
    [HttpGet("members/{id:guid}")]
    [ProducesResponseType(typeof(TeamMemberDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamMemberDto>> GetTeamMember(Guid id)
    {
        try
        {
            var query = new GetTeamMemberByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (UserNotFoundException)
        {
            return NotFound(new { message = $"Team member with ID {id} not found" });
        }
    }

    /// <summary>
    /// Invite a new team member
    /// </summary>
    [HttpPost("invite")]
    [ProducesResponseType(typeof(TeamMemberDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TeamMemberDto>> InviteTeamMember([FromBody] InviteTeamMemberCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetTeamMember), new { id = result.Id }, result);
        }
        catch (UserAlreadyExistsException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update a team member's profile
    /// </summary>
    [HttpPut("members/{id:guid}")]
    [ProducesResponseType(typeof(TeamMemberDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TeamMemberDto>> UpdateTeamMember(Guid id, [FromBody] UpdateTeamMemberCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(new { message = "ID in URL must match ID in request body" });
        }

        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (UserNotFoundException)
        {
            return NotFound(new { message = $"Team member with ID {id} not found" });
        }
    }

    /// <summary>
    /// Remove a team member
    /// </summary>
    [HttpDelete("members/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveTeamMember(Guid id)
    {
        try
        {
            await _mediator.Send(new RemoveTeamMemberCommand { Id = id });
            return NoContent();
        }
        catch (UserNotFoundException)
        {
            return NotFound(new { message = $"Team member with ID {id} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Assign a team member to a project
    /// </summary>
    [HttpPost("members/{userId:guid}/projects/{projectId:int}")]
    [ProducesResponseType(typeof(ProjectAssignmentResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectAssignmentResultDto>> AssignToProject(Guid userId, int projectId)
    {
        try
        {
            var command = new AssignProjectCommand { UserId = userId, ProjectId = projectId };
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (UserNotFoundException)
        {
            return NotFound(new { message = $"Team member with ID {userId} not found" });
        }
        catch (ProjectNotFoundException)
        {
            return NotFound(new { message = $"Project with ID {projectId} not found" });
        }
    }

    /// <summary>
    /// Unassign a team member from a project
    /// </summary>
    [HttpDelete("members/{userId:guid}/projects/{projectId:int}")]
    [ProducesResponseType(typeof(TeamMemberDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamMemberDto>> UnassignFromProject(Guid userId, int projectId)
    {
        try
        {
            var command = new UnassignProjectCommand { UserId = userId, ProjectId = projectId };
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (UserNotFoundException)
        {
            return NotFound(new { message = $"Team member with ID {userId} not found" });
        }
        catch (ProjectNotFoundException)
        {
            return NotFound(new { message = $"Project with ID {projectId} not found" });
        }
    }

    /// <summary>
    /// Assign a team member to a task
    /// </summary>
    [HttpPost("tasks/{taskId:guid}/assign/{userId:guid}")]
    [ProducesResponseType(typeof(TaskAssignmentResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskAssignmentResultDto>> AssignTaskToMember(Guid taskId, Guid userId)
    {
        try
        {
            var command = new AssignTaskCommand { TaskId = taskId, UserId = userId };
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (TaskNotFoundException)
        {
            return NotFound(new { message = $"Task with ID {taskId} not found" });
        }
        catch (UserNotFoundException)
        {
            return NotFound(new { message = $"Team member with ID {userId} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Unassign a task from its current assignee
    /// </summary>
    [HttpPost("tasks/{taskId:guid}/unassign")]
    [ProducesResponseType(typeof(TaskAssignmentResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskAssignmentResultDto>> UnassignTask(Guid taskId)
    {
        try
        {
            var command = new UnassignTaskCommand { TaskId = taskId };
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (TaskNotFoundException)
        {
            return NotFound(new { message = $"Task with ID {taskId} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
