using System.Text.Json;
using Microsoft.AspNetCore.Http;
using FluentValidation;
using Taskify.API.Models;
using Taskify.Domain.Exceptions;

namespace Taskify.API.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

    public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {ExceptionMessage}. Details: {ExceptionDetails}", 
                ex.Message,
                ex is ValidationException validationEx ? 
                    string.Join(", ", validationEx.Errors.Select(e => $"{e.PropertyName}: {e.ErrorMessage}")) :
                    ex.ToString());
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var errorResponse = exception switch
        {
            ValidationException validationEx => new ErrorResponse
            {
                Message = "Validation failed",
                ValidationErrors = validationEx.Errors.Select(e => new ValidationError { Property = e.PropertyName, Message = e.ErrorMessage }).ToList(),
                StatusCode = StatusCodes.Status400BadRequest
            },
            TaskNotFoundException or ProjectNotFoundException or UserNotFoundException => new ErrorResponse
            {
                Message = exception.Message,
                StatusCode = StatusCodes.Status404NotFound
            },
            DomainException => new ErrorResponse
            {
                Message = exception.Message,
                StatusCode = StatusCodes.Status400BadRequest
            },
            _ => new ErrorResponse
            {
                Message = "An unexpected error occurred",
                StatusCode = StatusCodes.Status500InternalServerError
            }
        };

        context.Response.StatusCode = errorResponse.StatusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
    }
}
