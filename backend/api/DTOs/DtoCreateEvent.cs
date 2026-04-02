namespace api.DTOs;

public class DtoCreateEvent
{

    public string Title { get; set; } = string.Empty;
    public string EventDescription { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public int CategoryId { get; set; }

    public int OrganizerId { get; set; }

    public int OrganizerEntityId { get; set; }

    public int AvalaibleEntries { get; set; }

    public bool ApprovedState { get; set; }

    public DateTime EventDate { get; set; }

    public IFormFile? ImageFileEvent { get; set; }


}
