using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Taskify.Domain.Entities;

namespace Taskify.Infrastructure.Data.Configurations;

public class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> builder)
    {
        builder.ToTable("ActivityLogs");
        
        builder.HasKey(a => a.Id);
        
        builder.Property(a => a.Title)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(a => a.Description)
            .HasMaxLength(1000);
            
        builder.Property(a => a.Type)
            .HasConversion<int>();
            
        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.SetNull);
            
        builder.HasIndex(a => a.Timestamp);
        builder.HasIndex(a => a.Type);
    }
}
