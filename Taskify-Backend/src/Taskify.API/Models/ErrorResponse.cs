namespace Taskify.API.Models;

public class ValidationError
{
    public string Property { get; set; } = null!;
    public string Message { get; set; } = null!;
}

public class ErrorResponse
{
    public string Message { get; set; } = null!;
    public int StatusCode { get; set; }
    public List<ValidationError>? ValidationErrors { get; set; }
}
