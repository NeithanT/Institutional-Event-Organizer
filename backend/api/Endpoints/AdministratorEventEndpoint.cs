using System;
using api.DTOs;
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
        //##################################################################################################################33

        //Gets all the available event (Approved and "pending") (Doesnt fetch the already denied and canceled ones)
        app.MapGet("/administrator/events", async (EventOrganizerContext db) =>
        {
            var evs = await db.Events
            .Where(e => !db.CanceledEvents.Any(c => c.EventId == e.Id))
            .ToListAsync();
            return Results.Ok(evs);
        });
        //##################################################################################################################33

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
        //##################################################################################################################33
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
