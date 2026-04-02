SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO

IF DB_ID(N'EventOrganizer') IS NULL
BEGIN
    CREATE DATABASE EventOrganizer;
END
GO

USE EventOrganizer;
GO

-- Usuarios

IF OBJECT_ID(N'dbo.Role', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Role (
        Id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Role PRIMARY KEY,

        RolName     VARCHAR(50) NOT NULL,

        CONSTRAINT UQ_Role_RolName UNIQUE (RolName),
        CONSTRAINT CK_Role_RolName_NotBlank CHECK (LEN(LTRIM(RTRIM(RolName))) > 0)
    );
END
GO

IF OBJECT_ID(N'dbo.[User]', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.[User] (
        Id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_User PRIMARY KEY,

        UserPass    VARCHAR(50) NOT NULL,
        UserName    VARCHAR(100) NOT NULL,
        Email       VARCHAR(100) NOT NULL,
        Active      BIT NOT NULL CONSTRAINT DF_User_Active DEFAULT (1),
        RoleId      INT NOT NULL,
        IdCard      INT NULL,

        CONSTRAINT UQ_User_Email UNIQUE (Email),
        CONSTRAINT FK_User_Role FOREIGN KEY (RoleId) REFERENCES dbo.Role(Id),
        CONSTRAINT CK_User_UserPass_NotBlank CHECK (LEN(LTRIM(RTRIM(UserPass))) > 0),
        CONSTRAINT CK_User_UserName_NotBlank CHECK (LEN(LTRIM(RTRIM(UserName))) > 0),
        CONSTRAINT CK_User_Email_NotBlank CHECK (LEN(LTRIM(RTRIM(Email))) > 0),
        CONSTRAINT CK_User_IdCard_Positive CHECK (IdCard IS NULL OR IdCard > 0)
    );
END
GO

-- EVENTOS

IF OBJECT_ID(N'dbo.Category', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Category (
        Id              INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Category PRIMARY KEY,

        NameCategory    VARCHAR(50) NOT NULL,

        CONSTRAINT UQ_Category_NameCategory UNIQUE (NameCategory),
        CONSTRAINT CK_Category_NameCategory_NotBlank CHECK (LEN(LTRIM(RTRIM(NameCategory))) > 0)
    );
END
GO

IF OBJECT_ID(N'dbo.OrganizerEntity', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.OrganizerEntity (
        Id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_OrganizerEntity PRIMARY KEY,

        EntityName  VARCHAR(50) NOT NULL,

        CONSTRAINT UQ_OrganizerEntity_EntityName UNIQUE (EntityName),
        CONSTRAINT CK_OrganizerEntity_EntityName_NotBlank CHECK (LEN(LTRIM(RTRIM(EntityName))) > 0)
    );
END
GO

IF OBJECT_ID(N'dbo.Event', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Event (
        Id                  INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Event PRIMARY KEY,

        EventDate           DATETIME NOT NULL,
        Place               VARCHAR(100) NOT NULL,
        Title               VARCHAR(100) NOT NULL,
        EventDescription    VARCHAR(300) NOT NULL,
        CategoryId          INT NOT NULL,
        OrganizerId         INT NOT NULL,
        OrganizerEntityId   INT NOT NULL,
        AvalaibleEntries    INT NOT NULL,
        ApprovedState       BIT NOT NULL CONSTRAINT DF_Event_ApprovedState DEFAULT (0),
        ImageFileEvent      VARCHAR(MAX),
        IsVirtual           BIT NOT NULL,

        CONSTRAINT FK_Event_Category FOREIGN KEY (CategoryId) REFERENCES dbo.Category(Id),
        CONSTRAINT FK_Event_Organizer FOREIGN KEY (OrganizerId) REFERENCES dbo.[User](Id),
        CONSTRAINT FK_Event_OrganizerEntity FOREIGN KEY (OrganizerEntityId) REFERENCES dbo.OrganizerEntity(Id),
        CONSTRAINT CK_Event_Place_NotBlank CHECK (LEN(LTRIM(RTRIM(Place))) > 0),
        CONSTRAINT CK_Event_Title_NotBlank CHECK (LEN(LTRIM(RTRIM(Title))) > 0),
        CONSTRAINT CK_Event_Description_NotBlank CHECK (LEN(LTRIM(RTRIM(EventDescription))) > 0),
        CONSTRAINT CK_Event_AvailableEntries_Positive CHECK (AvalaibleEntries > 0)
    );
END
GO

IF OBJECT_ID(N'dbo.CanceledEvent', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CanceledEvent (
        Id      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_CanceledEvent PRIMARY KEY,

        EventId INT NOT NULL,
        Reason  VARCHAR(500) NOT NULL,

        CONSTRAINT UQ_CanceledEvent_EventId UNIQUE (EventId),
        CONSTRAINT FK_CanceledEvent_Event FOREIGN KEY (EventId) REFERENCES dbo.Event(Id),
        CONSTRAINT CK_CanceledEvent_Reason_NotBlank CHECK (LEN(LTRIM(RTRIM(Reason))) > 0)
    );
END
GO

IF OBJECT_ID(N'dbo.Inscriptions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Inscriptions (
        Id      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Inscriptions PRIMARY KEY,

        EventId INT NOT NULL,
        UserId  INT NOT NULL,

        CONSTRAINT UQ_Inscriptions_Event_User UNIQUE (EventId, UserId),
        CONSTRAINT FK_Inscriptions_Event FOREIGN KEY (EventId) REFERENCES dbo.Event(Id),
        CONSTRAINT FK_Inscriptions_User FOREIGN KEY (UserId) REFERENCES dbo.[User](Id)
    );
END
GO

IF OBJECT_ID(N'dbo.Attendance', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Attendance (
        Id      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Attendance PRIMARY KEY,

        EventId INT NOT NULL,
        UserId  INT NOT NULL,

        CONSTRAINT UQ_Attendance_Event_User UNIQUE (EventId, UserId),
        CONSTRAINT FK_Attendance_Event FOREIGN KEY (EventId) REFERENCES dbo.Event(Id),
        CONSTRAINT FK_Attendance_User FOREIGN KEY (UserId) REFERENCES dbo.[User](Id)
    );
END
GO

-- Noticias

IF OBJECT_ID(N'dbo.Announcement', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Announcement (
        Id      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Announcement PRIMARY KEY,

        WriterId    INT NOT NULL,

        Title       VARCHAR(100) NOT NULL,
        About       VARCHAR(100) NOT NULL,
        Body        VARCHAR(1000) NOT NULL,

        CONSTRAINT FK_Announcement_User FOREIGN KEY (WriterId) REFERENCES dbo.[User](Id),
        CONSTRAINT CK_Announcement_Title_NotBlank CHECK (LEN(LTRIM(RTRIM(Title))) > 0),
        CONSTRAINT CK_Announcement_About_NotBlank CHECK (LEN(LTRIM(RTRIM(About))) > 0),
        CONSTRAINT CK_Announcement_Body_NotBlank CHECK (LEN(LTRIM(RTRIM(Body))) > 0)
    );
END
GO

IF OBJECT_ID(N'dbo.Mail', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Mail (
        Id      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Mail PRIMARY KEY,

        WriterId    INT NOT NULL,
        EventId     INT NOT NULL,
        Title       VARCHAR(100) NOT NULL,
        About       VARCHAR(100) NOT NULL,
        Body        VARCHAR(1000) NOT NULL,

        CONSTRAINT FK_Mail_User FOREIGN KEY (WriterId) REFERENCES dbo.[User](Id),
        CONSTRAINT FK_Mail_Event FOREIGN KEY (EventId) REFERENCES dbo.Event(Id),
        CONSTRAINT CK_Mail_Title_NotBlank CHECK (LEN(LTRIM(RTRIM(Title))) > 0),
        CONSTRAINT CK_Mail_About_NotBlank CHECK (LEN(LTRIM(RTRIM(About))) > 0),
        CONSTRAINT CK_Mail_Body_NotBlank CHECK (LEN(LTRIM(RTRIM(Body))) > 0)
    );
END
GO