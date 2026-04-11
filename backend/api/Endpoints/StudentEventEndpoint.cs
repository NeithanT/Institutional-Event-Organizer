using api.DTOs;
using api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace api.Endpoints;

public static class StudentEventEndpoint
{
    public static void mapStudentEventEndpoints(this WebApplication app)
    {
        app.MapGet("/api/events", GetEvents);
        app.MapGet("/events", GetEvents);
        app.MapGet("/api/events/{id:int}", GetEventById);
        app.MapGet("/events/{id:int}", GetEventById);
    }

    private static async Task<IResult> GetEvents(
        IEventService eventService,
        [FromQuery] string? category,
        [FromQuery] string? modality,
        [FromQuery] string? organizerEntity,
        [FromQuery] string? date)
    {
        DateOnly? parsedDate = null;
        if (!string.IsNullOrWhiteSpace(date) &&
            DateOnly.TryParseExact(date, "yyyy-MM-dd", out var d))
            parsedDate = d;

        var filters = new EventFilterDto
        {
            Category = category,
            Modality = modality,
            OrganizerEntity = organizerEntity,
            Date = parsedDate
        };

        var events = await eventService.GetApprovedEventsAsync(filters);
        return Results.Ok(events);
    }

    private static async Task<IResult> GetEventById(
        int id,
        IEventService eventService)
    {
        var ev = await eventService.GetEventByIdAsync(id);
        return ev is null
            ? Results.NotFound(new { message = $"Evento con id {id} no encontrado." })
            : Results.Ok(ev);
    }
}
