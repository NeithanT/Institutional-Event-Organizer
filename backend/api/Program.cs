using System.Text.Json.Serialization;
using api.Endpoints;
using api.Interfaces;
using api.Models;
using api.Services;
using Google.Apis.Gmail.v1;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
// {
//     options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
//     options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
// });
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContext<EventOrganizerContext>(
    options =>
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
);
builder.Services.AddScoped<IEmailService, GmailApiService>();


builder.Services.AddEndpointsApiExplorer();


builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "EventAPI";
    config.Title = "Event API";
    config.Version = "v1";
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi(config =>
    {
        config.DocumentTitle = "TodoAPI";
        config.Path = "/swagger";
        config.DocumentPath = "/swagger/{documentName}/swagger.json";
        config.DocExpansion = "list";
    });
}



app.UseRouting();

app.UseStaticFiles();

app.UseHttpsRedirection();
EventEndpoint.mapEventEndpoints(app);
AttendanceEndpoint.mapAttendancesEndpoints(app);

app.Run();
