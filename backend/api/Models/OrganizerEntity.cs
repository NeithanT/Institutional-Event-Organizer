using System;
using System.Collections.Generic;

namespace api.Models;

public partial class OrganizerEntity
{
    public int Id { get; set; }

    public string EntityName { get; set; } = null!;

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();
}
