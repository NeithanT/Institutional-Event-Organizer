# Institutional Event Organizer

Proyecto de gestión de eventos institucionales
Esta basado en el Centro de las artes principalmente
con backend en .NET y frontend en Angular.

# Requisitos:
- .NET SDK          https://dotnet.microsoft.com/en-us/download
- Node / Angular    https://nodejs.org/en/download
- Docker            https://www.docker.com/

# Pasos de ejecución

1. Iniciar la base de datos
   - `cd backend/database/`
   - `docker compose up -d`
2. Iniciar el API
   - `cd backend/api`
   - `dotnet run`
3. Iniciar el Frontend
   - `cd frontend/`
   - `npm install`
   - `npm run start`

# Opcional: desplegar con HTTPS
   - `sudo bash deploy/install.sh`

> Nota: primero debes generar un certificado TLS.