using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using Taskify.Domain.Events;

namespace Taskify.Application.EventHandlers;

public class TeamEventHandler : 
    INotificationHandler<TeamMemberInvitedEvent>,
    INotificationHandler<TeamMemberProfileUpdatedEvent>,
    INotificationHandler<TeamMemberRoleChangedEvent>,
    INotificationHandler<TeamMemberRemovedEvent>
{
    private readonly ILogger<TeamEventHandler> _logger;

    public TeamEventHandler(ILogger<TeamEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TeamMemberInvitedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "New team member invited: {Name} ({Email}) with role {Role}",
            notification.Name,
            notification.Email,
            notification.Role);

        // TODO: Send invitation email
        return Task.CompletedTask;
    }

    public Task Handle(TeamMemberProfileUpdatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Team member profile updated - ID: {Id}, Name changed from {OldName} to {NewName}",
            notification.UserId,
            notification.OldName,
            notification.NewName);

        return Task.CompletedTask;
    }

    public Task Handle(TeamMemberRoleChangedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Team member role changed - {UserName}: {OldRole} → {NewRole}",
            notification.UserName,
            notification.OldRole,
            notification.NewRole);

        return Task.CompletedTask;
    }

    public Task Handle(TeamMemberRemovedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Team member removed: {Name} ({Email}) with role {Role}",
            notification.Name,
            notification.Email,
            notification.Role);

        return Task.CompletedTask;
    }
}
