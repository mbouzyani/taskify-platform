using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Taskify.Application.DTOs;
using Taskify.Application.Interfaces;

namespace Taskify.Application.Queries.Team;

public record GetTeamMembersQuery : IRequest<List<TeamMemberDto>>
{
    public bool IncludeTaskStats { get; init; }
}

public record GetTeamMemberByIdQuery : IRequest<TeamMemberDto>
{
    public Guid Id { get; init; }
}

public class GetTeamMembersQueryHandler : IRequestHandler<GetTeamMembersQuery, List<TeamMemberDto>>
{
    private readonly ITaskifyContext _context;
    private readonly IMapper _mapper;

    public GetTeamMembersQueryHandler(ITaskifyContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<TeamMemberDto>> Handle(GetTeamMembersQuery request, CancellationToken cancellationToken)
    {
        var users = await _context.Users
            .Include(u => u.AssignedProjects)
            .Include(u => u.AssignedTasks)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<TeamMemberDto>>(users);
    }
}

public class GetTeamMemberByIdQueryHandler : IRequestHandler<GetTeamMemberByIdQuery, TeamMemberDto>
{
    private readonly ITaskifyContext _context;
    private readonly IMapper _mapper;

    public GetTeamMemberByIdQueryHandler(ITaskifyContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<TeamMemberDto> Handle(GetTeamMemberByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.AssignedProjects)
            .Include(u => u.AssignedTasks)
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user == null)
            throw new Exception($"Team member with ID {request.Id} not found");

        return _mapper.Map<TeamMemberDto>(user);
    }
}
