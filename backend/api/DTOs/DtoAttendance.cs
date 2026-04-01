namespace api.DTOs;

public record class DtoAttendance
{
    public int EventId { get; set; }

    public int UserId { get; set; }
    public string status { get; set; } = string.Empty;
}
