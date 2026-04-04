using System;

namespace api.DTOs;

public class DtoUserInformation
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public int EventsCreated { get; set; }
    public bool Active { get; set; }
    public int? IdCard { get; set; }
}
