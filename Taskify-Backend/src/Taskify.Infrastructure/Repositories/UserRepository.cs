using Microsoft.EntityFrameworkCore;
using Taskify.Application.Interfaces;
using Taskify.Domain.Entities;
using Taskify.Infrastructure.Data;

namespace Taskify.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(TaskifyDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Users.AnyAsync(u => u.Id == id);
    }

    public async Task<List<User>> GetUsersWithTasksAsync()
    {
        return await _context.Users
            .Include(u => u.AssignedTasks)
            .ToListAsync();
    }
}
