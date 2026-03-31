using Microsoft.Identity.Client;

namespace api.DTOs;

public class DtoCanceledEvent
{
    public string Reason { get; set; } = string.Empty;
}