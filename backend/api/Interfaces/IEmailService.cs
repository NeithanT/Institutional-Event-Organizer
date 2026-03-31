using System;
using MailKit.Net.Smtp;

namespace api.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
}