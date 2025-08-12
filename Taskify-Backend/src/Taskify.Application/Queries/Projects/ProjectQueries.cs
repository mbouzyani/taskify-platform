using AutoMapper;
using MediatR;
using Taskify.Application.DTOs;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;

namespace Taskify.Application.Queries.Projects;

// Get All Projects Query
public record GetAllProjectsQuery : IRequest<List<ProjectDto>>;

public class GetAllProjectsQueryHandler : IRequestHandler<GetAllProjectsQuery, List<ProjectDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllProjectsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<ProjectDto>> Handle(GetAllProjectsQuery request, CancellationToken cancellationToken)
    {
        var projects = await _unitOfWork.Projects.GetAllWithTasksAsync();
        
        var projectDtos = _mapper.Map<List<ProjectDto>>(projects);
        
        // Calculate additional metrics
        foreach (var projectDto in projectDtos)
        {
            var project = projects.FirstOrDefault(p => p.Id == projectDto.Id);
            if (project != null)
            {
                projectDto.TaskCount = project.Tasks.Count;
                projectDto.CompletedTasks = project.GetCompletedTasksCount();
                projectDto.CompletionPercentage = project.GetCompletionPercentage();
                projectDto.TodoTasks = project.GetTodoTasksCount();
                projectDto.InProgressTasks = project.GetInProgressTasksCount();
                projectDto.ReviewTasks = project.GetReviewTasksCount();
            }
        }
        
        return projectDtos;
    }
}

// Get Project By ID Query
public record GetProjectByIdQuery : IRequest<ProjectDto>
{
    public int Id { get; init; }
}

public class GetProjectByIdQueryHandler : IRequestHandler<GetProjectByIdQuery, ProjectDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetProjectByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ProjectDto> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
    {
        var project = await _unitOfWork.Projects.GetByIdWithTasksAsync(request.Id)
            ?? throw new ProjectNotFoundException(request.Id);
        
        var projectDto = _mapper.Map<ProjectDto>(project);
        
        // Calculate additional metrics
        projectDto.TaskCount = project.Tasks.Count;
        projectDto.CompletedTasks = project.GetCompletedTasksCount();
        projectDto.CompletionPercentage = project.GetCompletionPercentage();
        projectDto.TodoTasks = project.GetTodoTasksCount();
        projectDto.InProgressTasks = project.GetInProgressTasksCount();
        projectDto.ReviewTasks = project.GetReviewTasksCount();
        
        return projectDto;
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
