using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Category
{
    public int Id { get; set; }

    public string NameCategory { get; set; } = null!;

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();
}
