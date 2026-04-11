namespace api.DTOs;
public record RejectEventDto
{
    public string Reason { get; init; } = string.Empty;
}