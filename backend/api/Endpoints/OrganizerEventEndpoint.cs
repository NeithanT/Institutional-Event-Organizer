using System;
using System.Data;
using api.DTOs;
using api.Interfaces;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public static class EventEndpoint
{
    public static void mapOrganizerEventEndpoints(WebApplication app)
    {
        //Get all the events from the Events Table (Doesnt fetch the Canceled Events)
        app.MapGet("organizer/my-events/all", async ([FromQuery] int organizerId, EventOrganizerContext db) =>
        {
            var events = await db.Events
                        .Where(e => e.OrganizerId == organizerId)
                        .ToListAsync();

            return Results.Ok(events);
        });

        //##################################################################################

        //Get all the events from the Events Table (Doesnt fetch the Canceled Events)
        app.MapGet("organizer/my-events", async ([FromQuery] int organizerId, EventOrganizerContext db) =>
        {
            var availableEvents = await db.Events
                                .Include(a => a.CanceledEvent)
                                .Where(ev =>
                                    !db.CanceledEvents.Any(c => c.EventId == ev.Id)
                                    &&
                                    ev.OrganizerId == organizerId
                                ).
                                ToListAsync();
            return Results.Ok(availableEvents);
        });


        //##################################################################################

        //Gets the information for an specific event from the Events Table
        app.MapGet("organizer/my-events/{id}", async ([FromQuery] int organizerId, [FromRoute] int id, EventOrganizerContext db) =>
        {
            Event? ev = await db.Events.FindAsync(id);
            if (ev == null) return Results.NotFound("Event not found");
            if (ev.OrganizerId != organizerId) return Results.Unauthorized();
            return Results.Ok(ev);

        });

        //##################################################################################
        //Creates an event on the Events Table
        app.MapPost("organizer/events", async ([FromForm] DtoCreateEvent createEventDto, IWebHostEnvironment env, EventOrganizerContext db) =>
            {
                string imagePath = "/Images/default.jpg";


                if (createEventDto.ImageFileEvent != null
                &&
                createEventDto.ImageFileEvent.Length > 0)
                {

                    string uploadsFolder = Path.Combine(env.WebRootPath, "uploads");
                    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);


                    string uniqueFileName = Guid.NewGuid().ToString() + "_" + createEventDto.ImageFileEvent.FileName;
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    // 3. Guardar el archivo físicamente
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await createEventDto.ImageFileEvent.CopyToAsync(fileStream);
                    }

                    imagePath = "/uploads/" + uniqueFileName;
                }

                if (createEventDto.EventDate < DateTime.UtcNow)
                    return Results.BadRequest("Cannot create an event in the past");

                Event ev = new Event
                {
                    Title = createEventDto.Title,
                    ImageFileEvent = imagePath,
                    EventDescription = createEventDto.EventDescription,
                    EventDate = createEventDto.EventDate,
                    Place = createEventDto.Place,
                    CategoryId = createEventDto.CategoryId,
                    OrganizerId = createEventDto.OrganizerId,
                    OrganizerEntityId = createEventDto.OrganizerEntityId,
                    AvalaibleEntries = createEventDto.AvalaibleEntries,
                    ApprovedState = false,
                    IsVirtual = createEventDto.IsVirtual
                };

                await db.Events.AddAsync(ev);
                await db.SaveChangesAsync();

                return Results.Created($"/events/{ev.Id}", ev);
            }).DisableAntiforgery();


        //##################################################################################
        //Cancels an event on the Events Table
        app.MapPost("organizer/events/{id:int}/cancel", async (
            [FromRoute] int id,
            [FromBody] DtoCanceledEvent dto,
            [FromServices] IEmailService mailService,
            EventOrganizerContext db
           ) =>

            {
                //Basic validations
                Event? ev = await db.Events.FindAsync(id);

                if (ev == null)
                    return Results.NotFound();
                if (ev.OrganizerId != dto.OrganizerId)
                    return Results.Unauthorized();

                //Check if event has been approved
                if (ev.ApprovedState == false)
                    return Results.BadRequest("Event has not been approved yet (cannot be canceled unless aproved)");


                //Check if event has already been canceled
                if (await db.CanceledEvents.AnyAsync(c => c.EventId == id))
                    return Results.BadRequest("Event already canceled");

                CanceledEvent newCanceledEvent = new CanceledEvent
                {
                    EventId = id,
                    Reason = dto.Reason
                };

                await db.CanceledEvents.AddAsync(newCanceledEvent);
                await db.SaveChangesAsync();

                var enrolledPeople = await db.Inscriptions
                .Where(insc => insc.EventId == id)
                .Select(u => u.User)
                .ToListAsync();

                foreach (var user in enrolledPeople)
                {

                    await mailService.SendEmailAsync(user.Email,
                    $"The Event {ev.Title} has been CANCELED",
                    $"{dto.Reason}");

                }
                return Results.Ok("The event has been canceled succesfully");

            });

        //##################################################################################
        app.MapPost("organizer/events/{id:int}/notice", async (
        [FromRoute] int id,
        [FromBody] DtoAnnoucement noticeData,
        [FromServices] IEmailService mailService,
        EventOrganizerContext db
        ) =>

        {
            Event? ev = await db.Events.FindAsync(id);
            if (ev == null) return Results.NotFound();
            if (ev.OrganizerId != noticeData.WriterId)
                return Results.Unauthorized();

            Announcement announcement = new Announcement
            {
                WriterId = noticeData.WriterId,
                Title = noticeData.Title,
                About = noticeData.About,
                Body = noticeData.Body,
                EventId = id
            };

            await db.Announcements.AddAsync(announcement);
            await db.SaveChangesAsync();

            var enrolledEmails = await db.Inscriptions
            .Where(insc => insc.EventId == id)
            .Select(u => u.User.Email)
            .ToListAsync();

            var emailTasks = enrolledEmails.Select(email =>
                    mailService.SendEmailAsync(email, $"ANNOUNCEMENT: {announcement.Title}", announcement.Body)
                );
            await Task.WhenAll(emailTasks);

            return Results.Ok("Announcement send correctly");
        });


        //##################################################################################
        //Deletes an event from the Events Table
        app.MapDelete("organizer/events/{id}", async (
            [FromRoute] int id,
            [FromQuery] int organizerId,
            [FromServices] EventOrganizerContext db) =>
        {
            Event? ev = await db.Events.FindAsync(id);
            if (ev == null) return Results.NotFound();
            if (ev.OrganizerId != organizerId) return Results.Unauthorized();
            {
                db.Events.Remove(ev);
                await db.SaveChangesAsync();
                return Results.NoContent();
            }
        });

    }
}
