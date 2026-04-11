using System;
using api.DTOs;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace api.Endpoints;

public static class AdministratorUtilitiesEndpoint
{

    public static void mapAdministratorUtilitiesEndpoint(WebApplication app)
    {

        //##############################################################################################################
        app.MapGet("/api/administrator/search-user-by-name/{name}", async (string name, EventOrganizerContext db) =>
        {

            var user = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserName == name);

            if (user == null)
                return Results.NotFound("User not found");


            int quantityEventsCreated = await db.Events.Where(e => e.OrganizerId == user.Id).CountAsync();

            DtoUserInformation userData = new DtoUserInformation
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role.RolName,
                UserName = user.UserName,
                Biography = user.Biography,
                UrlImageProfile = user.UrlImageProfile,
                PreferredLanguage = user.PreferredLanguage,
                EventsCreated = quantityEventsCreated,
                Active = user.Active,
                IdCard = user.IdCard
            };

            return Results.Ok(userData);



        });
        //##############################################################################################################
        app.MapGet("/api/administrator/search-user-by-idcard/{idCard:int}", async (int idCard, EventOrganizerContext db) =>
        {

            var user = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.IdCard == idCard);

            if (user == null)
                return Results.NotFound("User not found");


            int quantityEventsCreated = await db.Events.Where(e => e.OrganizerId == user.Id).CountAsync();


            DtoUserInformation userData = new DtoUserInformation
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role.RolName,
                UserName = user.UserName,
                Biography = user.Biography,
                UrlImageProfile = user.UrlImageProfile,
                PreferredLanguage = user.PreferredLanguage,
                EventsCreated = quantityEventsCreated,
                Active = user.Active,
                IdCard = user.IdCard
            };

            return Results.Ok(userData);
        });


        //##############################################################################################################
        app.MapGet("/api/administrator/users/grouped", async (EventOrganizerContext db) =>
        {
            var organizerRole = await db.Roles.FirstOrDefaultAsync(r => r.RolName == "Organizer");
            if (organizerRole == null)
                return Results.Problem("Organizer role is not configured on the server", statusCode: 500);

            var organizers = await db.Users
                .Include(u => u.Role)
                .Where(u => u.RoleId == organizerRole.Id)
                .OrderBy(u => u.UserName)
                .Select(user => new DtoUserInformation
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = user.Role.RolName,
                    UserName = user.UserName,
                    Biography = user.Biography,
                    UrlImageProfile = user.UrlImageProfile,
                    PreferredLanguage = user.PreferredLanguage,
                    EventsCreated = db.Events.Count(e => e.OrganizerId == user.Id),
                    Active = user.Active,
                    IdCard = user.IdCard
                })
                .ToListAsync();

            var students = await db.Users
                .Include(u => u.Role)
                .Where(u => u.RoleId != organizerRole.Id)
                .OrderBy(u => u.UserName)
                .Select(user => new DtoUserInformation
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = user.Role.RolName,
                    UserName = user.UserName,
                    Biography = user.Biography,
                    UrlImageProfile = user.UrlImageProfile,
                    PreferredLanguage = user.PreferredLanguage,
                    EventsCreated = db.Events.Count(e => e.OrganizerId == user.Id),
                    Active = user.Active,
                    IdCard = user.IdCard
                })
                .ToListAsync();

            return Results.Ok(new { Organizers = organizers, Students = students });
        });

        //##############################################################################################################
        app.MapPost("/api/administrator/change-rol/to-organizer/{id:int}", async (int id, EventOrganizerContext db) =>
        {

            var user = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return Results.NotFound("User not found");

            if (!user.Active)
                return Results.BadRequest("User is not active");

            var organizerRol = await db.Roles.FirstOrDefaultAsync(r => r.RolName == "Organizer");

            if (organizerRol == null)
                return Results.Problem("Organizer rol does not exist in server", statusCode: 500);

            if (user.Role.RolName == organizerRol.RolName)
                return Results.BadRequest("User is already an organizer");

            if (string.Equals(user.Role.RolName, "Admin", StringComparison.OrdinalIgnoreCase))
                return Results.BadRequest("Admin users cannot be promoted to organizer");

            user.RoleId = organizerRol.Id;

            await db.SaveChangesAsync();

            return Results.Ok("The user has been promoted to an organizer");

        });

        //##############################################################################################################
        app.MapPost("/api/administrator/change-rol/to-student/{id:int}", async (int id, EventOrganizerContext db) =>
        {

            var user = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return Results.NotFound("User not found");

            if (!user.Active)
                return Results.BadRequest("User is not active");

            var studentRol = await db.Roles.FirstOrDefaultAsync(r => r.RolName == "Student");

            if (studentRol == null)
                return Results.InternalServerError("Student rol does not exist in server");

            if (user.Role.RolName == studentRol.RolName)
                return Results.BadRequest("User is already a student");

            user.RoleId = studentRol.Id;

            await db.SaveChangesAsync();

            return Results.Ok("The user has been downgraded to a student");

        });

        //##############################################################################################################
        app.MapPost("/api/administrator/set-active/{id:int}", async (int id, EventOrganizerContext db) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return Results.NotFound("User not found");

            if (user.Active)
                return Results.BadRequest("User is already active");

            user.Active = true;
            await db.SaveChangesAsync();

            return Results.Ok("The user has been activated");
        });

        //##############################################################################################################
        app.MapPost("/api/administrator/set-inactive/{id:int}", async (int id, EventOrganizerContext db) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return Results.NotFound("User not found");

            if (!user.Active)
                return Results.BadRequest("User is already inactive");

            user.Active = false;
            await db.SaveChangesAsync();

            return Results.Ok("The user has been deactivated");
        });

        //##############################################################################################################
        app.MapPost("/api/administrator/generate-report", async (DtoReport dates, EventOrganizerContext db) =>
        {
            var reportData = await db.Categories
                .Select(c => new
                {
                    Category = c.NameCategory,

                    FilteredEvents = c.Events.Where(e => e.EventDate >= dates.DateStart && e.EventDate <= dates.DateEnd)
                })
                .Where(x => x.FilteredEvents.Any()) // Solo categorías con eventos
                .Select(x => new
                {
                    Category = x.Category,
                    EventsCount = x.FilteredEvents.Count(),
                    TotalAttendees = x.FilteredEvents.SelectMany(e => e.Attendances).Count(),
                    Average = x.FilteredEvents.Any()
                              ? (double)x.FilteredEvents.SelectMany(e => e.Attendances).Count() / x.FilteredEvents.Count()
                              : 0
                })
                .OrderByDescending(x => x.TotalAttendees)
                .ToListAsync();

            if (!reportData.Any()) return Results.BadRequest("No hay datos en este rango.");


            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(1, Unit.Centimetre);
                    page.Header().Text("Reporte de Asistencia por Categoría").FontSize(22).SemiBold().FontColor("#2563eb");

                    page.Content().PaddingVertical(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3); // Categoría
                            columns.RelativeColumn(1); // Eventos
                            columns.RelativeColumn(2); // Total
                            columns.RelativeColumn(2); // Promedio
                        });

                        table.Header(header =>
                        {
                            static IContainer Style(IContainer c) => c.BorderBottom(1).Padding(5);
                            header.Cell().Element(Style).Text("Categoría").SemiBold();
                            header.Cell().Element(Style).AlignRight().Text("Eventos").SemiBold();
                            header.Cell().Element(Style).AlignRight().Text("Total").SemiBold();
                            header.Cell().Element(Style).AlignRight().Text("Promedio").SemiBold();
                        });

                        foreach (var item in reportData)
                        {
                            static IContainer CellStyle(IContainer c) => c.BorderBottom(1).BorderColor("#EEE").Padding(5);

                            table.Cell().Element(CellStyle).Text(item.Category);
                            table.Cell().Element(CellStyle).AlignRight().Text(item.EventsCount.ToString());
                            table.Cell().Element(CellStyle).AlignRight().Text(item.TotalAttendees.ToString("N0"));
                            table.Cell().Element(CellStyle).AlignRight().Text(item.Average.ToString("F2"));
                        }
                    });
                });
            });

            return Results.File(document.GeneratePdf(), "application/pdf", "ReporteFinal.pdf");
        });
    }
}
