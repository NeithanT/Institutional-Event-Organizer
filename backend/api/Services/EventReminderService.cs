using api.Models;
using api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class EventReminderService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EventReminderService> _logger;

    public EventReminderService(IServiceScopeFactory scopeFactory, ILogger<EventReminderService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SendRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al procesar recordatorios de eventos.");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task SendRemindersAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<EventOrganizerContext>();
        var mailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var now = DateTime.Now;
        var window = now.AddHours(24);

        var events = await db.Events
            .Include(e => e.Inscriptions)
                .ThenInclude(i => i.User)
            .Where(e => e.ApprovedState
                     && !e.ReminderSent
                     && e.EventDate >= now
                     && e.EventDate <= window
                     && !db.CanceledEvents.Any(ce => ce.EventId == e.Id))
            .ToListAsync();

        foreach (var ev in events)
        {
            var culture = new System.Globalization.CultureInfo("es-CR");
            var eventDate = ev.EventDate.ToString("dd 'de' MMMM 'de' yyyy, HH:mm", culture);

            foreach (var inscription in ev.Inscriptions)
            {
                try
                {
                    await mailService.SendEmailAsync(
                        inscription.User.Email,
                        $"Recordatorio: \"{ev.Title}\" es mañana",
                        $"Hola {inscription.User.UserName},\n\n" +
                        $"Te recordamos que el evento \"{ev.Title}\" al que estás inscrito ocurrirá pronto.\n\n" +
                        $"Fecha: {eventDate}\n" +
                        $"Lugar: {ev.Place}\n\n" +
                        $"¡Te esperamos!"
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "No se pudo enviar recordatorio a {Email} para el evento {EventId}.",
                        inscription.User.Email, ev.Id);
                }
            }

            ev.ReminderSent = true;
        }

        if (events.Count > 0)
        {
            await db.SaveChangesAsync();
            _logger.LogInformation("Recordatorios enviados para {Count} evento(s).", events.Count);
        }
    }
}
