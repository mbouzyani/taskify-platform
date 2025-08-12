using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using Taskify.Application.DTOs;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Domain.Exceptions;
using DomainTask = Taskify.Domain.Entities.Task;

namespace Taskify.Application.Commands.Tasks;

public record CreateTaskCommand : IRequest<TaskDto>
{
    public string Title { get; init; } = null!;
    public string Description { get; init; } = null!;
    public Domain.Enums.TaskStatus Status { get; init; }
    public Domain.Enums.TaskPriority Priority { get; init; }
    public int ProjectId { get; init; }
    public Guid? AssigneeId { get; init; }
    public DateTime? DueDate { get; init; }
}

public class CreateTaskCommandValidator : AbstractValidator<CreateTaskCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateTaskCommandValidator(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters")
            .MustAsync(async (command, title, ctx) =>
            {
                var exists = await _unitOfWork.Tasks.ExistsByTitleInProjectAsync(title, command.ProjectId);
                return !exists;
            }).WithMessage("A task with this title already exists in the project");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters");

        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required")
            .MustAsync(async (id, _) =>
            {
                var exists = await _unitOfWork.Projects.ExistsAsync(id);
                return exists;
            }).WithMessage("Project does not exist");

        RuleFor(x => x.DueDate)
            .Must(date => date == null || date.Value.Date >= DateTime.UtcNow.Date)
            .WithMessage("Due date cannot be in the past")
            .When(x => x.DueDate.HasValue);

        RuleFor(x => x.AssigneeId)
            .MustAsync(async (id, _) =>
            {
                if (!id.HasValue) return true;
                return await _unitOfWork.Users.ExistsAsync(id.Value);
            }).WithMessage("Assigned user does not exist")
            .When(x => x.AssigneeId.HasValue);
    }
}

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, TaskDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateTaskCommandHandler> _logger;

    public CreateTaskCommandHandler(
        IUnitOfWork unitOfWork, 
        IMapper mapper,
        ILogger<CreateTaskCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TaskDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(request.ProjectId)
            ?? throw new ProjectNotFoundException(request.ProjectId);

        if (request.AssigneeId.HasValue)
        {
            var userExists = await _unitOfWork.Users.ExistsAsync(request.AssigneeId.Value);
            if (!userExists)
            {
                throw new UserNotFoundException(request.AssigneeId.Value);
            }
        }

        var task = DomainTask.Create(
            request.Title,
            request.Description,
            request.Priority,
            request.Status,
            request.ProjectId,
            request.AssigneeId,
            request.DueDate);

        await _unitOfWork.Tasks.AddAsync(task);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var taskWithDetails = await _unitOfWork.Tasks.GetByIdWithDetailsAsync(task.Id)
            ?? throw new TaskNotFoundException(task.Id);

        return _mapper.Map<TaskDto>(taskWithDetails);
    }
}

