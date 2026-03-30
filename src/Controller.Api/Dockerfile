FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS restore
WORKDIR /src
COPY src/Controller.SharedKernel/Controller.SharedKernel.csproj Controller.SharedKernel/
COPY src/Modules/Controller.Modules.Identity/Controller.Modules.Identity.csproj Modules/Controller.Modules.Identity/
COPY src/Modules/Controller.Modules.Expenses/Controller.Modules.Expenses.csproj Modules/Controller.Modules.Expenses/
COPY src/Controller.Api/Controller.Api.csproj Controller.Api/
RUN dotnet restore Controller.Api/Controller.Api.csproj

FROM restore AS build
COPY src/ .
RUN dotnet publish Controller.Api/Controller.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
RUN useradd --create-home appuser
USER appuser
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
ENTRYPOINT ["dotnet", "Controller.Api.dll"]
