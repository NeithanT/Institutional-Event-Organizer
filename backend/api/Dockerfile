FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# copy project files and restore
COPY . ./
RUN dotnet restore "api.csproj"

# publish
RUN dotnet publish "api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
COPY --from=build /app/publish .
COPY GoogleTokens/ ./GoogleTokens/
ENTRYPOINT ["dotnet", "api.dll"]