public record UpdateTaskCommand : IRequest<TaskDto>
{
    public Guid Id { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public Domain.Enums.TaskStatus? Status { get; init; }
    public Domain.Enums.TaskPriority? Priority { get; init; }
    public Guid? AssigneeId { get; init; }
    public DateTime? DueDate { get; init; }
    public int? ProjectId { get; init; }
}
public class UpdateTaskCommandValidator : AbstractValidator<UpdateTaskCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTaskCommandValidator(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters")
            .MustAsync(async (command, title, ctx) =>
            {
                if (title == null) return true;
                var currentTask = await _unitOfWork.Tasks.GetByIdAsync(command.Id);
                if (currentTask == null) return true;
                
                // Only check for duplicates if title is changing
                if (title == currentTask.Title) return true;
                
                return !await _unitOfWork.Tasks.ExistsByTitleInProjectAsync(
                    title, 
                    command.ProjectId ?? currentTask.ProjectId);
            }).WithMessage("A task with this title already exists in the project")
            .When(x => x.Title != null);

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters")
            .When(x => x.Description != null);

        RuleFor(x => x.ProjectId)
            .GreaterThan(0).WithMessage("Project ID must be greater than 0")
            .MustAsync(async (id, _) =>
            {
                if (!id.HasValue) return true;
                return await _unitOfWork.Projects.ExistsAsync(id.Value);
            }).WithMessage("Project does not exist")
            .When(x => x.ProjectId.HasValue);

        RuleFor(x => x.DueDate)
            .Must(dueDate => 
            {
                if (!dueDate.HasValue) return true;
                return dueDate.Value.Date >= DateTime.UtcNow.Date;
            })
            .WithMessage("Due date cannot be in the past")
            .When(x => x.DueDate.HasValue);

        RuleFor(x => x.AssigneeId)
            .MustAsync(async (id, _) =>
            {
                if (!id.HasValue) return true;
                return await _unitOfWork.Users.ExistsAsync(id.Value);
            }).WithMessage("Assigned user does not exist")
            .When(x => x.AssigneeId.HasValue);
    }
}

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, TaskDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<UpdateTaskCommandHandler> _logger;

    public UpdateTaskCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ILogger<UpdateTaskCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TaskDto> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        // Fetch task and ensure it exists
        var task = await _unitOfWork.Tasks.GetByIdAsync(request.Id)
            ?? throw new TaskNotFoundException(request.Id);

        // Update project if specified
        if (request.ProjectId.HasValue)
        {
            var projectExists = await _unitOfWork.Projects.ExistsAsync(request.ProjectId.Value);
            if (!projectExists)
            {
                throw new ProjectNotFoundException(request.ProjectId.Value);
            }
            task.ChangeProject(request.ProjectId.Value);
        }

        // Update assignee if specified
        if (request.AssigneeId.HasValue)
        {
            var userExists = await _unitOfWork.Users.ExistsAsync(request.AssigneeId.Value);
            if (!userExists)
            {
                throw new UserNotFoundException(request.AssigneeId.Value);
            }
            task.AssignTo(request.AssigneeId.Value);
        }
        else if (request.AssigneeId == null)
        {
            // If assignee is explicitly set to null, unassign the task
            task.UnassignTask();
        }

        // Update status if specified
        if (request.Status.HasValue)
        {
            task.UpdateStatus(request.Status.Value);
        }

        // Update due date if specified
        if (request.DueDate.HasValue)
        {
            task.SetDueDate(request.DueDate.Value);
        }

        // Update task details if any of title, description, or priority is specified
        if (request.Title != null || request.Description != null || request.Priority.HasValue)
        {
            task.UpdateDetails(
                request.Title ?? task.Title,
                request.Description ?? task.Description,
                request.Priority ?? task.Priority);
        }

        // Log the changes before saving
        _logger.LogInformation(
            "Updating task {TaskId}. Changes: Title={Title}, Description={Description}, Status={Status}, " +
            "Priority={Priority}, ProjectId={ProjectId}, AssigneeId={AssigneeId}, DueDate={DueDate}",
            task.Id,
            request.Title ?? "(unchanged)",
            request.Description ?? "(unchanged)",
            request.Status?.ToString() ?? "(unchanged)",
            request.Priority?.ToString() ?? "(unchanged)",
            request.ProjectId?.ToString() ?? "(unchanged)",
            request.AssigneeId?.ToString() ?? "(unchanged)",
            request.DueDate?.ToString() ?? "(unchanged)");

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updatedTask = await _unitOfWork.Tasks.GetByIdWithDetailsAsync(task.Id)
            ?? throw new TaskNotFoundException(task.Id);

        // Verify all changes were saved correctly
        if (request.Title != null && updatedTask.Title != request.Title)
            throw new InvalidOperationException($"Failed to update task title. Expected: {request.Title}, Actual: {updatedTask.Title}");
        if (request.Status.HasValue && updatedTask.Status != request.Status.Value)
            throw new InvalidOperationException($"Failed to update task status. Expected: {request.Status}, Actual: {updatedTask.Status}");
        if (request.Priority.HasValue && updatedTask.Priority != request.Priority.Value)
            throw new InvalidOperationException($"Failed to update task priority. Expected: {request.Priority}, Actual: {updatedTask.Priority}");

        return _mapper.Map<TaskDto>(updatedTask);
    }
}

public record DeleteTaskCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
    public Guid? DeletedBy { get; init; }
}

public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTaskCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.Tasks.GetByIdAsync(request.Id)
            ?? throw new TaskNotFoundException(request.Id);

        // Call the domain entity's Delete method to raise the event
        task.Delete(request.DeletedBy);
        
        _unitOfWork.Tasks.Delete(task);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
