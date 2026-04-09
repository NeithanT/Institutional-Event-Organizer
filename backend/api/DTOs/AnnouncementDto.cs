namespace api.DTOs;

public class AnnouncementSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string About { get; set; } = string.Empty;
    public string WriterName { get; set; } = string.Empty;
    public string? EventTitle { get; set; }
    public DateOnly PublicationDate { get; set; }
}

public class AnnouncementDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string About { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string WriterName { get; set; } = string.Empty;
    public string? EventTitle { get; set; }
}

public class AnnouncementFilterDto
{
    public DateOnly? Date { get; set; }
}
