using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Role
{
    public int Id { get; set; }

    public string RolName { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
