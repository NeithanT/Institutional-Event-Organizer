using System;
using System.Collections.Generic;

namespace api.Models;

public partial class User
{
    public int Id { get; set; }

    public string UserPass { get; set; } = null!;

    public string UserName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public bool Active { get; set; }

    public int RoleId { get; set; }

    public int? IdCard { get; set; }

    public virtual ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();

    public virtual ICollection<Inscription> Inscriptions { get; set; } = new List<Inscription>();

    public virtual ICollection<Mail> Mail { get; set; } = new List<Mail>();

    public virtual Role Role { get; set; } = null!;
}
