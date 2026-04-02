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

/*
Massive and idempotent seed for load testing and demos.
Creates:
- many student users
- many events
- many inscriptions
- many attendance rows

Safe to run multiple times.
*/

SET NOCOUNT ON;

DECLARE @StudentsToCreate INT = 1200;
DECLARE @EventsToCreate INT = 350;
DECLARE @MinEntriesPerEvent INT = 80;
DECLARE @MaxEntriesPerEvent INT = 450;

DECLARE @OrganizerEmail VARCHAR(100) = 'organizer.massive@event.local';
DECLARE @OrganizerEntityName VARCHAR(50) = 'Institutional Events Office';

DECLARE @BaseDate DATETIME = '2026-04-01T08:00:00';

-- Ensure required roles exist.
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RolName = 'Student')
BEGIN
    INSERT INTO dbo.Role (RolName) VALUES ('Student');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RolName = 'Organizer')
BEGIN
    INSERT INTO dbo.Role (RolName) VALUES ('Organizer');
END;

DECLARE @StudentRoleId INT = (
    SELECT TOP (1) Id
    FROM dbo.Role
    WHERE RolName = 'Student'
    ORDER BY Id
);

DECLARE @OrganizerRoleId INT = (
    SELECT TOP (1) Id
    FROM dbo.Role
    WHERE RolName = 'Organizer'
    ORDER BY Id
);

IF @StudentRoleId IS NULL OR @OrganizerRoleId IS NULL
BEGIN
    RAISERROR('Could not resolve Student/Organizer roles.', 16, 1);
    RETURN;
END;

-- Ensure organizer entity and organizer user exist.
IF NOT EXISTS (SELECT 1 FROM dbo.OrganizerEntity WHERE EntityName = @OrganizerEntityName)
BEGIN
    INSERT INTO dbo.OrganizerEntity (EntityName)
    VALUES (@OrganizerEntityName);
END;

DECLARE @OrganizerEntityId INT = (
    SELECT TOP (1) Id
    FROM dbo.OrganizerEntity
    WHERE EntityName = @OrganizerEntityName
    ORDER BY Id
);

IF @OrganizerEntityId IS NULL
BEGIN
    RAISERROR('Could not resolve organizer entity.', 16, 1);
    RETURN;
END;

IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = @OrganizerEmail)
BEGIN
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard)
    VALUES ('OrganizerPass123', 'Massive Organizer', @OrganizerEmail, 1, @OrganizerRoleId, 91000001);
END;

DECLARE @OrganizerId INT = (
    SELECT TOP (1) Id
    FROM dbo.[User]
    WHERE Email = @OrganizerEmail
    ORDER BY Id
);

IF @OrganizerId IS NULL
BEGIN
    RAISERROR('Could not resolve organizer user.', 16, 1);
    RETURN;
END;

-- Ensure categories exist.
IF NOT EXISTS (SELECT 1 FROM dbo.Category WHERE NameCategory = 'Academic')
BEGIN
    INSERT INTO dbo.Category (NameCategory) VALUES ('Academic');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Category WHERE NameCategory = 'Culture')
BEGIN
    INSERT INTO dbo.Category (NameCategory) VALUES ('Culture');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Category WHERE NameCategory = 'Sports')
BEGIN
    INSERT INTO dbo.Category (NameCategory) VALUES ('Sports');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Category WHERE NameCategory = 'Technology')
BEGIN
    INSERT INTO dbo.Category (NameCategory) VALUES ('Technology');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Category WHERE NameCategory = 'Community')
BEGIN
    INSERT INTO dbo.Category (NameCategory) VALUES ('Community');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Category WHERE NameCategory = 'Health')
BEGIN
    INSERT INTO dbo.Category (NameCategory) VALUES ('Health');
END;

-- Build categories lookup.
DECLARE @Categories TABLE (
    RowNum INT NOT NULL PRIMARY KEY,
    CategoryId INT NOT NULL
);

INSERT INTO @Categories (RowNum, CategoryId)
SELECT
    ROW_NUMBER() OVER (ORDER BY c.Id),
    c.Id
FROM dbo.Category c
WHERE c.NameCategory IN ('Academic', 'Culture', 'Sports', 'Technology', 'Community', 'Health');

DECLARE @CategoryCount INT = (SELECT COUNT(*) FROM @Categories);

IF @CategoryCount = 0
BEGIN
    RAISERROR('Could not resolve categories for massive seed.', 16, 1);
    RETURN;
END;

-- Number source for set-based generation.
;WITH Numbers AS (
    SELECT TOP (12000) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS N
    FROM sys.all_objects a
    CROSS JOIN sys.all_objects b
)
-- Massive student users (idempotent by email).
INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard)
SELECT
    'StudentPass123',
    CONCAT('Load Student ', n.N),
    CONCAT('load.student.', n.N, '@event.local'),
    1,
    @StudentRoleId,
    93000000 + n.N
FROM Numbers n
WHERE n.N <= @StudentsToCreate
  AND NOT EXISTS (
      SELECT 1
      FROM dbo.[User] u
      WHERE u.Email = CONCAT('load.student.', n.N, '@event.local')
  );

