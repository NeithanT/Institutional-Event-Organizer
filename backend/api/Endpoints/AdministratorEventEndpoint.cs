using System;
using api.DTOs;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public static class AdministratorEventEndpoint
{
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
                    e.Id,
                    e.Title,
                    organizer = e.OrganizerEntity.EntityName,
                    category = e.Category.NameCategory,
                    date = e.EventDate,
                    location = e.Place,
                    approved = e.ApprovedState,
                    reports = 0
                })
                .ToListAsync();

            return Results.Ok(evs);
        });

        //###################################################################################################################
        app.MapGet("/administrator/events/pending", async (EventOrganizerContext db) =>
        {
            var evs = await db.Events
                .Where(e => e.ApprovedState == false)
                .Where(e => !db.CanceledEvents.Any(c => c.EventId == e.Id))
                .Select(e => new
                {
                    e.Id,
                    e.Title,
                    organizer = e.OrganizerEntity.EntityName,
                    date = e.EventDate,
                    location = e.Place,
                    approved = e.ApprovedState
                })
                .ToListAsync();
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
