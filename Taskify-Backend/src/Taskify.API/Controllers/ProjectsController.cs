using MediatR;
using Microsoft.AspNetCore.Mvc;
using Taskify.Application.Commands.Projects;
using Taskify.Application.DTOs;
using Taskify.Application.Queries.Projects;

namespace Taskify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProjectsController : ControllerBase
{
    private readonly IMediator _mediator;
    
    public ProjectsController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
    /// <summary>
    /// Get all projects
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProjectDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProjectDto>>> GetProjects()
    {
        var result = await _mediator.Send(new GetAllProjectsQuery());
        return Ok(result);
    }
    
    /// <summary>
    /// Get a specific project by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectDto>> GetProject(int id)
    {
        var query = new GetProjectByIdQuery { Id = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    
    /// <summary>
    /// Create a new project
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetProject), new { id = result.Id }, result);
    }
    
    /// <summary>
    /// Update an existing project
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProjectDto>> UpdateProject(int id, [FromBody] UpdateProjectCommand command)
    {
        // Ensure the ID in the route matches the ID in the command
        if (id != command.Id)
        {
            return BadRequest("ID in the route does not match the ID in the request body");
        }
        
        var result = await _mediator.Send(command);
        return Ok(result);
    }
    
    /// <summary>
    /// Delete a project
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var command = new DeleteProjectCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }
}
