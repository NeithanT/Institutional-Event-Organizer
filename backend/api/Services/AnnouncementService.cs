using api.DTOs;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly EventOrganizerContext _db;

    public AnnouncementService(EventOrganizerContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<AnnouncementSummaryDto>> GetAnnouncementsAsync(AnnouncementFilterDto filters)
    {
        var query = _db.Announcements
            .Include(a => a.Writer)
            .Include(a => a.Event)
            .AsQueryable();

        if (filters.Date.HasValue)
        {
            var date = filters.Date.Value;
            query = query.Where(a =>
                a.Event != null &&
                a.Event.EventDate.Year == date.Year &&
                a.Event.EventDate.Month == date.Month &&
                a.Event.EventDate.Day == date.Day);
        }

        return await query
            .OrderByDescending(a => a.Id)
            .Select(a => new AnnouncementSummaryDto
            {
                Id = a.Id,
                Title = a.Title,
                About = a.About,
                WriterName = a.Writer.UserName,
                EventTitle = a.Event != null ? a.Event.Title : null,
                EventDate = a.Event != null ? a.Event.EventDate : null
            })
            .ToListAsync();
    }

    public async Task<AnnouncementDetailDto?> GetAnnouncementByIdAsync(int id)
    {
        var announcement = await _db.Announcements
            .Include(a => a.Writer)
            .Include(a => a.Event)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (announcement is null) return null;

        return new AnnouncementDetailDto
        {
            Id = announcement.Id,
            Title = announcement.Title,
            About = announcement.About,
            Body = announcement.Body,
            WriterName = announcement.Writer.UserName,
            EventTitle = announcement.Event?.Title
        };
    }
}
