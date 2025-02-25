using backend.Domain.Constants;
using backend.Domain.Entities;
using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace backend.Infrastructure.Data;

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        // Get database configuration settings
        var shouldAutoMigrate = configuration.GetValue<bool>("Database:AutoMigrate");
        var shouldSeedDemoData = configuration.GetValue<bool>("Database:SeedDemoData");

        if (shouldAutoMigrate)
        {
            await initialiser.MigrateAsync();
        }

        if (shouldSeedDemoData)
        {
            await initialiser.SeedAsync();
        }
    }
}

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public ApplicationDbContextInitialiser(
        ILogger<ApplicationDbContextInitialiser> logger,
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task MigrateAsync()
    {
        try
        {
            _logger.LogInformation("Checking for pending database migrations...");

            // Get pending migrations
            var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();
            var pendingMigrationsList = pendingMigrations.ToList();

            if (pendingMigrationsList.Any())
            {
                _logger.LogInformation("Found {count} pending migrations to apply: {migrations}",
                    pendingMigrationsList.Count,
                    string.Join(", ", pendingMigrationsList));

                // Apply migrations
                await _context.Database.MigrateAsync();
                _logger.LogInformation("Successfully applied pending migrations");
            }
            else
            {
                _logger.LogInformation("No pending migrations - database is up to date");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while migrating the database");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await SeedRolesAndUsersAsync();
            await SeedDemoDataAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }

    private async Task SeedRolesAndUsersAsync()
    {
        // Default roles
        var administratorRole = new IdentityRole(RolesEnum.Administrator.ToString());

        if (_roleManager.Roles.All(r => r.Name != administratorRole.Name))
        {
            await _roleManager.CreateAsync(administratorRole);
            _logger.LogInformation("Created administrator role successfully");
        }

        // Default users
        var administrator = new ApplicationUser { UserName = "administrator@localhost", Email = "administrator@localhost" };

        if (_userManager.Users.All(u => u.UserName != administrator.UserName))
        {
            await _userManager.CreateAsync(administrator, "Administrator1!");
            if (!string.IsNullOrWhiteSpace(administratorRole.Name))
            {
                await _userManager.AddToRolesAsync(administrator, new[] { administratorRole.Name });
                _logger.LogInformation("Created administrator user and assigned roles successfully");
            }
        }
    }

    private async Task SeedDemoDataAsync()
    {
        // Only seed demo data if there are no existing todo lists
        if (!_context.TodoLists.Any())
        {
            _context.TodoLists.Add(new TodoList
            {
                Title = "Todo List",
                Items =
                {
                    new TodoItem { Title = "Make a todo list 📃" },
                    new TodoItem { Title = "Check off the first item ✅" },
                    new TodoItem { Title = "Realise you've already done two things on the list! 🤯"},
                    new TodoItem { Title = "Reward yourself with a nice, long nap 🏆" },
                }
            });

            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded demo data successfully");
        }
    }
}
