using System;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace api.DTOs;

public class DtoAnnoucement
{
    public int WriterId { get; set; }
    public string Title { get; set; } = string.Empty;

    public string About { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;

        
}
