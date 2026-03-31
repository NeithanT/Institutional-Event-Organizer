using api.DTOs;
using api.Models;
using Microsoft.EntityFrameworkCore;


public static class AuthenticationEndpoint
{
    public static void mapAuthenticationEndpoints(WebApplication app)
    {
        app.MapPost("/user/auth", async (DtoAuthentication auth, EventOrganizerContext db) =>
        {
            var user = await db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == auth.Email);

            if (user == null || !user.Active || user.UserPass != auth.Password)
            {
                return Results.Unauthorized();
            }

            return Results.Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                Role = user.Role.RolName,
            });
        });
    }
}