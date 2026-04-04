using api.DTOs;

namespace api.Interfaces;

public interface IAnnouncementService
{
    Task<IEnumerable<AnnouncementSummaryDto>> GetAnnouncementsAsync(AnnouncementFilterDto filters);
    Task<AnnouncementDetailDto?> GetAnnouncementByIdAsync(int id);
}
