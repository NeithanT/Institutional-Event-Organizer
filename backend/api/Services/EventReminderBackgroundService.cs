using api.Interfaces;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class EventReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EventReminderBackgroundService> _logger;

    public EventReminderBackgroundService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<EventReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var checkIntervalMinutes = _configuration.GetValue<int?>("ReminderSettings:CheckIntervalMinutes") ?? 15;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SendUpcomingEventRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while sending automatic event reminders");
            }

            await Task.Delay(TimeSpan.FromMinutes(checkIntervalMinutes), stoppingToken);
        }
    }

    private async Task SendUpcomingEventRemindersAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<EventOrganizerContext>();
        var mailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var hoursBeforeEvent = _configuration.GetValue<int?>("ReminderSettings:HoursBeforeEvent") ?? 24;
        var now = DateTime.Now;
        var maxDate = now.AddHours(hoursBeforeEvent);

        const string reminderType = "UPCOMING_EVENT";

        var upcomingEvents = await db.Events
            .Where(e => e.ApprovedState)
            .Where(e => !db.CanceledEvents.Any(c => c.EventId == e.Id))
            .Where(e => e.EventDate > now && e.EventDate <= maxDate)
            .Select(e => new
            {
                Event = e,
                EnrolledUsers = e.Inscriptions.Where(i => i.User.Active).Select(i => i.User).ToList()
            })
            .ToListAsync(stoppingToken);

        foreach (var item in upcomingEvents)
        {
            var ev = item.Event;
            var eventDate = ev.EventDate.ToString("dd 'de' MMMM 'de' yyyy, HH:mm", new System.Globalization.CultureInfo("es-CR"));

            foreach (var user in item.EnrolledUsers)
            {
                var alreadySent = await db.EventReminderLogs.AnyAsync(
                    r => r.EventId == ev.Id && r.UserId == user.Id && r.ReminderType == reminderType,
                    stoppingToken);

                if (alreadySent)
                    continue;

                try
                {
                    await mailService.SendEmailAsync(
                        user.Email,
                        $"Recordatorio de evento: {ev.Title}",
                        $"<p>Hola {user.UserName},</p>" +
                        $"<p>Este es un recordatorio de tu evento inscrito <strong>{ev.Title}</strong>.</p>" +
                        $"<ul><li>Fecha y hora: {eventDate}</li><li>Lugar: {ev.Place}</li></ul>" +
                        "<p>Nos vemos pronto.</p>"
                    );

                    db.EventReminderLogs.Add(new EventReminderLog
                    {
                        EventId = ev.Id,
                        UserId = user.Id,
                        ReminderType = reminderType,
                        SentAt = now
                    });

                    await db.SaveChangesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed reminder email for EventId {EventId}, UserId {UserId}", ev.Id, user.Id);
                }
            }
        }
    }
}
