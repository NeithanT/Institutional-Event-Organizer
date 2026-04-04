using api.DTOs;
using api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace api.Endpoints;

public static class StudentAnnouncementEndpoint
{
    public static void mapStudentAnnouncementEndpoints(this WebApplication app)
    {
        app.MapGet("/api/anuncios", GetAnnouncements);
        app.MapGet("/api/anuncios/{id:int}", GetAnnouncementById);
    }

    private static async Task<IResult> GetAnnouncements(
        IAnnouncementService announcementService,
        [FromQuery] string? date)
    {
        DateOnly? parsedDate = null;
        if (!string.IsNullOrWhiteSpace(date) &&
            DateOnly.TryParseExact(date, "yyyy-MM-dd", out var d))
            parsedDate = d;

        var filters = new AnnouncementFilterDto { Date = parsedDate };
        var announcements = await announcementService.GetAnnouncementsAsync(filters);
        return Results.Ok(announcements);
    }

    private static async Task<IResult> GetAnnouncementById(
        int id,
        IAnnouncementService announcementService)
    {
        var announcement = await announcementService.GetAnnouncementByIdAsync(id);
        return announcement is null
            ? Results.NotFound(new { message = $"Anuncio con id {id} no encontrado." })
            : Results.Ok(announcement);
    }
}
