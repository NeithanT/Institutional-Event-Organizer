using System.Text.Json.Serialization;
using api.Endpoints;
using api.Models;
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

// CORS: allow everything (use only in development / local testing)
var corsPolicyName = "AllowAll";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName,
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
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

app.UseCors(corsPolicyName);
app.UseHttpsRedirection();
AuthenticationEndpoint.mapAuthenticationEndpoints(app);
EventEndpoint.mapEventEndpoints(app);
AttendanceEndpoint.mapAttendancesEndpoints(app);

app.Run();
