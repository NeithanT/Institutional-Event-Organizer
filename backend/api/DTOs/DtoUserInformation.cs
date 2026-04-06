using System;

namespace api.DTOs;

public class DtoUserInformation
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? Biography { get; set; }
    public string? UrlImageProfile { get; set; }
    public string? PreferredLanguage { get; set; }
    public int EventsCreated { get; set; }
    public bool Active { get; set; }
    public int? IdCard { get; set; }
}
