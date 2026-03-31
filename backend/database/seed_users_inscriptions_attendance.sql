SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO

IF DB_ID(N'EventOrganizer') IS NULL
BEGIN
    RAISERROR('Database EventOrganizer does not exist. Run initdb.sql first.', 16, 1);
    RETURN;
END
GO

USE EventOrganizer;
GO

-- Required roles for user seeding.
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RolName = 'Student')
BEGIN
    INSERT INTO dbo.Role (RolName) VALUES ('Student');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RolName = 'Organizer')
BEGIN
    INSERT INTO dbo.Role (RolName) VALUES ('Organizer');
END;

DECLARE @StudentRoleId INT = (
    SELECT TOP (1) Id FROM dbo.Role WHERE RolName = 'Student' ORDER BY Id
);

IF @StudentRoleId IS NULL
BEGIN
    RAISERROR('Could not resolve Student role.', 16, 1);
    RETURN;
END;

-- Seed users (idempotent by Email).
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'ana.rojas@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Ana Rojas', 'ana.rojas@event.local', 1, @StudentRoleId, 20000001);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'bruno.diaz@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Bruno Diaz', 'bruno.diaz@event.local', 1, @StudentRoleId, 20000002);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'camila.perez@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Camila Perez', 'camila.perez@event.local', 1, @StudentRoleId, 20000003);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'diego.ramirez@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Diego Ramirez', 'diego.ramirez@event.local', 1, @StudentRoleId, 20000004);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'elena.martin@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Elena Martin', 'elena.martin@event.local', 1, @StudentRoleId, 20000005);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'fabian.lopez@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Fabian Lopez', 'fabian.lopez@event.local', 1, @StudentRoleId, 20000006);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'gabriela.soto@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Gabriela Soto', 'gabriela.soto@event.local', 1, @StudentRoleId, 20000007);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'hector.navarro@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Hector Navarro', 'hector.navarro@event.local', 1, @StudentRoleId, 20000008);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'ines.morales@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Ines Morales', 'ines.morales@event.local', 1, @StudentRoleId, 20000009);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'jorge.vargas@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Jorge Vargas', 'jorge.vargas@event.local', 1, @StudentRoleId, 20000010);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'karla.mendoza@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Karla Mendoza', 'karla.mendoza@event.local', 1, @StudentRoleId, 20000011);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'lucas.guzman@event.local')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Lucas Guzman', 'lucas.guzman@event.local', 1, @StudentRoleId, 20000012);

-- Validate that events exist (for inscriptions/attendance FK).
IF NOT EXISTS (SELECT 1 FROM dbo.Event)
BEGIN
    RAISERROR('No events found. Run seed_events.sql first.', 16, 1);
    RETURN;
END;

-- Desired inscriptions by (Event Title, User Email).
DECLARE @InscriptionSeed TABLE (
    EventTitle VARCHAR(100) NOT NULL,
    UserEmail VARCHAR(100) NOT NULL
);

INSERT INTO @InscriptionSeed (EventTitle, UserEmail)
VALUES
('Orientation Day 2026', 'ana.rojas@event.local'),
('Orientation Day 2026', 'bruno.diaz@event.local'),
('Orientation Day 2026', 'camila.perez@event.local'),
('Research Methods Workshop', 'diego.ramirez@event.local'),
('Research Methods Workshop', 'elena.martin@event.local'),
('Spring Cultural Festival', 'fabian.lopez@event.local'),
('Spring Cultural Festival', 'gabriela.soto@event.local'),
('University Book Fair', 'hector.navarro@event.local'),
('University Book Fair', 'ines.morales@event.local'),
('Interfaculty Soccer Cup', 'jorge.vargas@event.local'),
('Interfaculty Soccer Cup', 'karla.mendoza@event.local'),
('5K Campus Run', 'lucas.guzman@event.local'),
('5K Campus Run', 'ana.rojas@event.local'),
('AI for Education Summit', 'bruno.diaz@event.local'),
('Cybersecurity Awareness Day', 'camila.perez@event.local'),
('Community Volunteering Fair', 'diego.ramirez@event.local'),
('Final Projects Expo', 'elena.martin@event.local'),
('Final Projects Expo', 'fabian.lopez@event.local');

INSERT INTO dbo.Inscriptions (EventId, UserId)
SELECT e.Id, u.Id
FROM @InscriptionSeed s
INNER JOIN dbo.Event e ON e.Title = s.EventTitle
INNER JOIN dbo.[User] u ON u.Email = s.UserEmail
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Inscriptions i
    WHERE i.EventId = e.Id
      AND i.UserId = u.Id
);

-- Attendance subset (typically users that actually attended).
DECLARE @AttendanceSeed TABLE (
    EventTitle VARCHAR(100) NOT NULL,
    UserEmail VARCHAR(100) NOT NULL
);

INSERT INTO @AttendanceSeed (EventTitle, UserEmail)
VALUES
('Orientation Day 2026', 'ana.rojas@event.local'),
('Orientation Day 2026', 'bruno.diaz@event.local'),
('Research Methods Workshop', 'elena.martin@event.local'),
('Spring Cultural Festival', 'fabian.lopez@event.local'),
('University Book Fair', 'ines.morales@event.local'),
('Interfaculty Soccer Cup', 'jorge.vargas@event.local'),
('5K Campus Run', 'ana.rojas@event.local'),
('AI for Education Summit', 'bruno.diaz@event.local'),
('Cybersecurity Awareness Day', 'camila.perez@event.local'),
('Final Projects Expo', 'fabian.lopez@event.local');

INSERT INTO dbo.Attendance (EventId, UserId)
SELECT e.Id, u.Id
FROM @AttendanceSeed s
INNER JOIN dbo.Event e ON e.Title = s.EventTitle
INNER JOIN dbo.[User] u ON u.Email = s.UserEmail
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Attendance a
    WHERE a.EventId = e.Id
      AND a.UserId = u.Id
);

SELECT COUNT(*) AS TotalUsers FROM dbo.[User];
SELECT COUNT(*) AS TotalInscriptions FROM dbo.Inscriptions;
SELECT COUNT(*) AS TotalAttendance FROM dbo.Attendance;
GO
