using MediatR;

namespace Taskify.Domain.Common;

public abstract class DomainEvent : INotification
{
    protected DomainEvent()
    {
        EventId = Guid.NewGuid();
        OccurredOn = DateTime.UtcNow;
    }

    public Guid EventId { get; }
    public DateTime OccurredOn { get; }
}
