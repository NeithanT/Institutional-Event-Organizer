using System;
using api.DTOs;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public static class AdministratorUtilitiesEndpoint
{

    public static void mapAdministratorUtilitiesEndpoint(WebApplication app)
    {

        //##############################################################################################################
        app.MapGet("/administrator/search-user-by-name/{name}", async (string name, EventOrganizerContext db) =>
        {

            var user = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserName == name);

            if (user == null)
                return Results.NotFound("User not found");


            int quantityEventsCreated = await db.Events.Where(e => e.OrganizerId == user.Id).CountAsync();

            DtoUserInformation userData = new DtoUserInformation
            {
                Email = user.Email,
                Role = user.Role.RolName,
                UserName = user.UserName,
                EventsCreated = quantityEventsCreated,
                Active = user.Active,
                IdCard = user.IdCard
            };

            return Results.Ok(userData);



        });
        //##############################################################################################################
        app.MapGet("/administrator/search-user-by-idcart/{idCard:int}", async (int idCard, EventOrganizerContext db) =>
        {

            var user = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.IdCard == idCard);

            if (user == null)
                return Results.NotFound("User not found");


            int quantityEventsCreated = await db.Events.Where(e => e.OrganizerId == user.Id).CountAsync();


            DtoUserInformation userData = new DtoUserInformation
            {
                Email = user.Email,
                Role = user.Role.RolName,
                UserName = user.UserName,
                EventsCreated = quantityEventsCreated,
                Active = user.Active,
                IdCard = user.IdCard
            };

            return Results.Ok(userData);
        });


        //##############################################################################################################
        app.MapPost("/administrator/change-rol/to-organizer/{id:int}", async (int id, EventOrganizerContext db) =>
        {

            var user = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return Results.NotFound("User not found");

            if (!user.Active)
                return Results.BadRequest("User is not active");

            var organizerRol = await db.Roles.FirstOrDefaultAsync(r => r.RolName == "Organizer");

            if (organizerRol == null)
                return Results.InternalServerError("Organizer rol does not exist in server");

            if (user.Role.RolName == organizerRol.RolName)
                return Results.BadRequest("User is already an organizer");

            user.RoleId = organizerRol.Id;

            await db.SaveChangesAsync();

            return Results.Ok("The user has been promoted to an organizer");

        });

        //##############################################################################################################
        app.MapPost("/administrator/change-rol/to-student/{id:int}", async (int id, EventOrganizerContext db) =>
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


    }

}
