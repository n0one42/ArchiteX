using backend.Infrastructure.Data;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();

if (builder.Environment.IsDevelopment())
{
    Console.WriteLine("Debug mode");
    builder.Configuration.AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true);
    builder.Logging.AddConsole();

}

builder.Services.AddCors(options =>
{
    // IMPORTANT: When using credentials (cookies) you must specify the SetIsOriginAllowed or WithOrigins explicitly.
    options.AddPolicy("DevCorsPolicy",
    policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });

    options.AddPolicy("ProdCorsPolicy", policy =>
    {
        policy.WithOrigins("https://architex-frontend-local.mydom.com", "https://architex-frontend.mydom.com")    // ! Replcae with yours
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// This allows the app to interpret the original scheme (HTTPS) from Traefik's forwarded headers.
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto
    // Optionally configure KnownProxies/KnownNetworks if needed
});

if (app.Environment.IsDevelopment())
{
    app.UseCors("DevCorsPolicy");
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}


if (app.Environment.IsProduction())
{
    app.UseCors("ProdCorsPolicy");
}

//app.UseCookiePolicy(new CookiePolicyOptions // This is the global one which overrides all the other settings inside DependencyInjection. Mostly not needed.
// IMPORTANT: you can not use SameSiteMode.None without HTTPS - To make your life easier, always use https and a domain even through /etc/hosts if using cookies
//{
//    MinimumSameSitePolicy = SameSiteMode.None,
//    Secure = CookieSecurePolicy.Always,
//});


await app.InitialiseDatabaseAsync();

// Essential for cookie authentication
app.UseAuthentication();
app.UseAuthorization();

app.UseHealthChecks("/health");
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseSwaggerUi(settings =>
{
    settings.Path = "/api";
    settings.DocumentPath = "/api/specification.json";
});


app.UseExceptionHandler(options => { });

app.Map("/", () => Results.Redirect("/api"));

app.MapEndpoints();

app.Run();

public partial class Program { }
