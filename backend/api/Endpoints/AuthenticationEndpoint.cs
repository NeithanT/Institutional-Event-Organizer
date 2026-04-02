using System.Runtime.InteropServices;
using api.DTOs;
using api.Models;
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
    //######################################################################################################
    private static async Task<bool> studentRoleExist(EventOrganizerContext db)
    {
        return await db.Roles.AnyAsync(r => r.RolName.ToLower() == "student");
    }
    //######################################################################################################
    private static async void createStudentRole(EventOrganizerContext db)

    {
        Role role = new Role { RolName = "Student" };
        await db.Roles.AddAsync(role);
        await db.SaveChangesAsync();
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

            var name = register.Name?.Trim() ?? string.Empty;
            var lastName = register.LastName?.Trim() ?? string.Empty;
            var email = register.Email?.Trim() ?? string.Empty;
            var password = register.Password?.Trim() ?? string.Empty;
            var idCard = register.IdCard;

            if (dataHasSpaces(name, lastName, email, password, idCard))
                return Results.BadRequest(new { Message = "User data invalid for register." });


            if (!IsAllowedInstitutionalEmail(email))
                return Results.BadRequest(new { Message = "Email must have @estudiantec.cr or @itcr.ac.cr. domain" });


            if (await db.Users.AnyAsync(u => u.Email == email))
                return Results.Conflict(new { Message = "The email is already registered." });

            if (!await studentRoleExist(db)) createStudentRole(db);

            Role? role = await db.Roles.FirstOrDefaultAsync(r => r.RolName.ToLower() == "student");
            if (role == null) return Results.Problem("Student role could not be found in Server");


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