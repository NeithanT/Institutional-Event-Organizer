using api.DTOs;
using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class InscriptionService : IInscriptionService
{
    private readonly EventOrganizerContext _db;
    private readonly IEmailService _mailService;

    public InscriptionService(EventOrganizerContext db, IEmailService mailService)
    {
        _db = db;
        _mailService = mailService;
    }

    public async Task<IEnumerable<InscriptionSummaryDto>> GetUserInscriptionsAsync(int userId)
    {
        var now = DateTime.Now;

        return await _db.Inscriptions
            .Where(i => i.UserId == userId)
            .Include(i => i.Event)
                .ThenInclude(e => e.Category)
            .Include(i => i.Event)
                .ThenInclude(e => e.OrganizerEntity)
            .Select(i => new InscriptionSummaryDto
            {
                EventId = i.EventId,
                Title = i.Event.Title,
                Place = i.Event.Place,
                EventDate = i.Event.EventDate,
                Category = i.Event.Category.NameCategory,
                OrganizerEntity = i.Event.OrganizerEntity.EntityName,
                IsVirtual = i.Event.IsVirtual,
                ImageFileEvent = i.Event.ImageFileEvent,
                IsPast = i.Event.EventDate < now
            })
            .OrderBy(i => i.IsPast)
            .ThenBy(i => i.EventDate)
            .ToListAsync();
    }

    public async Task<IResult> CreateInscriptionAsync(InscriptionCreateDto dto)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists)
            return Results.NotFound(new { message = "Usuario no encontrado." });

        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == dto.EventId && e.ApprovedState);
        if (ev is null)
            return Results.NotFound(new { message = "Evento no encontrado." });

        if (ev.AvalaibleEntries <= 0)
            return Results.BadRequest(new { message = "No hay cupos disponibles." });

        var alreadyInscribed = await _db.Inscriptions
            .AnyAsync(i => i.EventId == dto.EventId && i.UserId == dto.UserId);
        if (alreadyInscribed)
            return Results.Conflict(new { message = "Ya estás inscrito en este evento." });

        var inscription = new Inscription
        {
            EventId = dto.EventId,
            UserId = dto.UserId
        };

        ev.AvalaibleEntries -= 1;

        _db.Inscriptions.Add(inscription);
        await _db.SaveChangesAsync();

        try
        {
            var user = await _db.Users.FindAsync(dto.UserId);
            if (user is not null)
            {
                var eventDate = ev.EventDate.ToString("dd 'de' MMMM 'de' yyyy, HH:mm", new System.Globalization.CultureInfo("es-CR"));
                await _mailService.SendEmailAsync(
                    user.Email,
                    $"Confirmación de inscripción: {ev.Title}",
                    $"Hola {user.UserName},\n\n" +
                    $"Te has inscrito exitosamente al evento \"{ev.Title}\".\n\n" +
                    $"Fecha: {eventDate}\n" +
                    $"Lugar: {ev.Place}\n\n" +
                    $"¡Te esperamos!"
                );
            }
        }
        catch { /* El email es best-effort; no cancela la inscripción */ }

        return Results.Created($"/api/inscripciones/{dto.EventId}", new { message = "Inscripción exitosa." });
    }

    public async Task<IResult> DeleteInscriptionAsync(int eventId, int userId)
    {
        var inscription = await _db.Inscriptions
            .FirstOrDefaultAsync(i => i.EventId == eventId && i.UserId == userId);

        if (inscription is null)
            return Results.NotFound(new { message = "Inscripción no encontrada." });

        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == eventId);
        if (ev is not null)
            ev.AvalaibleEntries += 1;

        _db.Inscriptions.Remove(inscription);
        await _db.SaveChangesAsync();

        try
        {
            var user = await _db.Users.FindAsync(userId);
            if (user is not null && ev is not null)
            {
                await _mailService.SendEmailAsync(
                    user.Email,
                    $"Desinscripción confirmada: {ev.Title}",
                    $"Hola {user.UserName},\n\n" +
                    $"Te has desinscrito exitosamente del evento \"{ev.Title}\".\n\n" +
                    $"Si fue un error, puedes volver a inscribirte mientras haya cupos disponibles."
                );
            }
        }
        catch { /* El email es best-effort; no cancela la desinscripción */ }

        return Results.Ok(new { message = "Desinscripción exitosa." });
    }
}
