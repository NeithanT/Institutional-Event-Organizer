namespace api.DTOs;

public record class DtoRegisterUser
{
    public string Name { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int IdCard { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}