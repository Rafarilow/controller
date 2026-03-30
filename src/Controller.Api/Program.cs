using System.Text;
using System.Text.Json.Serialization;
using Controller.Api.Middleware;
using Controller.Modules.Expenses;
using Controller.Modules.Expenses.Api.Endpoints;
using Controller.Modules.Expenses.Infrastructure.Persistence;
using Controller.Modules.Identity;
using Controller.Modules.Identity.Api.Endpoints;
using Controller.Modules.Identity.Infrastructure.Persistence;
using Controller.SharedKernel.Application;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ── NpgsqlDataSource (shared singleton) ────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
var dataSourceBuilder = new Npgsql.NpgsqlDataSourceBuilder(connectionString);
var dataSource = dataSourceBuilder.Build();
builder.Services.AddSingleton(dataSource);

// ── Shared services ────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// ── JWT Authentication ─────────────────────────────────────
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });
builder.Services.AddAuthorization();

// ── CORS ───────────────────────────────────────────────────
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── Module Registration ────────────────────────────────────
IModuleInitializer[] modules =
[
    new IdentityModule(),
    new ExpensesModule()
];

foreach (var module in modules)
    module.ConfigureServices(builder.Services, builder.Configuration);

// ── Build App ──────────────────────────────────────────────
var app = builder.Build();

// ── Middleware Pipeline ────────────────────────────────────
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// ── Endpoints ──────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    modules = new[] { "Identity", "Expenses", "Receitas", "Categories" }
}));

app.MapAuthEndpoints();
app.MapExpenseEndpoints();
app.MapReceitaEndpoints();
app.MapCategoryEndpoints();

// ── Auto-Migrate ───────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var identityDb = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
    await identityDb.Database.MigrateAsync();

    var expensesDb = scope.ServiceProvider.GetRequiredService<ExpensesDbContext>();
    await expensesDb.Database.MigrateAsync();
}

app.Run();
