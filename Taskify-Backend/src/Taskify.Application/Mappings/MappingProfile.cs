using AutoMapper;
using Taskify.Application.DTOs;
using Taskify.Domain.Entities;

namespace Taskify.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Domain.Entities.Task, TaskDto>()
            .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project.Name))
            .ForMember(dest => dest.ProjectColor, opt => opt.MapFrom(src => src.Project.Color))
            .ForMember(dest => dest.AssigneeName, opt => opt.MapFrom(src => src.Assignee != null ? src.Assignee.Name : null))
            .ForMember(dest => dest.AssigneeAvatar, opt => opt.MapFrom(src => src.Assignee != null ? src.Assignee.Avatar : null))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.CreatedAt));

        CreateMap<Project, ProjectDto>()
            .ForMember(dest => dest.TaskCount, opt => opt.MapFrom(src => src.Tasks.Count))
            .ForMember(dest => dest.CompletedTasks, opt => opt.MapFrom(src => src.GetCompletedTasksCount()))
            .ForMember(dest => dest.CompletionPercentage, opt => opt.MapFrom(src => src.GetCompletionPercentage()))
            .ForMember(dest => dest.TodoTasks, opt => opt.MapFrom(src => src.GetTodoTasksCount()))
            .ForMember(dest => dest.InProgressTasks, opt => opt.MapFrom(src => src.GetInProgressTasksCount()))
            .ForMember(dest => dest.ReviewTasks, opt => opt.MapFrom(src => src.GetReviewTasksCount()))
            .ForMember(dest => dest.AssignedMembers, opt => opt.MapFrom(src => src.AssignedUsers))
            .ForMember(dest => dest.TotalMembers, opt => opt.MapFrom(src => src.AssignedUsers.Count));

        CreateMap<Project, ProjectProgressDto>()
            .ForMember(dest => dest.ProjectId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.TotalTasks, opt => opt.MapFrom(src => src.Tasks.Count))
            .ForMember(dest => dest.CompletedTasks, opt => opt.MapFrom(src => src.GetCompletedTasksCount()))
            .ForMember(dest => dest.CompletionPercentage, opt => opt.MapFrom(src => src.GetCompletionPercentage()));

        CreateMap<Project, AssignedProjectDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Color, opt => opt.MapFrom(src => src.Color))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.AssignedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<User, TeamMemberDto>()
            .ForMember(dest => dest.AssignedProjects, opt => opt.MapFrom(src => src.AssignedProjects))
            .ForMember(dest => dest.AssignedTasks, opt => opt.MapFrom(src => src.AssignedTasks.Count))
            .ForMember(dest => dest.CompletedTasks, opt => opt.MapFrom(src => src.AssignedTasks.Count(t => t.Status == Domain.Enums.TaskStatus.Completed)))
            .ForMember(dest => dest.OverdueTasks, opt => opt.MapFrom(src => src.AssignedTasks.Count(t => t.DueDate < DateTime.UtcNow && t.Status != Domain.Enums.TaskStatus.Completed)));

        CreateMap<User, ProjectMemberDto>();

        CreateMap<User, TeamMemberStatsDto>()
            .ForMember(dest => dest.TotalTasks, opt => opt.MapFrom(src => src.AssignedTasks.Count))
            .ForMember(dest => dest.CompletedTasks, opt => opt.MapFrom(src => src.AssignedTasks.Count(t => t.Status == Domain.Enums.TaskStatus.Completed)))
            .ForMember(dest => dest.InProgressTasks, opt => opt.MapFrom(src => src.AssignedTasks.Count(t => t.Status == Domain.Enums.TaskStatus.InProgress)))
            .ForMember(dest => dest.CompletionRate, opt => opt.MapFrom(src => src.AssignedTasks.Any() ? (double)src.AssignedTasks.Count(t => t.Status == Domain.Enums.TaskStatus.Completed) / src.AssignedTasks.Count : 0))
            .ForMember(dest => dest.TasksByProject, opt => opt.MapFrom(src => src.AssignedProjects.Select(p => new TasksByProjectDto
            {
                ProjectId = p.Id,
                ProjectName = p.Name,
                TotalTasks = src.AssignedTasks.Count(t => t.ProjectId == p.Id),
                CompletedTasks = src.AssignedTasks.Count(t => t.ProjectId == p.Id && t.Status == Domain.Enums.TaskStatus.Completed)
            })));
    }
}
