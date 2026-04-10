using System;
using api.DTOs;
using api.Interfaces;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public static class AdministratorEventEndpoint
{
    private static DateTime NormalizeEventDate(DateTime value)
    {
        return DateTime.SpecifyKind(value, DateTimeKind.Unspecified);
    }

    private static bool IsValidData(DtoEditEvent d)
    {
        var eventDate = NormalizeEventDate(d.EventDate);

        return d.IdEvent > 0
            && d.OrganizerId > 0
            && d.OrganizerEntityId.HasValue
            && d.OrganizerEntityId.Value > 0
            && d.CategoryId.HasValue
            && d.CategoryId.Value > 0
            && !string.IsNullOrWhiteSpace(d.EventDescription)
            && !string.IsNullOrWhiteSpace(d.Place)
            && !string.IsNullOrWhiteSpace(d.Title)
            && eventDate.Date > DateTime.UtcNow.Date;
    }
    public static void mapAdministratorEndpoints(WebApplication app)
    {
        //Just in case you guys need to get all the events (event the denied and canceled ones) for some reason
        app.MapGet("/administrator/events/all", async (EventOrganizerContext db) =>
        {
            return Results.Ok(await db.Events.ToListAsync());
        });
        //##################################################################################################################

        //Gets all the available event (Approved and "pending") (Doesnt fetch the already denied and canceled ones)
        app.MapGet("/administrator/events", async (EventOrganizerContext db) =>
        {
            var evs = await db.Events
            .Where(e => !db.CanceledEvents.Any(c => c.EventId == e.Id))
            .ToListAsync();
            return Results.Ok(evs);
        });

        //##################################################################################################################
        //Gets event summaries for content moderation
        app.MapGet("/administrator/events/moderation", async (EventOrganizerContext db) =>
        {
            var evs = await db.Events
                .Where(e => !db.CanceledEvents.Any(c => c.EventId == e.Id))
                .Select(e => new
                {
                    id = e.Id,
                    title = e.Title,
                    organizer = e.OrganizerEntity.EntityName,
                    category = e.Category.NameCategory,
                    date = e.EventDate,
                    location = e.Place,
                    approved = e.ApprovedState
                })
                .ToListAsync();

            return Results.Ok(evs);
        });

        //##################################################################################################################
        //Get single event full details for admin
        app.MapGet("/administrator/events/{id}", async (int id, EventOrganizerContext db) =>
        {
            var ev = await db.Events
                .Include(e => e.Category)
                .Include(e => e.OrganizerEntity)
                .AsNoTracking()
                .Where(e => e.Id == id)
                .Select(e => new DtoEditEvent
                {
                    OrganizerId = e.OrganizerId,
                    OrganizerEntityId = e.OrganizerEntityId,
                    CategoryId = e.CategoryId,
                    ApprovedState = e.ApprovedState,
                    IdEvent = e.Id,
                    Title = e.Title,
                    EventDescription = e.EventDescription,
                    Place = e.Place,
                    IsVirtual = e.IsVirtual,
                    EventDate = e.EventDate,
                    ImageFileEvent = e.ImageFileEvent,
                    AvalaibleEntries = e.AvalaibleEntries
                })
                .FirstOrDefaultAsync();

            if (ev == null) return Results.NotFound("Event not found");
            if (await db.CanceledEvents.AnyAsync(c => c.EventId == id)) return Results.BadRequest("Event has been canceled or denied");

            return Results.Ok(ev);
        });

        //###################################################################################################################
        app.MapGet("/administrator/events/pending", async (EventOrganizerContext db) =>
        {
            var evs = await db.Events
                .Where(e => e.ApprovedState == false)
                .Where(e => !db.CanceledEvents.Any(c => c.EventId == e.Id))
                .Select(e => new
                {
                    id = e.Id,
                    title = e.Title,
                    organizer = e.OrganizerEntity.EntityName,
                    date = e.EventDate,
                    location = e.Place,
                    approved = e.ApprovedState
                })
                .ToListAsync();

            // check that this events are not in the canceled events table
            evs = evs.Where(e => !db.CanceledEvents.Any(c => c.EventId == e.id)).ToList();
            return Results.Ok(evs);
        });
        //##################################################################################################################

        app.MapPost("/administrator/announcements", async (DtoAnnoucement dto, IEmailService mailService, EventOrganizerContext db) =>
        {
            var writer = dto.WriterId > 0
                ? await db.Users.FindAsync(dto.WriterId)
                : await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Role.RolName == "Admin" && u.Active);

            if (writer == null)
                return Results.BadRequest("Writer not found or inactive");

            var announcement = new Announcement
            {
                WriterId = writer.Id,
                EventId = null,
                Title = dto.Title,
                About = dto.About,
                Body = dto.Body,
            };

            await db.Announcements.AddAsync(announcement);
            await db.SaveChangesAsync();

            var recipients = await db.Users
                .Where(u => u.Active)
                .ToListAsync();

            foreach (var user in recipients)
            {
                await mailService.SendEmailAsync(
                    user.Email,
                    $"ANUNCIO: {announcement.Title}",
                    $"<p>{announcement.Body}</p><p><strong>Categoría:</strong> {announcement.About}</p>"
                );
            }

            return Results.Ok("Announcement sent correctly");
        });
        //##################################################################################################################

        //Changes the status of an event to approved = true
        app.MapPost("/administrator/{id:int}/approve", async (int id, EventOrganizerContext db) =>
        {

            Event? eventToApprove = await db.Events.FindAsync(id);
            if (eventToApprove == null) return Results.NotFound("Event not found");
            if (eventToApprove.ApprovedState == true) return Results.BadRequest("Event has already been approved");
            if (await db.CanceledEvents.AnyAsync(e => e.EventId == id)) return Results.BadRequest("Event already been canceled by organizer");


            eventToApprove.ApprovedState = true; ;
            await db.SaveChangesAsync();
            return Results.Ok("Event has been approved successfully");
        });

        //##################################################################################################################

        //Changes the status of an event to approved = true
        app.MapPost("/administrator/{id:int}/reject", async (int id, RejectEventDto rejectDto,EventOrganizerContext db) =>
        {

            Event? eventToReject = await db.Events.FindAsync(id);
            if (eventToReject == null) return Results.NotFound("Event not found");
            if (eventToReject.ApprovedState == true) return Results.BadRequest("Event has already been approved");
            if (await db.CanceledEvents.AnyAsync(e => e.EventId == id)) return Results.BadRequest("Event already been canceled by organizer");


            eventToReject.ApprovedState = false;
            CanceledEvent canceledEvent = new CanceledEvent
            {
                EventId = id,
                Reason = rejectDto.Reason,
            };
            await db.CanceledEvents.AddAsync(canceledEvent);
            await db.SaveChangesAsync();
            return Results.Ok("Event has been rejected successfully");
        });

        //##################################################################################################################
        app.MapPut("/administrator/events/{id:int}", async (int id, [FromBody] DtoEditEvent editEventDto, EventOrganizerContext db) =>
        {
            if (id != editEventDto.IdEvent) return Results.BadRequest("Route id does not match payload id");

            Event? ev = await db.Events.FindAsync(id);
            if (ev == null) return Results.NotFound("Event not found to update");

            if (!IsValidData(editEventDto)) return Results.BadRequest("Invalid data to update");

            var normalizedEventDate = NormalizeEventDate(editEventDto.EventDate);

            if (!await db.Categories.AnyAsync(c => c.Id == editEventDto.CategoryId!.Value))
                return Results.BadRequest("Invalid category id");

            if (!await db.OrganizerEntities.AnyAsync(o => o.Id == editEventDto.OrganizerEntityId!.Value))
                return Results.BadRequest("Invalid organizer entity id");

            if (!await db.Users.AnyAsync(u => u.Id == editEventDto.OrganizerId))
                return Results.BadRequest("Invalid organizer user id");

            if (editEventDto.CategoryId is not int categoryId)
                return Results.BadRequest("Invalid category id");

            if (editEventDto.OrganizerEntityId is not int organizerEntityId)
                return Results.BadRequest("Invalid organizer entity id");

            ev.Title = editEventDto.Title.Trim();
            ev.EventDescription = editEventDto.EventDescription.Trim();
            ev.EventDate = normalizedEventDate;
            ev.Place = editEventDto.Place.Trim();
            ev.IsVirtual = editEventDto.IsVirtual;
            ev.CategoryId = categoryId;
            ev.OrganizerEntityId = organizerEntityId;
            ev.OrganizerId = editEventDto.OrganizerId;

            if (editEventDto.ApprovedState.HasValue)
                ev.ApprovedState = editEventDto.ApprovedState.Value;

            await db.SaveChangesAsync();

            return Results.Ok("Event updated succesfully");
        });

        //##################################################################################################################
        //Changes the status of an event to approved = false and add it to the canceled table
        app.MapPost("/administrator/{id:int}/deny", async (DtoDenyEvent dtoDeny, int id, EventOrganizerContext db) =>
        {

            Event? eventToDeny = await db.Events.FindAsync(id);
            if (eventToDeny == null) return Results.NotFound("Event not found");

            if (await db.CanceledEvents.AnyAsync(e => e.EventId == id) && eventToDeny.ApprovedState == true)
                return Results.BadRequest("Event already been canceled by organizer");

            if (await db.CanceledEvents.AnyAsync(e => e.EventId == id))
                return Results.BadRequest("Event already been denied");


            eventToDeny.ApprovedState = false;

            CanceledEvent canceledEvent = new CanceledEvent
            {
                EventId = id,
                Reason = dtoDeny.reason,
            };

            await db.CanceledEvents.AddAsync(canceledEvent);

            await db.SaveChangesAsync();
            return Results.Ok("Event has been denied successfully");
        });
    }
}