-- Massive events (idempotent by title).
;WITH Numbers AS (
    SELECT TOP (12000) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS N
    FROM sys.all_objects a
    CROSS JOIN sys.all_objects b
)
INSERT INTO dbo.Event (
    EventDate,
    Place,
    Title,
    EventDescription,
    CategoryId,
    OrganizerId,
    OrganizerEntityId,
    AvalaibleEntries,
    ApprovedState,
    ImageFileEvent
)
SELECT
    DATEADD(HOUR, (n.N % 10) + 8, DATEADD(DAY, n.N * 2, @BaseDate)),
    CONCAT('Campus Zone ', ((n.N - 1) % 25) + 1),
    CONCAT('Massive Event ', n.N),
    CONCAT('Auto-generated event for load testing. Batch #', n.N, '. Includes broad institutional participation.'),
    c.CategoryId,
    @OrganizerId,
    @OrganizerEntityId,
    @MinEntriesPerEvent + (ABS(CHECKSUM(NEWID())) % (@MaxEntriesPerEvent - @MinEntriesPerEvent + 1)),
    1,
    NULL
FROM Numbers n
INNER JOIN @Categories c
    ON c.RowNum = ((n.N - 1) % @CategoryCount) + 1
WHERE n.N <= @EventsToCreate
  AND NOT EXISTS (
      SELECT 1
      FROM dbo.Event e
      WHERE e.Title = CONCAT('Massive Event ', n.N)
  );

-- Scope events and users created for this massive seed.
DECLARE @SeedEvents TABLE (
    EventId INT NOT NULL PRIMARY KEY,
    AvalaibleEntries INT NOT NULL
);

INSERT INTO @SeedEvents (EventId, AvalaibleEntries)
SELECT e.Id, e.AvalaibleEntries
FROM dbo.Event e
WHERE e.Title LIKE 'Massive Event %';

DECLARE @SeedUsers TABLE (
    UserId INT NOT NULL PRIMARY KEY,
    RowNum INT NOT NULL UNIQUE
);

INSERT INTO @SeedUsers (UserId, RowNum)
SELECT
    u.Id,
    ROW_NUMBER() OVER (ORDER BY u.Id)
FROM dbo.[User] u
WHERE u.Email LIKE 'load.student.%@event.local';

DECLARE @SeedUserCount INT = (SELECT COUNT(*) FROM @SeedUsers);

IF @SeedUserCount = 0
BEGIN
    RAISERROR('No seeded users found to generate participation.', 16, 1);
    RETURN;
END;

-- For each seeded event, target inscriptions between 75% and 100% of available entries.
DECLARE @Targets TABLE (
    EventId INT NOT NULL PRIMARY KEY,
    TargetInscriptions INT NOT NULL,
    TargetAttendance INT NOT NULL
);

INSERT INTO @Targets (EventId, TargetInscriptions, TargetAttendance)
SELECT
    se.EventId,
    CASE
        WHEN se.AvalaibleEntries <= 1 THEN 1
        ELSE
            CAST(
                CEILING(
                    se.AvalaibleEntries *
                    (0.75 + ((ABS(CHECKSUM(CONCAT('insc', se.EventId))) % 26) / 100.0))
                ) AS INT
            )
    END,
    0
FROM @SeedEvents se;

-- Attendance between 60% and 90% of inscriptions.
UPDATE t
SET t.TargetAttendance =
    CASE
        WHEN t.TargetInscriptions <= 1 THEN 1
        ELSE
            CAST(
                CEILING(
                    t.TargetInscriptions *
                    (0.60 + ((ABS(CHECKSUM(CONCAT('att', t.EventId))) % 31) / 100.0))
                ) AS INT
            )
    END
FROM @Targets t;

-- Insert inscriptions in deterministic rotating slices per event.
INSERT INTO dbo.Inscriptions (EventId, UserId)
SELECT
    t.EventId,
    su.UserId
FROM @Targets t
INNER JOIN @SeedUsers su
    ON (((su.RowNum + (t.EventId % @SeedUserCount) - 1) % @SeedUserCount) + 1) <= CASE
                                                                                          WHEN t.TargetInscriptions > @SeedUserCount THEN @SeedUserCount
                                                                                          ELSE t.TargetInscriptions
                                                                                      END
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Inscriptions i
    WHERE i.EventId = t.EventId
      AND i.UserId = su.UserId
);

-- Attendance is a subset of inscription participants.
INSERT INTO dbo.Attendance (EventId, UserId)
SELECT
    t.EventId,
    i.UserId
FROM @Targets t
INNER JOIN (
    SELECT
        i.EventId,
        i.UserId,
        ROW_NUMBER() OVER (PARTITION BY i.EventId ORDER BY i.UserId) AS RN
    FROM dbo.Inscriptions i
    WHERE EXISTS (
        SELECT 1
        FROM @SeedEvents se
        WHERE se.EventId = i.EventId
    )
) i
    ON i.EventId = t.EventId
   AND i.RN <= t.TargetAttendance
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Attendance a
    WHERE a.EventId = i.EventId
      AND a.UserId = i.UserId
);

-- Optional extra participation: announcements from organizer for every 25th massive event.
INSERT INTO dbo.Announcement (WriterId, Title, About, Body)
SELECT
    @OrganizerId,
    CONCAT('Massive bulletin #', e.Id),
    'Participation update',
    CONCAT('Operational bulletin linked to ', e.Title, '. This announcement is auto-generated for data growth.')
FROM dbo.Event e
WHERE e.Title LIKE 'Massive Event %'
  AND (e.Id % 25 = 0)
  AND NOT EXISTS (
      SELECT 1
      FROM dbo.Announcement a
      WHERE a.Title = CONCAT('Massive bulletin #', e.Id)
  );

SELECT COUNT(*) AS TotalUsers FROM dbo.[User];
SELECT COUNT(*) AS TotalEvents FROM dbo.Event;
SELECT COUNT(*) AS TotalInscriptions FROM dbo.Inscriptions;
SELECT COUNT(*) AS TotalAttendance FROM dbo.Attendance;
SELECT COUNT(*) AS TotalAnnouncements FROM dbo.Announcement;
GO
