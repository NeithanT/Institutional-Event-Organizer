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


// CORS: allow Angular frontend at http://localhost:4200
var corsPolicyName = "AllowAngularDev";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName,
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

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

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var error = exceptionHandlerPathFeature?.Error;

        var errorDetail = new
        {
            Message = "An internal server error occurred.",
            Detail = error?.Message,
            StackTrace = error?.StackTrace
        };

        await context.Response.WriteAsJsonAsync(errorDetail);
    });
});

app.UseCors("AllowAngularDev");

AuthenticationEndpoint.mapAuthenticationEndpoints(app);

EventEndpoint.mapEventEndpoints(app);

AttendanceEndpoint.mapAttendancesEndpoints(app);

app.Run();
