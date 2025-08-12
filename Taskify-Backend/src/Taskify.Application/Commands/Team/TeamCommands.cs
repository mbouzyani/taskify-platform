using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Taskify.Application.DTOs;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Domain.Enums;
using Taskify.Domain.Exceptions;
using TaskStatus = Taskify.Domain.Enums.TaskStatus;

namespace Taskify.Application.Commands.Team;

public record InviteTeamMemberCommand : IRequest<TeamMemberDto>
{
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public UserRole Role { get; init; } = UserRole.Member;
    public Position Position { get; init; } = Position.TeamMember;
    public string? Department { get; init; }
}

public record UpdateTeamMemberCommand : IRequest<TeamMemberDto>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Avatar { get; init; }
    public UserRole Role { get; init; }
    public Position Position { get; init; }
    public string? Department { get; init; }
}

public record RemoveTeamMemberCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
}

public record AssignProjectCommand : IRequest<ProjectAssignmentResultDto>
{
    public Guid UserId { get; init; }
    public int ProjectId { get; init; }
}

public record UnassignProjectCommand : IRequest<TeamMemberDto>
{
    public Guid UserId { get; init; }
    public int ProjectId { get; init; }
}

public record AssignTaskCommand : IRequest<TaskAssignmentResultDto>
{
    public Guid TaskId { get; init; }
    public Guid UserId { get; init; }
}

public record UnassignTaskCommand : IRequest<TaskAssignmentResultDto>
{
    public Guid TaskId { get; init; }
}

public class InviteTeamMemberCommandHandler : IRequestHandler<InviteTeamMemberCommand, TeamMemberDto>
{
    private readonly ITaskifyContext _context;
    private readonly ILogger<InviteTeamMemberCommandHandler> _logger;
    private readonly IMapper _mapper;

    public InviteTeamMemberCommandHandler(ITaskifyContext context, ILogger<InviteTeamMemberCommandHandler> logger, IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<TeamMemberDto> Handle(InviteTeamMemberCommand request, CancellationToken cancellationToken)
    {
        // Check if user already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (existingUser != null)
        {
            throw new UserAlreadyExistsException(request.Email);
        }

        // Create new user
        var user = Domain.Entities.User.Create(request.Name, request.Email, request.Role, request.Position, request.Department);

        await _context.UserRepository.AddAsync(user);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("New team member invited: {Email}", request.Email);

        return _mapper.Map<TeamMemberDto>(user);
    }
}

public class UpdateTeamMemberCommandHandler : IRequestHandler<UpdateTeamMemberCommand, TeamMemberDto>
{
    private readonly ITaskifyContext _context;
    private readonly ILogger<UpdateTeamMemberCommandHandler> _logger;

    public UpdateTeamMemberCommandHandler(ITaskifyContext context, ILogger<UpdateTeamMemberCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TeamMemberDto> Handle(UpdateTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken)
            ?? throw new UserNotFoundException(request.Id);

        user.UpdateProfile(request.Name, request.Avatar);
        user.ChangeRole(request.Role);
        user.UpdatePosition(request.Position);
        user.UpdateDepartment(request.Department);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Team member updated: {Id}", request.Id);

        return new TeamMemberDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Position = user.Position,
            Department = user.Department,
            Avatar = user.Avatar
        };
    }
}

public class RemoveTeamMemberCommandHandler : IRequestHandler<RemoveTeamMemberCommand, Unit>
{
    private readonly ITaskifyContext _context;
    private readonly ILogger<RemoveTeamMemberCommandHandler> _logger;

    public RemoveTeamMemberCommandHandler(ITaskifyContext context, ILogger<RemoveTeamMemberCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Unit> Handle(RemoveTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken)
            ?? throw new UserNotFoundException(request.Id);

        // Check if user has any assigned tasks
        var hasAssignedTasks = await _context.Tasks
            .AnyAsync(t => t.AssigneeId == request.Id && t.Status != TaskStatus.Completed, cancellationToken);

        if (hasAssignedTasks)
        {
            throw new InvalidOperationException("Cannot remove team member with assigned incomplete tasks");
        }

        _context.UserRepository.Delete(user);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Team member removed: {Id}", request.Id);

        return Unit.Value;
    }
}

public class AssignProjectCommandHandler : IRequestHandler<AssignProjectCommand, ProjectAssignmentResultDto>
{
    private readonly ITaskifyContext _context;
    private readonly ILogger<AssignProjectCommandHandler> _logger;
    private readonly IMapper _mapper;

