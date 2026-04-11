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
    private static async Task<bool> IsActiveUser(EventOrganizerContext db, int userId)
    {
        return await db.Users.AnyAsync(u => u.Id == userId && u.Active);
    }

    private static bool IsValidData(DtoEditEvent d)
    {
        return !(
            d.IdEvent < 0
        || string.IsNullOrEmpty(d.EventDate.ToString())
        || d.EventDate < DateTime.Now
        || string.IsNullOrEmpty(d.EventDescription)
        || string.IsNullOrEmpty(d.Place)
        || string.IsNullOrEmpty(d.Title));
    }

    public static void mapOrganizerEventEndpoints(WebApplication app)
    {
        //Get all the events from the Events Table (Doesnt fetch the Canceled Events)
        app.MapGet("/api/organizer/my-events/all", async ([FromQuery] int organizerId, EventOrganizerContext db) =>
        {
            if (!await IsActiveUser(db, organizerId))
                return Results.BadRequest("Organizer is inactive");

            var events = await db.Events
                        .Where(e => e.OrganizerId == organizerId)
                        .ToListAsync();

            return Results.Ok(events);
        });

        //##################################################################################

        //Get all the events from the Events Table (Doesnt fetch the Canceled Events)
        app.MapGet("/api/organizer/my-events", async ([FromQuery] int organizerId, EventOrganizerContext db) =>
        {
            if (!await IsActiveUser(db, organizerId))
                return Results.BadRequest("Organizer is inactive");

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
        app.MapGet("/api/organizer/my-events/{id}", async ([FromQuery] int organizerId, [FromRoute] int id, EventOrganizerContext db) =>
        {
            if (!await IsActiveUser(db, organizerId))
                return Results.BadRequest("Organizer is inactive");

            Event? ev = await db.Events.FindAsync(id);
            if (ev == null) return Results.NotFound("Event not found");
            if (ev.OrganizerId != organizerId) return Results.Unauthorized();
            return Results.Ok(ev);

        });

        //##################################################################################
        //Creates an event on the Events Table
        app.MapPost("/api/organizer/events", async ([FromForm] DtoCreateEvent createEventDto, IWebHostEnvironment env, EventOrganizerContext db) =>
            {
                if (!await IsActiveUser(db, createEventDto.OrganizerId))
                    return Results.BadRequest("Organizer is inactive");
                string imagePath = "/images/default.jpg";



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

                return Results.Created($"/api/organizer/events/{ev.Id}", ev);
            }).DisableAntiforgery();


        app.MapPut("/api/organizer/events", async (DtoEditEvent editEventDto, IEmailService mailService, EventOrganizerContext db) =>
        {

            if (!await IsActiveUser(db, editEventDto.OrganizerId))
                return Results.BadRequest("Organizer is inactive");

            Event? ev = await db.Events.FindAsync(editEventDto.IdEvent);
            if (ev == null) return Results.NotFound("Event not found to update");
            if (ev.OrganizerId != editEventDto.OrganizerId) return Results.Unauthorized();


            if (!IsValidData(editEventDto)) return Results.BadRequest("Invalid data to update");

            var previousDate = ev.EventDate;
            var previousPlace = ev.Place;
            var hasDateChanged = previousDate != editEventDto.EventDate;
            var hasPlaceChanged = !string.Equals(previousPlace?.Trim(), editEventDto.Place?.Trim(), StringComparison.Ordinal);
            var hasDateOrPlaceChanged = hasDateChanged || hasPlaceChanged;

            ev.Title = editEventDto.Title;
            ev.EventDescription = editEventDto.EventDescription;
            ev.EventDate = editEventDto.EventDate;
            ev.Place = editEventDto.Place ?? string.Empty;
            ev.IsVirtual = editEventDto.IsVirtual;

            await db.SaveChangesAsync();

            if (hasDateOrPlaceChanged)
            {
                var enrolledUsers = await db.Inscriptions
                    .Where(ins => ins.EventId == ev.Id)
                    .Where(ins => ins.User.Active)
                    .Select(ins => ins.User)
                    .ToListAsync();

                var oldDate = previousDate.ToString("dd 'de' MMMM 'de' yyyy, HH:mm", new System.Globalization.CultureInfo("es-CR"));
                var newDate = ev.EventDate.ToString("dd 'de' MMMM 'de' yyyy, HH:mm", new System.Globalization.CultureInfo("es-CR"));

                var mailTasks = enrolledUsers.Select(user =>
                    mailService.SendEmailAsync(
                        user.Email,
                        $"Actualización de evento inscrito: {ev.Title}",
                        $"<p>Hola {user.UserName},</p>" +
                        $"<p>El evento <strong>{ev.Title}</strong> tuvo cambios en fecha, hora o lugar.</p>" +
                        "<p><strong>Detalle del cambio:</strong></p>" +
                        $"<ul><li>Fecha/hora anterior: {oldDate}</li><li>Fecha/hora nueva: {newDate}</li><li>Lugar anterior: {previousPlace}</li><li>Lugar nuevo: {ev.Place}</li></ul>"
                    )
                );

                try
                {
                    await Task.WhenAll(mailTasks);
                }
                catch
                {
                    // El email es best-effort; no cancela la edición del evento.
                }
            }

            return Results.Ok($"Event updated succesfully");
        });


        //##################################################################################
        //Cancels an event on the Events Table
        app.MapPost("/api/organizer/events/{id:int}/cancel", async (
            [FromRoute] int id,
            [FromBody] DtoCanceledEvent dto,
            [FromServices] IEmailService mailService,
            EventOrganizerContext db
           ) =>

            {
                if (!await IsActiveUser(db, dto.OrganizerId))
                    return Results.BadRequest("Organizer is inactive");

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
        app.MapPost("/api/organizer/events/{id:int}/notice", async (
        [FromRoute] int id,
        [FromBody] DtoAnnoucement noticeData,
        [FromServices] IEmailService mailService,
        EventOrganizerContext db
        ) =>

        {
            if (!await IsActiveUser(db, noticeData.WriterId))
                return Results.BadRequest("Organizer is inactive");

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
        app.MapDelete("/api/organizer/events/{id}", async (
            [FromRoute] int id,
            [FromQuery] int organizerId,
            [FromServices] EventOrganizerContext db) =>
        {
            if (!await IsActiveUser(db, organizerId))
                return Results.BadRequest("Organizer is inactive");

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
