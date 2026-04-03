# Institutional Event Organizer

A comprehensive web application for managing institutional events, registrations, and attendance. This system enables event organizers to create and manage events while allowing users to browse, register, and track their attendance.

## Overview

The Institutional Event Organizer is a full-stack application designed to streamline event management within institutions. It provides a platform where event organizers can create and administer events, manage registrations, and track attendance, while users can easily discover, register for, and manage their event participation.

## Features

### For Users

- **User Authentication**: Secure login and registration system
- **Event Discovery**: Browse and search available events
- **Event Registration**: Register for events and manage inscriptions
- **Attendance Tracking**: View attendance history and event details

### For Event Organizers

- **Event Management**: Create, edit, and manage events
- **Registration Management**: Manage attendee lists and registrations
- **Attendance Tracking**: Monitor actual attendance vs. registrations

### For Administrators

- **Administrative Dashboard**: Manage users, events, and system settings
- **Event Administration**: Full control over event lifecycle
- **Utility Tools**: Administrative utilities for system management
- **Email Notifications**: Automated email notifications via Gmail integration

## Tech Stack

### Backend

- **Framework**: ASP.NET Core 10.0
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core
- **API Documentation**: OpenAPI/Swagger
- **Email Service**: Gmail API integration
- **PDF Generation**: QuestPDF

### Frontend

- **Framework**: Angular (with standalone components)
- **Routing**: Modern Angular routing with lazy loading
- **Styling**: CSS

### Database

- **DBMS**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Deployment**: Docker container setup with initialization and seed scripts

## Project Structure

```
Institutional-Event-Organizer/
├── backend/
│   ├── api/                    # ASP.NET Core API project
│   │   ├── Endpoints/          # API endpoint definitions
│   │   ├── Models/             # Database models
│   │   ├── DTOs/               # Data Transfer Objects
│   │   ├── Services/           # Business logic services
│   │   ├── DbContext/          # Entity Framework context
│   │   └── Program.cs          # API configuration
│   └── database/               # Database setup and initialization
│       ├── initdb.sql          # Database schema
│       ├── docker-compose.yml  # Docker Compose configuration
│       └── seed_*.sql          # Sample data scripts
├── frontend/                   # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Reusable components
│   │   │   ├── pages/          # Page components
│   │   │   └── services/       # API communication services
│   │   └── main.ts             # Application entry point
│   └── package.json            # Dependencies
└── documentacion/              # Project documentation
```

## Getting Started

### Prerequisites

- .NET 10.0 SDK
- Node.js and npm
- PostgreSQL
- Docker and Docker Compose (for containerized setup)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Institutional-Event-Organizer
   ```

2. **Setup the Database**

   ```bash
   cd backend/database
   docker-compose up -d
   ```

   The database will be initialized with the schema defined in `initdb.sql`

3. **Setup the Backend**

   ```bash
   cd backend/api
   dotnet restore
   dotnet build
   ```

4. **Setup the Frontend**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

**Backend API**

```bash
cd backend/api
dotnet run
```

The API will be available at `https://localhost:5001` with Swagger documentation at `/swagger`

**Frontend Application**

```bash
cd frontend
ng serve
```

The application will be available at `http://localhost:4200`

## API Endpoints

The application exposes the following endpoint categories:

- **Authentication**: User login and registration
- **Users**: User profile management
- **Events**: Event creation, listing, and management
- **Attendance**: Attendance tracking and management
- **Organizer**: Event organizer specific operations
- **Administrator**: Administrative utilities and operations

See the API documentation via Swagger for detailed endpoint specifications.

## Key Use Cases

1. **User Registration & Login**: Users create accounts and authenticate
2. **Event Creation**: Organizers create events with details, dates, and categories
3. **Event Registration**: Users browse and register for available events
4. **Attendance Tracking**: Track actual attendance and manage no-shows
5. **Reporting**: Generate reports on events, attendance, and participation

## Database Schema

The system includes the following main entities:

- **Users**: System users with different roles
- **Roles**: User roles (User, Organizer, Administrator)
- **Events**: Event details and information
- **Inscriptions**: User registrations for events
- **Attendance**: Attendance records
- **Categories**: Event categories
- **Announcements**: Event announcements
- **OrganizerEntities**: Organization information

## Contributing

This is an institutional project. For contributions, please follow the branching strategy visible in the repository.

## License

[Add your license here]

## Support

For issues, questions, or suggestions, please refer to the project's issue tracker or contact the development team.
