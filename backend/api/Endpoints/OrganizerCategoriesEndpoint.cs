using System;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public static class OrganizerCategoriesEndpoint
{
    public static void mapOrganizerCategoriesEndpoint(WebApplication app)
    {
        app.MapGet("/organizer/get-events-categories", async (EventOrganizerContext db) =>
        {
            var categories = await db.Categories
            .Select(c => new
            {
                c.NameCategory,
                c.Id
            })
            .OrderBy(c => c.NameCategory)
            .ToListAsync();
            return Results.Ok(categories);
        });
    }
}
