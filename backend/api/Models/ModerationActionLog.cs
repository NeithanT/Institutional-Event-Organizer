using System;

namespace api.Models;

public partial class ModerationActionLog
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int? ModeratorUserId { get; set; }

    public string Action { get; set; } = null!;

    public string? Reason { get; set; }

    public DateTime ActionDate { get; set; }

    public virtual Event Event { get; set; } = null!;

    public virtual User? ModeratorUser { get; set; }
}
