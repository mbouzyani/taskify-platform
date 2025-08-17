using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Taskify.Infrastructure.Data
{
    public class TaskifyDbContextFactory : IDesignTimeDbContextFactory<TaskifyDbContext>
    {
        public TaskifyDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<TaskifyDbContext>();
            // Use the same connection string as your appsettings.Development.json
            optionsBuilder.UseSqlServer("Server=localhost,1433;Database=TaskifyDb;User Id=sa;Password=Taskify2025!;TrustServerCertificate=True;");

            return new TaskifyDbContext(optionsBuilder.Options);
        }
    }
}
