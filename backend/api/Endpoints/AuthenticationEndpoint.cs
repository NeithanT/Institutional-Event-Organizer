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

        app.MapPost("/user/register", async (DtoRegisterUser register, EventOrganizerContext db) =>
        {
            if (register == null)
            {
                return Results.BadRequest(new { Message = "Payload is required." });
            }

            var name = register.Name?.Trim() ?? string.Empty;
            var lastName = register.LastName?.Trim() ?? string.Empty;
            var email = register.Email?.Trim() ?? string.Empty;
            var password = register.Password?.Trim() ?? string.Empty;
            var idCard = register.IdCard;

            if (string.IsNullOrWhiteSpace(name) ||
                string.IsNullOrWhiteSpace(lastName) ||
                string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(password) ||
                idCard < 1950000000 || idCard > 2050000000)
            {
                return Results.BadRequest(new { Message = "Datos de registro inválidos." });
            }

            var exists = await db.Users.AnyAsync(u => u.Email == email);
            if (exists)
            {
                return Results.Conflict(new { Message = "El correo ya está registrado." });
            }

            var role = await db.Roles.FirstOrDefaultAsync(r =>
                r.RolName.ToLower() == "student" || r.RolName.ToLower() == "user");

            if (role == null)
            {
                // No Student/User role exists yet; create a default Student role for registration.
                role = new Role { RolName = "Student" };
                db.Roles.Add(role);
                await db.SaveChangesAsync();
            }

            var user = new User
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
                db.Users.Add(user);
                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log exception locally if you have logging in place
                return Results.Problem($"Error al guardar usuario: {ex.Message}", statusCode: 500);
            }

            return Results.Created($"/user/{user.Id}", new
            {
                user.Id,
                user.UserName,
                user.Email,
                Role = role.RolName,
            });
        });
    }
}