using System;
using api.DTOs;
using api.Models;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace api.Endpoints;

public static class AttendanceEndpoint
{

    public static void mapAttendancesEndpoints(WebApplication app)
    {
        app.MapGet("organizer/events/{id:int}/check-list", async (int id, EventOrganizerContext db) =>
        {
            Event? ev = await db.Events.FindAsync(id);
            if (ev == null) return Results.NotFound();


            var subscriptions = await db.Inscriptions
            .Include(inscription => inscription.User)
            .Where(inscription => inscription.EventId == id)
            .Select(guest => new
            {
                guest.UserId,
                guest.User.UserName,
                guest.User.IdCard,
                guest.User.Email,
                guest.InscriptionDate,

                assisted = db.Attendances.Any(
                    a => a.EventId == guest.EventId
                    &&
                    a.UserId == guest.UserId
                )
            })
            .ToListAsync();
            return Results.Ok(subscriptions);
        });

        app.MapPost("organizer/events/{eventId:int}/check-list/{userId:int}", async (int eventId,
            int userId, EventOrganizerContext db) =>
        {

            if (await isValidRequest(eventId, userId, db) == false) return Results.NotFound();


            if (!await userHasInscription(eventId, userId, db)) return Results.BadRequest("The user is not registered for the event");

            //Checks if the user is already check-up
            bool alreadyAttended = await db.Attendances.AnyAsync(att =>
                att.EventId == eventId
                &&
                att.UserId == userId
            );
            if (alreadyAttended) return Results.BadRequest("User already mark Attended");

            //Creates a new row in the Attendances table
            Attendance attendace = new Attendance
            {
                EventId = eventId,
                UserId = userId
            };


            DtoAttendance dtoAttendance = new DtoAttendance
            {
                EventId = attendace.EventId,
                UserId = attendace.UserId,
                status = "User has been marked succesfully",
            };

            await db.Attendances.AddAsync(attendace);
            await db.SaveChangesAsync();
            return Results.Ok(dtoAttendance);
        });

        app.MapDelete("organizer/events/{eventId:int}/check-list/{userId:int}", async (int eventId,
            int userId, EventOrganizerContext db) =>
        {
            if (await isValidRequest(eventId, userId, db) == false) return Results.NotFound();

            Attendance? att = await db.Attendances.FirstOrDefaultAsync(
                att =>
                att.EventId == eventId && att.UserId == userId
            );
            if (att == null) return Results.NotFound();
            db.Attendances.Remove(att);
            await db.SaveChangesAsync();
            return Results.NoContent();

        });
    }

    public static async Task<bool> isValidRequest(int eventId, int userId, EventOrganizerContext db)
    {
        //Checks if the event and the user exist
        var ev = await db.Events.FindAsync(eventId);
        var usr = await db.Users.FindAsync(userId);
        if (ev == null || usr == null) return false;
        return true;
    }
    public static async Task<bool> userHasInscription(int eventId, int userId, EventOrganizerContext db)
    {
        //Checks if the user is in the Inscription List for the Actual event
        return await db.Inscriptions.AnyAsync(ins => ins.EventId == eventId && ins.UserId == userId);
    }
}
