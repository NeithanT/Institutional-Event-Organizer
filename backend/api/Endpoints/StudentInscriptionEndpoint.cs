using api.DTOs;
using api.Interfaces;

namespace api.Endpoints;

public static class StudentInscriptionEndpoint
{
    public static void mapStudentInscriptionEndpoints(this WebApplication app)
    {
        app.MapGet("/api/inscripciones", GetUserInscriptions);
        app.MapGet("/inscripciones", GetUserInscriptions);
        app.MapPost("/api/inscripciones", CreateInscription);
        app.MapPost("/inscripciones", CreateInscription);
        app.MapDelete("/api/inscripciones/{eventId:int}", DeleteInscription);
        app.MapDelete("/inscripciones/{eventId:int}", DeleteInscription);
    }

    private static async Task<IResult> GetUserInscriptions(
        int userId,
        IInscriptionService inscriptionService)
    {
        if (userId <= 0)
            return Results.BadRequest(new { message = "userId inválido." });

        var inscriptions = await inscriptionService.GetUserInscriptionsAsync(userId);
        return Results.Ok(inscriptions);
    }

    private static async Task<IResult> CreateInscription(
        InscriptionCreateDto dto,
        IInscriptionService inscriptionService)
    {
        if (dto.UserId <= 0 || dto.EventId <= 0)
            return Results.BadRequest(new { message = "UserId y EventId son requeridos." });

        return await inscriptionService.CreateInscriptionAsync(dto);
    }

    private static async Task<IResult> DeleteInscription(
        int eventId,
        int userId,
        IInscriptionService inscriptionService)
    {
        if (userId <= 0 || eventId <= 0)
            return Results.BadRequest(new { message = "userId y eventId inválidos." });

        return await inscriptionService.DeleteInscriptionAsync(eventId, userId);
    }
}
