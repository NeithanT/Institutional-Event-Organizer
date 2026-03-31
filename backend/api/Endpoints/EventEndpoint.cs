using System;
using System.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public static class EventEndpoint
{
    public static void mapEventEndpoints(WebApplication app)
    {

        app.MapGet("/events", async (EventOrganizerContext db) =>
            await db.Events.ToListAsync());

        app.MapGet("/events/{id}", async (int id, EventOrganizerContext db) =>
            await db.Events.FindAsync(id)
                is Event ev
                    ? Results.Ok(ev)
                    : Results.NotFound());

        app.MapPost("/events", async (Event ev, EventOrganizerContext db) =>
        {
            ev.ApprovedState = false;
            db.Events.Add(ev);
            await db.SaveChangesAsync();

            return Results.Created($"/events/{ev.Id}", ev);
        });

        app.MapPut("/events/{id}", async (int id, Event evInput, EventOrganizerContext db) =>
        {
            var ev = await db.Events.FindAsync(id);

            if (ev is null) return Results.NotFound();
            if (evInput.EventDate < DateTime.Now) return Results.BadRequest();

            ev.Title = evInput.Title;
            ev.EventDate = evInput.EventDate;
            ev.Place = evInput.Place;
            ev.EventDescription = evInput.EventDescription;
            ev.AvalaibleEntries = evInput.AvalaibleEntries;
            ev.ApprovedState = evInput.ApprovedState;

            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        app.MapDelete("/events/{id}", async (int id, EventOrganizerContext db) =>
        {
            if (await db.Events.FindAsync(id) is Event ev)
            {
                db.Events.Remove(ev);
                await db.SaveChangesAsync();
                return Results.NoContent();
            }

            return Results.NotFound();
        });

    }
}
