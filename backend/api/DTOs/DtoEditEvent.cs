using System;

namespace api.DTOs;

public class DtoEditEvent
{
    public int OrganizerId { get; set; }
    public int IdEvent { get; set; }
    public string Title { get; set; } = string.Empty;
    public string EventDescription { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public bool IsVirtual { get; set; }
    public DateTime EventDate { get; set; }
}
