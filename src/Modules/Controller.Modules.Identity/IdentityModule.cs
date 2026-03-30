using Controller.Modules.Identity.Application.Interfaces;
using Controller.Modules.Identity.Application.Services;
using Controller.Modules.Identity.Infrastructure.Persistence;
using Controller.SharedKernel.Application;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Controller.Modules.Identity;

public class IdentityModule : IModuleInitializer
{
    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<IdentityDbContext>((sp, options) =>
        {
            var dataSource = sp.GetRequiredService<Npgsql.NpgsqlDataSource>();
            options.UseNpgsql(dataSource);
        });

        services.AddScoped<IIdentityRepository, IdentityRepository>();
        services.AddScoped<IAuthService, AuthService>();
    }
}
