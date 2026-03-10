CREATE DATABASE EventOrganizer;
GO

USE EventOrganizer;
GO

-- Usuarios

CREATE TABLE [User] (
    Id          INT IDENTITY(1,1) PRIMARY KEY,

    UserPas     VARCHAR(50) NOT NULL,
    UserName        VARCHAR(100) NOT NULL,
    Email       VARCHAR(64) NOT NULL,
    Active      BIT NOT NULL,
    RoleId      INT NOT NULL,
    IdCard      INT
);
GO

CREATE TABLE Role (
    Id          INT IDENTITY(1,1) PRIMARY KEY,

    RolName     VARCHAR(50) NOT NULL UNIQUE
);
GO

-- EVENTOS

CREATE TABLE Category (
    Id          INT IDENTITY(1,1) PRIMARY KEY,

    NameCategory    VARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE OrganizerEntity (
    Id          INT IDENTITY(1,1) PRIMARY KEY,

    EntityName  VARCHAR(50) NOT NULL UNIQUE,
);
GO

CREATE TABLE Event (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,

    EventDate           DATETIME NOT NULL,
    Place               VARCHAR(100) NOT NULL,
    Title               VARCHAR(100) NOT NULL,
    EventDescription    VARCHAR(300) NOT NULL,
    CategoryId          INT NOT NULL,
    OrganizerId         INT NOT NULL,
    OrganizerEntityId   INT NOT NULL,
    AvalaibleEntries    INT NOT NULL,
    ApprovedState       BIT NOT NULL
);
GO

CREATE TABLE CanceledEvent (
    Id      INT IDENTITY(1,1) PRIMARY KEY,

    EventId INT NOT NULL,
    Reason  VARCHAR(500) NOT NULL
);
GO

CREATE TABLE Inscriptions (
    Id      INT IDENTITY(1,1) PRIMARY KEY,

    EventId INT NOT NULL,
    UserId  INT NOT NULL
);
GO

CREATE TABLE Attendance (
    Id      INT IDENTITY(1,1) PRIMARY KEY,

    EventId INT NOT NULL,
    UserId  INT NOT NULL
);
GO

-- Noticias

CREATE TABLE New (
    Id      INT IDENTITY(1,1) PRIMARY KEY,

    WriterId    INT NOT NULL,

    Title       VARCHAR(100) NOT NULL,
    About       VARCHAR(100) NOT NULL,
    Body        VARCHAR(1000) NOT NULL
);
GO

CREATE TABLE Mail (
    Id      INT IDENTITY(1,1) PRIMARY KEY,

    WriterId    INT NOT NULL,
    EventId     INT NOT NULL,
    Title       VARCHAR(100) NOT NULL,
    About       VARCHAR(100) NOT NULL,
    Body        VARCHAR(1000) NOT NULL

);
GO