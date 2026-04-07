using System.Text.RegularExpressions;
using api.DTOs;
using api.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints;

public static class UserCustomizingEndpoint
{
    public static void mapUserCustomizingEndpoints(this WebApplication app)
    {
        app.MapGet("/user/{id:int}", GetUserAsync);
        app.MapPut("/user/customize/{id:int}", UpdateUserCustomizationAsync);
        app.MapPost("/user/{id:int}/photo", UploadUserPhotoAsync).DisableAntiforgery();
    }

    private static async Task<IResult> GetUserAsync(int id, EventOrganizerContext db)
    {
        if (id <= 0)
            return Results.BadRequest(new { message = "Id de usuario inválido." });

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return Results.NotFound(new { message = "Usuario no encontrado." });

        return Results.Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.IdCard,
            user.Biography,
            user.UrlImageProfile,
            user.PreferredLanguage,
            user.RoleId
        });
    }

    private static async Task<IResult> UpdateUserCustomizationAsync(
        int id,
        DtoUserCustomizing dto,
        EventOrganizerContext db)
    {
        if (id <= 0)
            return Results.BadRequest(new { message = "Id de usuario inválido." });

        if (dto is null)
            return Results.BadRequest(new { message = "Request body is required." });

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return Results.NotFound(new { message = "Usuario no encontrado." });

        bool hasPreferredLanguage = dto.PreferredLanguage is not null;
        bool hasBiography = dto.Biography is not null;
        bool hasNewPassword = dto.NewPassword is not null;

        if (!hasPreferredLanguage && !hasBiography && !hasNewPassword)
            return Results.BadRequest(new { message = "Debe enviar preferredLanguage, biography o newPassword." });

        if (hasNewPassword)
        {
            string currentPassword = dto.CurrentPassword?.Trim() ?? string.Empty;
            string newPassword = dto.NewPassword?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(currentPassword))
                return Results.BadRequest(new { message = "Se requiere la contraseña actual para cambiar la contraseña." });

            if (currentPassword != user.UserPass)
                return Results.BadRequest(new { message = "La contraseña actual no coincide." });

            if (!IsValidPassword(newPassword))
                return Results.BadRequest(new { message = "La nueva contraseña debe tener 1 mayúscula, 1 minúscula, 1 número, 1 caracter especial y al menos 8 caracteres." });

            if (newPassword == currentPassword)
                return Results.BadRequest(new { message = "La nueva contraseña debe ser diferente a la contraseña actual." });

            user.UserPass = newPassword;
        }

        if (hasPreferredLanguage)
        {
            string language = dto.PreferredLanguage?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(language))
                return Results.BadRequest(new { message = "PreferredLanguage no puede estar vacío." });

            user.PreferredLanguage = language;
        }

        if (hasBiography)
        {
            string? biography = dto.Biography?.Trim();
            user.Biography = string.IsNullOrWhiteSpace(biography) ? null : biography;
        }

        try
        {
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error actualizando usuario: {ex.Message}", statusCode: 500);
        }

        return Results.Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.Biography,
            user.UrlImageProfile,
            user.PreferredLanguage,
            user.RoleId
        });
    }

    private static async Task<IResult> UploadUserPhotoAsync(
        int id,
        IFormFile? photo,
        IWebHostEnvironment env,
        EventOrganizerContext db)
    {
        if (id <= 0)
            return Results.BadRequest(new { message = "Id de usuario inválido." });

        if (photo == null || photo.Length == 0)
            return Results.BadRequest(new { message = "Se requiere una imagen." });

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return Results.NotFound(new { message = "Usuario no encontrado." });

        try
        {
            string webRoot = env.WebRootPath
                ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            string profilePhotosFolder = Path.Combine(webRoot, "profile-photos");
            Directory.CreateDirectory(profilePhotosFolder);

            string ext = Path.GetExtension(photo.FileName);
            string uniqueFileName = Guid.NewGuid().ToString() + ext;
            string filePath = Path.Combine(profilePhotosFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(fileStream);
            }

            user.UrlImageProfile = "/profile-photos/" + uniqueFileName;
            await db.SaveChangesAsync();

            return Results.Ok(new { urlImageProfile = user.UrlImageProfile });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error guardando foto: {ex.Message}", statusCode: 500);
        }
    }

    private static bool IsValidPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            return false;

        var regex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$");
        return regex.IsMatch(password);
    }
}
