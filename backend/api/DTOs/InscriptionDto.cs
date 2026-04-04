namespace api.DTOs;

public class InscriptionSummaryDto
{
    public int EventId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string Category { get; set; } = string.Empty;
    public string OrganizerEntity { get; set; } = string.Empty;
    public bool IsVirtual { get; set; }
    public string? ImageFileEvent { get; set; }
    public bool IsPast { get; set; }
}

public class InscriptionCreateDto
{
    public int EventId { get; set; }
    public int UserId { get; set; }
}
