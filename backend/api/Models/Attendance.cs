using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Attendance
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int UserId { get; set; }

    public virtual Event Event { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
