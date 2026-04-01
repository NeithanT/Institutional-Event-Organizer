using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Announcement
{
    public int Id { get; set; }

    public int WriterId { get; set; }

    public string Title { get; set; } = null!;

    public string About { get; set; } = null!;

    public string Body { get; set; } = null!;

    public virtual User Writer { get; set; } = null!;
}
