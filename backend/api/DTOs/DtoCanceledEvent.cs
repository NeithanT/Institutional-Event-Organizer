namespace api.DTOs;

public class DtoCanceledEvent
{
    public string Reason { get; set; } = string.Empty;
    public int OrganizerId { get; set; }
}