using api.Interfaces;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Google.Apis.Gmail.v1.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using MimeKit;
using System.Text;

namespace api.Services;

public class GmailApiService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly string[] Scopes = { GmailService.Scope.GmailSend };
    private string ApplicationName => _config["GmailSettings:ApplicationName"] ?? "EventOrganizer";

    public GmailApiService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // 1. Obtener credenciales (Esto busca el token guardado o abre login)
        var credential = await GetCredentialsAsync();

        // 2. Crear el servicio de Gmail
        var service = new GmailService(new BaseClientService.Initializer()
        {
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName,
        });

        // 3. Crear el mensaje con MimeKit
        var mimeMessage = new MimeMessage();
        mimeMessage.From.Add(new MailboxAddress(ApplicationName, _config["GmailSettings:SenderEmail"]));
        mimeMessage.To.Add(MailboxAddress.Parse(to));
        mimeMessage.Subject = subject;
        mimeMessage.Body = new TextPart("html") { Text = body };

        // 4. Preparar para Gmail (Base64Url)
        var msg = new Message
        {
            Raw = Base64UrlEncode(mimeMessage.ToString())
        };

        // 5. Ejecutar envío
        await service.Users.Messages.Send(msg, "me").ExecuteAsync();
    }

    private async Task<UserCredential> GetCredentialsAsync()
    {
        // Support two secret formats:
        // 1) GmailSettings:ClientId / GmailSettings:ClientSecret
        // 2) installed:client_id / installed:client_secret (Google downloaded json)
        var clientId = _config["GmailSettings:ClientId"] ?? _config["installed:client_id"];
        var clientSecret = _config["GmailSettings:ClientSecret"] ?? _config["installed:client_secret"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
        {
            throw new InvalidOperationException(
                "Missing Gmail OAuth credentials. Configure GmailSettings:ClientId and GmailSettings:ClientSecret " +
                "or provide installed:client_id and installed:client_secret in user secrets.");
        }

        var secrets = new ClientSecrets
        {
            ClientId = clientId,
            ClientSecret = clientSecret
        };
        string credPath = "GoogleTokens";

        // Autorizamos usando los strings, no el archivo físico
        return await GoogleWebAuthorizationBroker.AuthorizeAsync(
            secrets,
            Scopes,
            "user",
            CancellationToken.None,
            new FileDataStore(credPath, true)); // Esto guarda el token resultante
    }

    private string Base64UrlEncode(string input)
    {
        var inputBytes = Encoding.UTF8.GetBytes(input);
        return Convert.ToBase64String(inputBytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .Replace("=", "");
    }

}