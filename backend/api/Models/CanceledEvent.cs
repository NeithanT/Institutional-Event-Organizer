using System;
using System.Collections.Generic;

namespace api.Models;

public partial class CanceledEvent
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public string Reason { get; set; } = null!;

    public virtual Event Event { get; set; } = null!;
}
