using System.Net;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using api.DTOs;
using api.Interfaces;
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
        // an example of a password that matches this
        // is "Password1!Password1!" (at least 8 characters, contains uppercase, lowercase, number and special character)
        return regex.IsMatch(password);
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
        app.MapPost("/api/user/auth", async (DtoAuthentication auth, EventOrganizerContext db, ILoggerFactory loggerFactory) =>
        {

            var logger = loggerFactory.CreateLogger("AuthenticationEndpoint");

            var email = auth.Email?.Trim() ?? string.Empty;
            var password = auth.Password?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return Results.BadRequest(new { Message = "Se requiere email y contraseña." });

            if (!IsAllowedInstitutionalEmail(email))
                return Results.BadRequest(new { Message = "Email debe ser @estudiantec.cr o @itcr.ac.cr." });

            try
            {
                User? user = await db.Users
                    .FirstOrDefaultAsync(u => u.Email == email);

                if (user == null || user.UserPass != password)
                    return Results.Json(new { message = "Correo o contraseña incorrectos." }, statusCode: 401);

                if (!user.Active)
                    return Results.Json(new { message = "El usuario no está activo." }, statusCode: 401);

                var role = await db.Roles.FindAsync(user.RoleId);
                if (role == null) return Results.BadRequest(new { message = "No se encontro el Rol" });


                return Results.Ok(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.Biography,
                    user.UrlImageProfile,
                    user.PreferredLanguage,
                    user.RoleId,
                    RoleName = role.RolName
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during authentication for email {Email}", email);
                return Results.Problem(detail: "Error durante autenticación", statusCode: 500);
            }
        });

        //######################################################################################################
        app.MapPost("/api/user/register", async (DtoRegisterUser register, EventOrganizerContext db, IEmailService mailService) =>
        {

            string name = register.Name?.Trim() ?? string.Empty;
            string lastName = register.LastName?.Trim() ?? string.Empty;
            string email = register.Email?.Trim() ?? string.Empty;
            string password = register.Password?.Trim() ?? string.Empty;
            int idCard = register.IdCard;

            switch (await validRegisterData(db, name, lastName, email, password, idCard))
            {
                case -1:
                    return Results.BadRequest(new { message = "Carne inválido o faltan datos" });
                case -2:
                    return Results.BadRequest(new { message = "La contraseña debe tener 1 Mayúscula, 1 minúscula, 1 número y un 1 caracter especial y al menos 8 caracteres" });
                case -3:
                    return Results.BadRequest(new { message = "Email debe ser @estudiantec.cr o @itcr.ac.cr." });
                case -4:
                    return Results.Conflict(new { message = "El email ya está registrado." });
            }

            Role? role = await db.Roles.FirstOrDefaultAsync(r => r.RolName.ToLower() == "student");
            if (role == null) return Results.Problem("No se encontro el Rol de estudiante", statusCode: 500);

            string? biography = register.Biography?.Trim();
            string? urlImageProfile = register.UrlImageProfile?.Trim();
            string? preferredLanguage = register.PreferredLanguage?.Trim();

            User user = new User
            {
                UserName = $"{name} {lastName}".Trim(),
                Email = email,
                UserPass = password,
                Biography = string.IsNullOrWhiteSpace(biography) ? null : biography,
                UrlImageProfile = string.IsNullOrWhiteSpace(urlImageProfile) ? null : urlImageProfile,
                PreferredLanguage = string.IsNullOrWhiteSpace(preferredLanguage) ? null : preferredLanguage,
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
                return Results.Problem($"Error agregando al usuario: {ex.Message}", statusCode: 500);
            }

            try
            {
                await mailService.SendEmailAsync(
                    user.Email,
                    "Bienvenido al Sistema de Gestión de Eventos — TEC",
                    $"""
                    Hola {user.UserName},

                    ¡Bienvenido al Sistema de Gestión de Eventos del Instituto Tecnológico de Costa Rica!

                    Tu cuenta ha sido creada exitosamente. Aquí está el resumen de tus datos:

                    - Nombre: {user.UserName}
                    - Correo: {user.Email}
                    - Cédula: {user.IdCard}

                    
                    Política de Uso — Sistema de Gestión de Eventos
                    

                    Al registrarse en esta plataforma, usted acepta los siguientes términos:

                    1. Uso permitido: La plataforma es de uso exclusivo para la comunidad del Instituto Tecnológico de Costa Rica (estudiantes, docentes y personal administrativo).

                    2. Registro: Usted es responsable de mantener la confidencialidad de su contraseña y de toda actividad realizada desde su cuenta.

                    3. Inscripciones: Al inscribirse a un evento, se compromete a asistir. Si no puede asistir, deberá cancelar su inscripción con anticipación para liberar el cupo.

                    4. Conducta: Se espera un comportamiento respetuoso en todos los eventos. El incumplimiento puede resultar en la suspensión de su cuenta.

                    5. Datos personales: La información registrada será utilizada únicamente para la gestión de eventos institucionales y comunicaciones relacionadas.

                    6. Organizadores: Los organizadores son responsables de la veracidad de la información publicada en sus eventos.

                    7. Modificaciones: El TEC se reserva el derecho de modificar estas políticas. Los cambios serán notificados por correo electrónico.

                    
                    Sistema de Gestión de Eventos — TEC
                    """
                );
            }
            catch { /* El correo es best-effort; no cancela el registro */ }

            return Results.Created($"/api/user/{user.Id}", new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.Biography,
                user.UrlImageProfile,
                user.PreferredLanguage,
                user.RoleId,
            });
        });
    }
}