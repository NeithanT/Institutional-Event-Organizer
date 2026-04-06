namespace api.DTOs;

public record class DtoUserCustomizing
{
    public string? PreferredLanguage { get; set; }
    public string? Biography { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
}
