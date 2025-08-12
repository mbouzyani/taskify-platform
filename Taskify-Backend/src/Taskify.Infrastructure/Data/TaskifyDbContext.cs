using Microsoft.EntityFrameworkCore;
using Taskify.Domain.Common;
using Taskify.Domain.Entities;

namespace Taskify.Infrastructure.Data;

public class TaskifyDbContext : DbContext
{
    public DbSet<Domain.Entities.Task> Tasks { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<ActivityLog> ActivityLogs { get; set; } = null!;

    public TaskifyDbContext(DbContextOptions<TaskifyDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure Project entity
        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Color).HasMaxLength(7);
        });
        
        // Configure Task entity
        modelBuilder.Entity<Domain.Entities.Task>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            
            // Configure relationship with Project
            entity.HasOne(t => t.Project)
                  .WithMany(p => p.Tasks)
                  .HasForeignKey(t => t.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Configure relationship with User (Assignee)
            entity.HasOne(t => t.Assignee)
                  .WithMany(u => u.AssignedTasks)
                  .HasForeignKey(t => t.AssigneeId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);
        });
        
        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Avatar).HasMaxLength(500);
            entity.Property(e => e.Position).HasConversion<int>().IsRequired();
            entity.Property(e => e.Role).HasConversion<int>().IsRequired();
            entity.Property(e => e.Department).HasMaxLength(100);
            
            // Configure many-to-many relationship with Projects
            entity.HasMany(u => u.AssignedProjects)
                  .WithMany(p => p.AssignedUsers)
                  .UsingEntity(j => j.ToTable("UserProjects"));
        });
        
        // Configure domain events
        modelBuilder.Ignore<DomainEvent>();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Handle BaseEntity
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.UpdateModifiedDate();
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdateModifiedDate();
                    break;
            }
        }
        
        // Handle BaseIntEntity
        foreach (var entry in ChangeTracker.Entries<BaseIntEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.UpdateModifiedDate();
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdateModifiedDate();
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
