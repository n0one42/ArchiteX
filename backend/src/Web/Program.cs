using backend.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

#if DEBUG
Console.WriteLine("Debug mode");
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCorsPolicy",
    policy =>
    {
        // IMPORTANT: When using credentials (cookies) you must specify the SetIsOriginAllowed or WithOrigins explicitly.
#if DEBUG
        policy.SetIsOriginAllowed(origin => true); // Allow any origin
#else
        policy.WithOrigins("http://localhost:5142");   // Replace "http://localhost:3000" with your Next.js app URL as needed.
#endif
        policy.AllowCredentials() // Allow credentials
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
#endif


// Add services to the container.
builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
#if DEBUG
app.UseCors("DevCorsPolicy");
//app.UseCookiePolicy(new CookiePolicyOptions // This is the global one which overrides all the other settings inside DependencyInjection. Mostly not needed.
// IMPORTANT: you can not use SameSiteMode.None without HTTPS - To make your life easier, always use https and a domain even through /etc/hosts if using cookies
//{
//    MinimumSameSitePolicy = SameSiteMode.None,
//    Secure = CookieSecurePolicy.Always,
//});
app.UseExceptionHandler("/Error");
await app.InitialiseDatabaseAsync();
#else
// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
app.UseHsts();
app.UseHttpsRedirection();
#endif

// Essential for cookie authentication
app.UseAuthentication();
app.UseAuthorization();

app.UseHealthChecks("/health");
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
