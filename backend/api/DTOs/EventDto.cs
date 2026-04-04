namespace api.DTOs;

public class EventSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string Category { get; set; } = string.Empty;
    public string OrganizerEntity { get; set; } = string.Empty;
    public int AvailableEntries { get; set; }
    public bool IsVirtual { get; set; }
    public string? ImageFileEvent { get; set; }
}

public class EventDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string EventDescription { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string OrganizerEntity { get; set; } = string.Empty;
    public string OrganizerName { get; set; } = string.Empty;
    public int AvailableEntries { get; set; }
    public bool IsVirtual { get; set; }
    public string? ImageFileEvent { get; set; }
    public bool IsCanceled { get; set; }
    public string? CancelReason { get; set; }
}

public class EventFilterDto
{
    public string? Category { get; set; }
    public string? Modality { get; set; }
    public string? OrganizerEntity { get; set; }
    public DateOnly? Date { get; set; }
}
