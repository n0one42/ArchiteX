using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using backend.Domain.Enums;

namespace backend.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapIdentityApi<ApplicationUser>();

        // Google OAuth Challenge endpoint
        app.MapGet("/api/Users/sign-in/google", (
            string? callbackUrl,
            HttpContext context) =>
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = "/api/Users/sign-in/google/callback",
                Items = 
                {
                    { "returnUrl", callbackUrl ?? "/" }
                }
            };

            return Results.Challenge(properties, new[] { "Google" });
        });

        // Google OAuth Callback endpoint
        app.MapGet("/api/Users/sign-in/google/callback", async (
            HttpContext context,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager) =>
        {
            var info = await signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                return Results.Redirect("/sign-in?error=External_login_failure");
            }

            // Sign in the user with external login provider
            var result = await signInManager.ExternalLoginSignInAsync(
                info.LoginProvider,
                info.ProviderKey,
                isPersistent: true);

            if (result.Succeeded)
            {
                // Update any authentication tokens
                await signInManager.UpdateExternalAuthenticationTokensAsync(info);
                
                // Get the user and update their external login info
                var googleUser = await userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
                if (googleUser != null)
                {
                    googleUser.ExternalLoginProvider = AuthProvider.Google;
                    googleUser.ExternalLoginId = info.ProviderKey;
                    await userManager.UpdateAsync(googleUser);
                }
                
                return Results.Redirect("/");
            }

            // If user does not exist, create one
            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            if (email == null)
            {
                return Results.Redirect("/sign-in?error=No_email_from_provider");
            }

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                ExternalLoginProvider = AuthProvider.Google,
                ExternalLoginId = info.ProviderKey
            };

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return Results.Redirect("/sign-in?error=User_creation_failed");
            }

            // Add the external login to the user
            var addLoginResult = await userManager.AddLoginAsync(user, info);
            if (!addLoginResult.Succeeded)
            {
                return Results.Redirect("/sign-in?error=Add_external_login_failed");
            }

            // Claims are already mapped by ClaimActions in the OAuth configuration
            await signInManager.SignInAsync(user, isPersistent: true);
            return Results.Redirect("/");
        });
    }
}
