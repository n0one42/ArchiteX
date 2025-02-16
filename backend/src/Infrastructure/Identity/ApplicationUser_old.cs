using Microsoft.AspNetCore.Identity;
using backend.Domain.Enums;

namespace backend.Infrastructure.Identity;

public class ApplicationUser_old : IdentityUser
{
    public AuthProvider? ExternalLoginProvider { get; set; }
    public string? ExternalLoginId { get; set; }
}
