using backend.Application.Common.Interfaces;
using backend.Domain.Constants;
using backend.Infrastructure.Data;
using backend.Infrastructure.Data.Interceptors;
using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.OAuth;
using System.Security.Claims;
using System.Text.Json;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection_old
{
    public static void AddInfrastructureServices_old(this IHostApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("backendDb");
        Guard.Against.Null(connectionString, message: "Connection string 'backendDb' not found.");

        builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        builder.Services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>();

        builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            options.UseSqlite(connectionString);
        });

        builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        builder.Services.AddScoped<ApplicationDbContextInitialiser>();

        var isDevelopment = builder.Environment.IsDevelopment();

        // Configure cookie authentication
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = IdentityConstants.BearerScheme;
            options.DefaultChallengeScheme = IdentityConstants.BearerScheme;
            options.DefaultScheme = IdentityConstants.BearerScheme;
        })
        .AddCookie(IdentityConstants.ApplicationScheme, options =>
        {
            options.LoginPath = "/sign-in";
            options.LogoutPath = "/sign-out";
            options.Cookie.Name = "ArchiteX.Auth";
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.SecurePolicy = isDevelopment ? CookieSecurePolicy.None : CookieSecurePolicy.Always;
            // Add events to handle API requests differently
            options.Events = new CookieAuthenticationEvents
            {
                OnRedirectToLogin = context =>
                {
                    // If it's an API request, return 401 instead of redirecting
                    if (context.Request.Path.StartsWithSegments("/api"))
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    }
                    context.Response.Redirect(context.RedirectUri);
                    return Task.CompletedTask;
                }
            };
        })
        .AddCookie(IdentityConstants.ExternalScheme, options =>
        {
            options.Cookie.Name = "ArchiteX.External";
            options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.SecurePolicy = isDevelopment ? CookieSecurePolicy.None : CookieSecurePolicy.Always;
        })
        .AddBearerToken(IdentityConstants.BearerScheme)
        .AddOAuth("Google", options =>
        {
            var clientId = builder.Configuration["Authentication:Google:ClientId"];
            var clientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
            
            Guard.Against.NullOrEmpty(clientId, message: "Google ClientId is not configured");
            Guard.Against.NullOrEmpty(clientSecret, message: "Google ClientSecret is not configured");

            options.ClientId = clientId;
            options.ClientSecret = clientSecret;
            
            // Google OAuth2 endpoints
            options.AuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
            options.TokenEndpoint = "https://oauth2.googleapis.com/token";
            options.UserInformationEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
            
            options.CallbackPath = "/api/Users/sign-in/google/callback";
            options.SaveTokens = true;

            // Proper cookie configuration for OAuth flow
            options.CorrelationCookie.SecurePolicy = isDevelopment ? CookieSecurePolicy.None : CookieSecurePolicy.Always;
            options.CorrelationCookie.SameSite = SameSiteMode.Lax;
            options.CorrelationCookie.HttpOnly = true;
            options.CorrelationCookie.IsEssential = true;
            options.CorrelationCookie.Domain = isDevelopment ? "architex-api.mydom.com" : null;

            // Request scopes
            options.Scope.Add("openid");
            options.Scope.Add("profile");
            options.Scope.Add("email");

            // Map claims from Google
            options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "sub");
            options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");
            options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");
            options.ClaimActions.MapJsonKey(ClaimTypes.GivenName, "given_name");
            options.ClaimActions.MapJsonKey(ClaimTypes.Surname, "family_name");
            options.ClaimActions.MapJsonKey("picture", "picture");

            options.Events = new OAuthEvents
            {
                OnCreatingTicket = async context =>
                {
                    // Get user info from Google
                    var request = new HttpRequestMessage(HttpMethod.Get, context.Options.UserInformationEndpoint);
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", context.AccessToken);
                    
                    var response = await context.Backchannel.SendAsync(request);
                    response.EnsureSuccessStatusCode();

                    var googleUser = await response.Content.ReadFromJsonAsync<JsonElement>();
                    if (googleUser.ValueKind != JsonValueKind.Undefined)
                    {
                        context.RunClaimActions(googleUser);
                    }
                },
                OnRemoteFailure = context =>
                {
                    context.Response.Redirect("/sign-in?error=" + Uri.EscapeDataString(context.Failure?.Message ?? "Remote authentication failed"));
                    context.HandleResponse();
                    return Task.CompletedTask;
                }
            };
        });

        builder.Services.AddAuthorizationBuilder();

        builder.Services
            .AddIdentityCore<ApplicationUser>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddApiEndpoints();

        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddTransient<IIdentityService, IdentityService>();

        builder.Services.AddAuthorization(options =>
            options.AddPolicy(Policies.CanPurge, policy => policy.RequireRole(Roles.Administrator)));
    }
}
