using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Taskify.API.Middleware;
using Taskify.Application;
using Taskify.Domain.Entities;
using Taskify.Domain.Enums;
using Taskify.Infrastructure;
using Taskify.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add CORS services - Allow all origins for development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()  // Allow all origins for development
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add services to the container
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Taskify API",
        Version = "v1",
        Description = "A comprehensive task management system built with Clean Architecture"
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Include XML comments if the file exists
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Remove duplicate CORS configuration - already configured above

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? "YourSecretKeyHereThatShouldBeAtLeast32CharactersLong!";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "TaskifyAPI",
            ValidAudience = jwtSettings["Audience"] ?? "TaskifyClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Add Application Layer
builder.Services.AddApplication();

// Add Infrastructure Layer
builder.Services.AddInfrastructure(builder.Configuration);

// Add Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Initialize/migrate database
if (!app.Environment.IsEnvironment("Testing"))
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<TaskifyDbContext>();
            context.Database.Migrate(); // Apply any pending migrations
        
        // Seed initial data if needed
        var userCount = context.Users.Count();
        
        // Always ensure admin user exists
        var hasAdmin = context.Users.Any(u => u.Email == "admin@taskify.com");
        
        if (!hasAdmin)
        {
            var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
            var adminUser = Taskify.Domain.Entities.User.CreateWithPassword(
                "Admin User",
                "admin@taskify.com",
                adminPasswordHash,
                Taskify.Domain.Enums.UserRole.Admin,
                Taskify.Domain.Enums.Position.ProjectManager,
                "Management"
            );
            context.Users.Add(adminUser);
            context.SaveChanges();
        }
        
        if (userCount == 0)
        {
            // Create sample users with passwords (admin already created above)
            var johnPasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
            var johnDoe = Taskify.Domain.Entities.User.CreateWithPassword(
                "John Doe",
                "john@taskify.com",
                johnPasswordHash,
                Taskify.Domain.Enums.UserRole.Member,
                Taskify.Domain.Enums.Position.FrontendDeveloper,
                "Engineering"
            );

            var janePasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
            var janeSmith = Taskify.Domain.Entities.User.CreateWithPassword(
                "Jane Smith",
                "jane@taskify.com",
                janePasswordHash,
                Taskify.Domain.Enums.UserRole.Member,
                Taskify.Domain.Enums.Position.BackendDeveloper,
                "Engineering"
            );

            var mikePasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
            var mikeJohnson = Taskify.Domain.Entities.User.CreateWithPassword(
                "Mike Johnson",
                "mike@taskify.com",
                mikePasswordHash,
                Taskify.Domain.Enums.UserRole.ProjectManager,
                Taskify.Domain.Enums.Position.TeamLead,
                "Engineering"
            );

            var sarahPasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
            var sarahWilson = Taskify.Domain.Entities.User.CreateWithPassword(
                "Sarah Wilson",
                "sarah@taskify.com",
                sarahPasswordHash,
                Taskify.Domain.Enums.UserRole.Member,
                Taskify.Domain.Enums.Position.UIUXDesigner,
                "Design"
            );

            context.Users.AddRange(johnDoe, janeSmith, mikeJohnson, sarahWilson);

            // Create sample projects
            var project1 = Taskify.Domain.Entities.Project.Create(
                "Website Redesign",
                "Complete overhaul of the company website",
                "#6366F1"
            );

            var project2 = Taskify.Domain.Entities.Project.Create(
                "Mobile App",
                "Native mobile application for iOS and Android",
                "#10B981"
            );

            var project3 = Taskify.Domain.Entities.Project.Create(
                "API Development",
                "RESTful API backend development",
                "#F59E0B"
            );

            context.Projects.AddRange(project1, project2, project3);
            context.SaveChanges();

            // Create sample tasks
            var task1 = Taskify.Domain.Entities.Task.Create(
                "Design homepage mockups",
                "Create wireframes and mockups for the new homepage",
                Taskify.Domain.Enums.TaskPriority.High,
                Taskify.Domain.Enums.TaskStatus.Todo,
                project1.Id
            );
            task1.AssignTo(sarahWilson.Id);
            task1.SetDueDate(DateTime.Now.AddDays(2));

            var task2 = Taskify.Domain.Entities.Task.Create(
                "Implement responsive navigation",
                "Build the responsive navigation component",
                Taskify.Domain.Enums.TaskPriority.Medium,
                Taskify.Domain.Enums.TaskStatus.InProgress,
                project1.Id
            );
            task2.AssignTo(johnDoe.Id);
            task2.SetDueDate(DateTime.Now.AddDays(5));

            var task3 = Taskify.Domain.Entities.Task.Create(
                "Set up project structure",
                "Initialize the project with proper folder structure",
                Taskify.Domain.Enums.TaskPriority.High,
                Taskify.Domain.Enums.TaskStatus.Todo,
                project2.Id
            );
            task3.AssignTo(janeSmith.Id);
            task3.MarkAsCompleted();

            var task4 = Taskify.Domain.Entities.Task.Create(
                "API authentication endpoints",
                "Implement user authentication and authorization",
                Taskify.Domain.Enums.TaskPriority.High,
                Taskify.Domain.Enums.TaskStatus.InProgress,
                project3.Id
            );
            task4.AssignTo(janeSmith.Id);
            task4.SetDueDate(DateTime.Now.AddDays(3));

            var task5 = Taskify.Domain.Entities.Task.Create(
                "Database design",
                "Design and implement the database schema",
                Taskify.Domain.Enums.TaskPriority.Medium,
                Taskify.Domain.Enums.TaskStatus.Todo,
                project3.Id
            );
            task5.AssignTo(mikeJohnson.Id);
            task5.MarkAsCompleted();

            context.Tasks.AddRange(task1, task2, task3, task4, task5);
            context.SaveChanges();
            
            var finalUserCount = context.Users.Count();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        throw; // Rethrow to fail startup if database is not available
    }
}
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS first
app.UseCors();

// Disable HTTPS redirection for development
// app.UseHttpsRedirection();

// Temporarily disable authentication for testing
// app.UseAuthentication();
// app.UseAuthorization();

app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

app.MapControllers();
app.MapHealthChecks("/health");

// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<TaskifyDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while ensuring the database exists");
    }
}

app.Run();

// Make Program accessible for integration tests
public partial class Program { }
