using api.DTOs;

namespace api.Interfaces;

public interface IEventService
{
    Task<IEnumerable<EventSummaryDto>> GetApprovedEventsAsync(EventFilterDto filters);
    Task<EventDetailDto?> GetEventByIdAsync(int id);
}
