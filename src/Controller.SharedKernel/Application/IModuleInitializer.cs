using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Controller.SharedKernel.Application;

public interface IModuleInitializer
{
    void ConfigureServices(IServiceCollection services, IConfiguration configuration);
}
