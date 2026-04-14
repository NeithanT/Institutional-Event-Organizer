using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Event
{
    public int Id { get; set; }

    public DateTime EventDate { get; set; }

    public string Place { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string EventDescription { get; set; } = null!;

    public int CategoryId { get; set; }

    public int OrganizerId { get; set; }

    public int OrganizerEntityId { get; set; }

    public int AvalaibleEntries { get; set; }

    public bool ApprovedState { get; set; }
    public bool IsVirtual { get; set; }
    public bool ReminderSent { get; set; }

    public string? ImageFileEvent { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual CanceledEvent? CanceledEvent { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<Inscription> Inscriptions { get; set; } = new List<Inscription>();

    public virtual ICollection<Mail> Mail { get; set; } = new List<Mail>();

    public virtual User Organizer { get; set; } = null!;

    public virtual OrganizerEntity OrganizerEntity { get; set; } = null!;
}