    public AssignProjectCommandHandler(
        ITaskifyContext context,
        ILogger<AssignProjectCommandHandler> logger,
        IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<ProjectAssignmentResultDto> Handle(AssignProjectCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.AssignedProjects)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new UserNotFoundException(request.UserId);

        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken)
            ?? throw new ProjectNotFoundException(request.ProjectId);

        user.AssignToProject(project);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User {UserId} assigned to project {ProjectId}",
            request.UserId,
            request.ProjectId);

        // Get updated project with all members for the response
        var updatedProject = await _context.Projects
            .Include(p => p.AssignedUsers)
            .FirstAsync(p => p.Id == request.ProjectId, cancellationToken);

        return new ProjectAssignmentResultDto
        {
            UpdatedMember = _mapper.Map<TeamMemberDto>(user),
            UpdatedProject = _mapper.Map<ProjectDto>(updatedProject),
            Message = $"Successfully assigned {user.Name} to {project.Name}"
        };
    }
}

public class UnassignProjectCommandHandler : IRequestHandler<UnassignProjectCommand, TeamMemberDto>
{
    private readonly ITaskifyContext _context;
    private readonly ILogger<UnassignProjectCommandHandler> _logger;
    private readonly IMapper _mapper;

    public UnassignProjectCommandHandler(
        ITaskifyContext context,
        ILogger<UnassignProjectCommandHandler> logger,
        IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<TeamMemberDto> Handle(UnassignProjectCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.AssignedProjects)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new UserNotFoundException(request.UserId);

        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken)
            ?? throw new ProjectNotFoundException(request.ProjectId);

        // Check if user has any incomplete tasks in this project
        var hasIncompleteTasks = await _context.Tasks
            .AnyAsync(t => t.AssigneeId == request.UserId 
                          && t.ProjectId == request.ProjectId 
                          && t.Status != TaskStatus.Completed, 
                    cancellationToken);

        if (hasIncompleteTasks)
        {
            throw new InvalidOperationException("Cannot unassign user from project while they have incomplete tasks");
        }

        user.UnassignFromProject(project);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User {UserId} unassigned from project {ProjectId}",
            request.UserId,
            request.ProjectId);

        return _mapper.Map<TeamMemberDto>(user);
    }
}

public class AssignTaskCommandHandler : IRequestHandler<AssignTaskCommand, TaskAssignmentResultDto>
{
    private readonly ITaskifyContext _context;
    private readonly ILogger<AssignTaskCommandHandler> _logger;
    private readonly IMapper _mapper;

    public AssignTaskCommandHandler(
        ITaskifyContext context,
        ILogger<AssignTaskCommandHandler> logger,
        IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<TaskAssignmentResultDto> Handle(AssignTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken)
            ?? throw new TaskNotFoundException(request.TaskId);

        var user = await _context.Users
            .Include(u => u.AssignedProjects)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new UserNotFoundException(request.UserId);

        // Check if user is assigned to the project that contains this task
        if (!user.AssignedProjects.Any(p => p.Id == task.ProjectId))
        {
            throw new InvalidOperationException($"User {user.Name} is not assigned to project '{task.Project.Name}'. Users must be assigned to a project before being assigned to its tasks.");
        }

        // Assign the task to the user
        task.AssignTo(user.Id);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Task {TaskId} assigned to user {UserId}",
            request.TaskId,
            request.UserId);

        return new TaskAssignmentResultDto
        {
            UpdatedTask = _mapper.Map<TaskDto>(task),
            UpdatedMember = _mapper.Map<TeamMemberDto>(user),
            Message = $"Successfully assigned task '{task.Title}' to {user.Name}"
        };
    }
}

public class UnassignTaskCommandHandler : IRequestHandler<UnassignTaskCommand, TaskAssignmentResultDto>
{
    private readonly ITaskifyContext _context;
    private readonly ILogger<UnassignTaskCommandHandler> _logger;
    private readonly IMapper _mapper;

    public UnassignTaskCommandHandler(
        ITaskifyContext context,
        ILogger<UnassignTaskCommandHandler> logger,
        IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<TaskAssignmentResultDto> Handle(UnassignTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignee)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken)
            ?? throw new TaskNotFoundException(request.TaskId);

        if (task.AssigneeId == null)
        {
            throw new InvalidOperationException("Task is not currently assigned to anyone");
        }

        var previousAssigneeName = task.Assignee?.Name ?? "Unknown";

        // Unassign the task
        task.UnassignTask();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Task {TaskId} unassigned from user",
            request.TaskId);

        return new TaskAssignmentResultDto
        {
            UpdatedTask = _mapper.Map<TaskDto>(task),
            UpdatedMember = null,
            Message = $"Successfully unassigned task '{task.Title}' from {previousAssigneeName}"
        };
    }
}
