using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup(this);
        group.MapIdentityApi<ApplicationUser>();
        group.MapGet("userRoles", GetUserRoles).RequireAuthorization();
        // group.MapGet("sign-in/google", SignInWithGoogle);
        // group.MapGet("sign-in/google/callback", GoogleCallback);
    }

    private async Task<Results<Ok<IEnumerable<RolesEnum>>, ForbidHttpResult>> GetUserRoles(HttpContext context, UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.GetUserAsync(context.User);
        if (user is null)
        {
            return TypedResults.Forbid();
        }

        var roles = await userManager.GetRolesAsync(user);

        var roleEnums = roles
            .Select(r => Enum.TryParse<RolesEnum>(r, out var roleEnum) ? roleEnum : (RolesEnum?)null)
            .OfType<RolesEnum>();

        return TypedResults.Ok(roleEnums);
    }

    // public IResult SignInWithGoogle(string? callbackUrl, HttpContext context)
    // {
    //     var properties = new AuthenticationProperties
    //     {
    //         RedirectUri = "/api/Users/sign-in/google/callback",
    //         Items = { { "returnUrl", callbackUrl ?? "/" } }
    //     };

    //     return Results.Challenge(properties, new[] { "Google" });
    // }

    // public async Task<IResult> GoogleCallback(
    //     HttpContext context,
    //     UserManager<ApplicationUser> userManager,
    //     SignInManager<ApplicationUser> signInManager)
    // {
    //     var info = await signInManager.GetExternalLoginInfoAsync();
    //     if (info == null)
    //     {
    //         return Results.Redirect("/sign-in?error=External_login_failure");
    //     }

    //     var result = await signInManager.ExternalLoginSignInAsync(
    //         info.LoginProvider,
    //         info.ProviderKey,
    //         isPersistent: true);

    //     if (result.Succeeded)
    //     {
    //         await signInManager.UpdateExternalAuthenticationTokensAsync(info);

    //         var googleUser = await userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
    //         if (googleUser != null)
    //         {
    //             googleUser.ExternalLoginProvider = AuthProvider.Google;
    //             googleUser.ExternalLoginId = info.ProviderKey;
    //             await userManager.UpdateAsync(googleUser);
    //         }

    //         return Results.Redirect("/");
    //     }

    //     var email = info.Principal.FindFirstValue(ClaimTypes.Email);
    //     if (email == null)
    //     {
    //         return Results.Redirect("/sign-in?error=No_email_from_provider");
    //     }

    //     var user = new ApplicationUser
    //     {
    //         UserName = email,
    //         Email = email,
    //         EmailConfirmed = true,
    //         ExternalLoginProvider = AuthProvider.Google,
    //         ExternalLoginId = info.ProviderKey
    //     };

    //     var createResult = await userManager.CreateAsync(user);
    //     if (!createResult.Succeeded)
    //     {
    //         return Results.Redirect("/sign-in?error=User_creation_failed");
    //     }

    //     var addLoginResult = await userManager.AddLoginAsync(user, info);
    //     if (!addLoginResult.Succeeded)
    //     {
    //         return Results.Redirect("/sign-in?error=Add_external_login_failed");
    //     }

    //     await signInManager.SignInAsync(user, isPersistent: true);
    //     return Results.Redirect("/");
    // }
}
