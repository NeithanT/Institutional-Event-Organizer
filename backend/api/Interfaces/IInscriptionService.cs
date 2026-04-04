using api.DTOs;

namespace api.Interfaces;

public interface IInscriptionService
{
    Task<IEnumerable<InscriptionSummaryDto>> GetUserInscriptionsAsync(int userId);
    Task<IResult> CreateInscriptionAsync(InscriptionCreateDto dto);
    Task<IResult> DeleteInscriptionAsync(int eventId, int userId);
}
