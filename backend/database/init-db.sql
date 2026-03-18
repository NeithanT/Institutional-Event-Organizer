CREATE DATABASE EventOrganizer;
GO

USE EventOrganizer;
GO

-- Usuarios


CREATE TABLE Role (
    Id          INT IDENTITY(1,1) PRIMARY KEY,

    RolName     VARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE [User] (
    Id          INT IDENTITY(1,1) PRIMARY KEY,

    UserPass    VARCHAR(50) NOT NULL,
    UserName    VARCHAR(100) NOT NULL,
    Email       VARCHAR(100) NOT NULL UNIQUE,
    Active      BIT NOT NULL,
    RoleId      INT NOT NULL,
    IdCard      INT,

    CONSTRAINT FKRoleId FOREIGN KEY (RoleId) REFERENCES Role(Id)
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

    EntityName  VARCHAR(50) NOT NULL UNIQUE
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
    ApprovedState       BIT NOT NULL,

    CONSTRAINT FkCategoryId FOREIGN KEY (CategoryId) REFERENCES Category(Id),
    CONSTRAINT FkOrganizerId FOREIGN KEY (OrganizerId) REFERENCES [User](Id),
    CONSTRAINT FkOrganizerEntityId FOREIGN KEY (OrganizerEntityId) REFERENCES OrganizerEntity(Id)
);
GO

CREATE TABLE CanceledEvent (
    Id      INT IDENTITY(1,1) PRIMARY KEY,

    EventId INT NOT NULL,
    Reason  VARCHAR(500) NOT NULL,

    CONSTRAINT FkEventId FOREIGN KEY (EventId) REFERENCES Event(Id)
);
GO

CREATE TABLE Inscriptions (
    Id      INT IDENTITY(1,1) PRIMARY KEY,

    EventId INT NOT NULL,
    UserId  INT NOT NULL,

    CONSTRAINT FkEventId FOREIGN KEY (EventId) REFERENCES Event(Id),
    CONSTRAINT FkUserId FOREIGN KEY (UserId) REFERENCES [User](Id)
);
GO

CREATE TABLE Attendance (
    Id      INT IDENTITY(1,1) PRIMARY KEY,

    EventId INT NOT NULL,
    UserId  INT NOT NULL,

    CONSTRAINT FkEventId FOREIGN KEY (EventId) REFERENCES Event(Id),
    CONSTRAINT FkUserId FOREIGN KEY (UserId) REFERENCES [User](Id)
);
GO

-- Noticias

CREATE TABLE Announcement (
    Id      INT IDENTITY(1,1) PRIMARY KEY,

    WriterId    INT NOT NULL,

    Title       VARCHAR(100) NOT NULL,
    About       VARCHAR(100) NOT NULL,
    Body        VARCHAR(1000) NOT NULL,

    CONSTRAINT FkWritedId FOREIGN KEY (WriterId) REFERENCES [User](Id)
);
GO

CREATE TABLE Mail (
    Id      INT IDENTITY(1,1) PRIMARY KEY,

    WriterId    INT NOT NULL,
    EventId     INT NOT NULL,
    Title       VARCHAR(100) NOT NULL,
    About       VARCHAR(100) NOT NULL,
    Body        VARCHAR(1000) NOT NULL,

    CONSTRAINT FkWritedId FOREIGN KEY (WriterId) REFERENCES [User](Id),
    CONSTRAINT FkEventId FOREIGN KEY (EventId) REFERENCES Event(Id)
);
GO