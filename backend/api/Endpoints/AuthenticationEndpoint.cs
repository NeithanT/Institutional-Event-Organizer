using System.Net;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using api.DTOs;
using api.Models;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.EntityFrameworkCore;
using YamlDotNet.Serialization;


public static class AuthenticationEndpoint
{
    private static bool IsAllowedInstitutionalEmail(string email)
    {
        return email.EndsWith("@estudiantec.cr", StringComparison.OrdinalIgnoreCase)
            || email.EndsWith("@itcr.ac.cr", StringComparison.OrdinalIgnoreCase);
    }
    //######################################################################################################
    private static bool dataHasSpaces(string name, string lastName,
                                                string email, string password, int idCard)
    {
        return string.IsNullOrWhiteSpace(name)
        || string.IsNullOrWhiteSpace(lastName)
        || string.IsNullOrWhiteSpace(email)
        || string.IsNullOrWhiteSpace(password)
        || idCard < 1950000000 || idCard > 2050000000;
    }

    private static bool isValidPassword(string password)
    {
        var regex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$");
        return regex.IsMatch(password);
    }

    //######################################################################################################
    private static async Task<bool> studentRoleExist(EventOrganizerContext db)
    {
        return await db.Roles.AnyAsync(r => r.RolName == "Student");
    }
    //######################################################################################################
    private static async void createStudentRole(EventOrganizerContext db)

    {
        Role role = new Role { RolName = "Student" };
        await db.Roles.AddAsync(role);
        await db.SaveChangesAsync();
    }
    //######################################################################################################
    /*
        //Every value except 0 indicates an error 
        //0: valid data
        //-1: Data has spaces
        //-2: Password is not valid (Doesnt match required specifications)
        //-3: Email is not estudiantec.cr or itcr.ac.cr domain
        //-4: User is already registered
        //Also validates is Student role exists in DB - If not it creates it    
    */
    private static async Task<int> validRegisterData(
        EventOrganizerContext db, string name, string lastName, string email, string password, int idCard)
    {

        if (dataHasSpaces(name, lastName, email, password, idCard)) return -1;


        if (!isValidPassword(password)) return -2;

        if (!IsAllowedInstitutionalEmail(email)) return -3;


        if (await db.Users.AnyAsync(u => u.Email == email)) return -4;

        if (!await studentRoleExist(db)) createStudentRole(db);
        return 0;
    }

    //######################################################################################################
    public static void mapAuthenticationEndpoints(WebApplication app)
    {
        app.MapPost("/user/auth", async (DtoAuthentication auth, EventOrganizerContext db) =>
        {

            var email = auth.Email?.Trim() ?? string.Empty;
            var password = auth.Password?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return Results.BadRequest(new { Message = "Email and password are required." });

            if (!IsAllowedInstitutionalEmail(email))
                return Results.BadRequest(new { Message = "Email must have @estudiantec.cr o @itcr.ac.cr. domain" });

            try
            {
                User? user = await db.Users
                    .FirstOrDefaultAsync(u => u.Email == email);

                if (user == null || !user.Active || user.UserPass != password)
                    return Results.Unauthorized();

                var role = await db.Roles.FindAsync(user.RoleId);
                if (role == null) return Results.BadRequest("Role not identified by server");


                return Results.Ok(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.RoleId,
                });
            }
            catch (Exception)
            {
                return Results.Problem(detail: "Error during authentication.", statusCode: 500);
            }
        });
        //######################################################################################################
        app.MapPost("/student/register", async (DtoRegisterUser register, EventOrganizerContext db) =>
        {

            string name = register.Name?.Trim() ?? string.Empty;
            string lastName = register.LastName?.Trim() ?? string.Empty;
            string email = register.Email?.Trim() ?? string.Empty;
            string password = register.Password?.Trim() ?? string.Empty;
            int idCard = register.IdCard;

            switch (await validRegisterData(db, name, lastName, email, password, idCard))
            {
                case -1:
                    return Results.BadRequest("User data invalid for register." );
                case -2:
                    return Results.BadRequest("Password must have 1 Uppercase, 1 Lowercase, 1 Number and 1 Special Character and at least 8 characters");
                case -3:
                    return Results.BadRequest("Email must have @estudiantec.cr or @itcr.ac.cr. domain");
                case -4:
                    return Results.Conflict("The email is already registered.");
            }

            Role? role = await db.Roles.FirstOrDefaultAsync(r => r.RolName.ToLower() == "student");
            if (role == null) return Results.Problem("Student role not found in Server");

            User user = new User
            {
                UserName = $"{name} {lastName}".Trim(),
                Email = email,
                UserPass = password,
                Active = true,
                RoleId = role.Id,
                IdCard = idCard,
            };

            try
            {
                await db.Users.AddAsync(user);
                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log exception locally if you have logging in place
                return Results.Problem($"Error while saving the user: {ex.Message}", statusCode: 500);
            }

            return Results.Created($"/student/{user.Id}", new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.RoleId,
            });
        });
    }
}