using System;

namespace api.Models;

public partial class EventReminderLog
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int UserId { get; set; }

    public string ReminderType { get; set; } = null!;

    public DateTime SentAt { get; set; }

    public virtual Event Event { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
