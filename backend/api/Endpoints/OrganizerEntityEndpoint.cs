using System;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public static class OrganizerEntityEndpoint
{
    public static void mapOrganizerEntityEndpoints(WebApplication app)
    {
        app.MapGet("/api/organizer/get-entities", async (EventOrganizerContext db) =>
        {
            var entities = await db.OrganizerEntities.Select(e => new
            {
                e.EntityName,
                e.Id
            })
            .OrderBy(e => e.EntityName)
            .ToListAsync();

            return Results.Ok(entities);
        });
    }
}
