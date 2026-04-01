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
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'neithanvarvar@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Ana Rojas', 'neithanvarvar@gmail.com', 1, @StudentRoleId, 20000001);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'erikzf025@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Bruno Diaz', 'erikzf025@gmail.com', 1, @StudentRoleId, 20000002);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'neithanvarvar@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Camila Perez', 'neithanvarvar@gmail.com', 1, @StudentRoleId, 20000003);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'schaves0707@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Diego Ramirez', 'schaves0707@gmail.com', 1, @StudentRoleId, 20000004);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'erikzf025@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Elena Martin', 'erikzf025@gmail.com', 1, @StudentRoleId, 20000005);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'neithanvarvar@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Fabian Lopez', 'neithanvarvar@gmail.com', 1, @StudentRoleId, 20000006);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'blafaro07@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Gabriela Soto', 'blafaro07@gmail.com', 1, @StudentRoleId, 20000007);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'schaves0707@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Hector Navarro', 'schaves0707@gmail.com', 1, @StudentRoleId, 20000008);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'schaves0707@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Ines Morales', 'schaves0707@gmail.com', 1, @StudentRoleId, 20000009);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'blafaro07@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Jorge Vargas', 'blafaro07@gmail.com', 1, @StudentRoleId, 20000010);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'hernandezfabricio420@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Karla Mendoza', 'hernandezfabricio420@gmail.com', 1, @StudentRoleId, 20000011);
IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'dayannahernandezcr@gmail.com')
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard) VALUES ('UserPass123', 'Lucas Guzman', 'dayannahernandezcr@gmail.com', 1, @StudentRoleId, 20000012);

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
('Orientation Day 2026', 'neithanvarvar@gmail.com'),
('Orientation Day 2026', 'erikzf025@gmail.com'),
('Orientation Day 2026', 'neithanvarvar@gmail.com'),
('Research Methods Workshop', 'schaves0707@gmail.com'),
('Research Methods Workshop', 'erikzf025@gmail.com'),
('Spring Cultural Festival', 'neithanvarvar@gmail.com'),
('Spring Cultural Festival', 'blafaro07@gmail.com'),
('University Book Fair', 'schaves0707@gmail.com'),
('University Book Fair', 'schaves0707@gmail.com'),
('Interfaculty Soccer Cup', 'blafaro07@gmail.com'),
('Interfaculty Soccer Cup', 'hernandezfabricio420@gmail.com'),
('5K Campus Run', 'dayannahernandezcr@gmail.com'),
('5K Campus Run', 'neithanvarvar@gmail.com'),
('AI for Education Summit', 'erikzf025@gmail.com'),
('Cybersecurity Awareness Day', 'neithanvarvar@gmail.com'),
('Community Volunteering Fair', 'schaves0707@gmail.com'),
('Final Projects Expo', 'erikzf025@gmail.com'),
('Final Projects Expo', 'neithanvarvar@gmail.com');

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
('Orientation Day 2026', 'neithanvarvar@gmail.com'),
('Orientation Day 2026', 'erikzf025@gmail.com'),
('Research Methods Workshop', 'erikzf025@gmail.com'),
('Spring Cultural Festival', 'neithanvarvar@gmail.com'),
('University Book Fair', 'schaves0707@gmail.com'),
('Interfaculty Soccer Cup', 'blafaro07@gmail.com'),
('5K Campus Run', 'neithanvarvar@gmail.com'),
('AI for Education Summit', 'erikzf025@gmail.com'),
('Cybersecurity Awareness Day', 'neithanvarvar@gmail.com'),
('Final Projects Expo', 'neithanvarvar@gmail.com');

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
