using api.DTOs;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class EventService : IEventService
{
    private readonly EventOrganizerContext _db;

    public EventService(EventOrganizerContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<EventSummaryDto>> GetApprovedEventsAsync(EventFilterDto filters)
    {
        var query = _db.Events
            .Where(e => e.ApprovedState)
            .Include(e => e.Category)
            .Include(e => e.OrganizerEntity)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filters.Category))
            query = query.Where(e =>
                e.Category.NameCategory.ToLower() == filters.Category.ToLower());

        if (!string.IsNullOrWhiteSpace(filters.Modality))
        {
            bool isVirtual = filters.Modality.ToLower() == "virtual";
            query = query.Where(e => e.IsVirtual == isVirtual);
        }

        if (!string.IsNullOrWhiteSpace(filters.OrganizerEntity))
            query = query.Where(e =>
                e.OrganizerEntity.EntityName.ToLower() == filters.OrganizerEntity.ToLower());

        if (filters.Date.HasValue)
        {
            var date = filters.Date.Value;
            query = query.Where(e =>
                e.EventDate.Year == date.Year &&
                e.EventDate.Month == date.Month &&
                e.EventDate.Day == date.Day);
        }

        return await query
            .OrderBy(e => e.EventDate)
            .Select(e => new EventSummaryDto
            {
                Id = e.Id,
                Title = e.Title,
                Place = e.Place,
                EventDate = e.EventDate,
                Category = e.Category.NameCategory,
                OrganizerEntity = e.OrganizerEntity.EntityName,
                AvailableEntries = e.AvalaibleEntries,
                IsVirtual = e.IsVirtual,
                ImageFileEvent = e.ImageFileEvent
            })
            .ToListAsync();
    }

    public async Task<EventDetailDto?> GetEventByIdAsync(int id)
    {
        var ev = await _db.Events
            .Where(e => e.Id == id && e.ApprovedState)
            .Include(e => e.Category)
            .Include(e => e.OrganizerEntity)
            .Include(e => e.Organizer)
            .Include(e => e.CanceledEvent)
            .FirstOrDefaultAsync();

        if (ev is null) return null;

        return new EventDetailDto
        {
            Id = ev.Id,
            Title = ev.Title,
            Place = ev.Place,
            EventDate = ev.EventDate,
            EventDescription = ev.EventDescription,
            Category = ev.Category.NameCategory,
            OrganizerEntity = ev.OrganizerEntity.EntityName,
            OrganizerName = ev.Organizer.UserName,
            AvailableEntries = ev.AvalaibleEntries,
            IsVirtual = ev.IsVirtual,
            ImageFileEvent = ev.ImageFileEvent,
            IsCanceled = ev.CanceledEvent is not null,
            CancelReason = ev.CanceledEvent?.Reason
        };
    }
}
