using FluentValidation;
using MediatR;
using AutoMapper;
using Taskify.Application.DTOs;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Domain.Enums;

namespace Taskify.Application.Commands.Projects;

// Create Project Command
public record CreateProjectCommand : IRequest<ProjectDto>
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Color { get; init; } = "#6366F1"; // Default color
    public List<string> MemberIds { get; init; } = new List<string>(); // Team member IDs to assign
}

public class CreateProjectCommandValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Project name is required")
            .MaximumLength(200).WithMessage("Project name cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Color is required")
            .Matches("^#([0-9A-Fa-f]{3}){1,2}$").WithMessage("Color must be a valid hex color code (e.g., #FF0000)");
    }
}

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, ProjectDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateProjectCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ProjectDto> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = Project.Create(request.Name, request.Description, request.Color);
        
        // Assign team members if provided
        if (request.MemberIds != null && request.MemberIds.Count > 0)
        {
            foreach (var memberId in request.MemberIds)
            {
                if (Guid.TryParse(memberId, out var memberGuid))
                {
                    var user = await _unitOfWork.Users.GetByIdAsync(memberGuid);
                    if (user != null)
                    {
                        project.AssignUser(user);
                    }
                }
            }
        }
        
        await _unitOfWork.Projects.AddAsync(project);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Get the project with members loaded for the response
        var projectWithMembers = await _unitOfWork.Projects.GetByIdAsync(project.Id);
        return _mapper.Map<ProjectDto>(projectWithMembers);
    }
}

// Update Project Command
public record UpdateProjectCommand : IRequest<ProjectDto>
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Color { get; init; } = string.Empty;
    public List<string> MemberIds { get; init; } = new();
}

public class UpdateProjectCommandValidator : AbstractValidator<UpdateProjectCommand>
{
    public UpdateProjectCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Project ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Project name is required")
            .MaximumLength(200).WithMessage("Project name cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Color is required")
            .Matches("^#([0-9A-Fa-f]{3}){1,2}$").WithMessage("Color must be a valid hex color code (e.g., #FF0000)");
    }
}

public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, ProjectDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateProjectCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ProjectDto> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(request.Id)
            ?? throw new ProjectNotFoundException(request.Id);

        project.UpdateDetails(request.Name, request.Description, request.Color);
        
        // Handle member assignments
        if (request.MemberIds != null && request.MemberIds.Count > 0)
        {
            // Clear existing assignments
            project.ClearAssignedUsers();
            
            // Add new assignments
            foreach (var memberId in request.MemberIds)
            {
                if (Guid.TryParse(memberId, out var memberGuid))
                {
                    var user = await _unitOfWork.Users.GetByIdAsync(memberGuid);
                    if (user != null)
                    {
                        project.AssignUser(user);
                    }
                }
            }
        }
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Get the project with updated members for the response
        var updatedProject = await _unitOfWork.Projects.GetByIdAsync(project.Id);
        return _mapper.Map<ProjectDto>(updatedProject);
    }
}

// Delete Project Command
public record DeleteProjectCommand : IRequest<Unit>
{
    public int Id { get; init; }
}

public class DeleteProjectCommandValidator : AbstractValidator<DeleteProjectCommand>
{
    public DeleteProjectCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Project ID is required");
    }
}

public class DeleteProjectCommandHandler : IRequestHandler<DeleteProjectCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProjectCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
    {
        // Get the project with its related tasks
        var project = await _unitOfWork.Projects.GetByIdWithTasksAsync(request.Id)
            ?? throw new ProjectNotFoundException(request.Id);

        // Delete the project from the database (tasks will be deleted via cascade delete)
        _unitOfWork.Projects.Delete(project);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return Unit.Value;
    }
}

// Project not found exception
public class ProjectNotFoundException : Exception
{
    public ProjectNotFoundException(int id)
        : base($"Project with ID {id} was not found")
    {
    }
}
