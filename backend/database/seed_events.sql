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

-- Base data required by Event foreign keys.
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RolName = 'Organizer')
BEGIN
    INSERT INTO dbo.Role (RolName) VALUES ('Organizer');
END
GO

DECLARE @OrganizerRoleId INT = (
    SELECT TOP (1) Id
    FROM dbo.Role
    WHERE RolName = 'Organizer'
    ORDER BY Id
);

IF @OrganizerRoleId IS NULL
BEGIN
    RAISERROR('Could not resolve Organizer role.', 16, 1);
    RETURN;
END;

IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = 'organizer.seed@event.local')
BEGIN
    INSERT INTO dbo.[User] (UserPass, UserName, Email, Active, RoleId, IdCard)
    VALUES ('SeedPass123', 'Seed Organizer', 'organizer.seed@event.local', 1, @OrganizerRoleId, 10000001);
END;

DECLARE @OrganizerId INT = (
    SELECT TOP (1) Id
    FROM dbo.[User]
    WHERE Email = 'organizer.seed@event.local'
    ORDER BY Id
);

IF @OrganizerId IS NULL
BEGIN
    RAISERROR('Could not resolve organizer user.', 16, 1);
    RETURN;
END;

IF NOT EXISTS (SELECT 1 FROM dbo.OrganizerEntity WHERE EntityName = 'Institutional Events Office')
BEGIN
    INSERT INTO dbo.OrganizerEntity (EntityName) VALUES ('Institutional Events Office');
END;

DECLARE @OrganizerEntityId INT = (
    SELECT TOP (1) Id
    FROM dbo.OrganizerEntity
    WHERE EntityName = 'Institutional Events Office'
    ORDER BY Id
);

IF @OrganizerEntityId IS NULL
BEGIN
    RAISERROR('Could not resolve organizer entity.', 16, 1);
    RETURN;
END;

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
GO

DECLARE @CategoryAcademic INT = (
    SELECT TOP (1) Id FROM dbo.Category WHERE NameCategory = 'Academic' ORDER BY Id
);
DECLARE @CategoryCulture INT = (
    SELECT TOP (1) Id FROM dbo.Category WHERE NameCategory = 'Culture' ORDER BY Id
);
DECLARE @CategorySports INT = (
    SELECT TOP (1) Id FROM dbo.Category WHERE NameCategory = 'Sports' ORDER BY Id
);
DECLARE @CategoryTech INT = (
    SELECT TOP (1) Id FROM dbo.Category WHERE NameCategory = 'Technology' ORDER BY Id
);
DECLARE @OrganizerId INT = (
    SELECT TOP (1) Id FROM dbo.[User] WHERE Email = 'organizer.seed@event.local' ORDER BY Id
);
DECLARE @OrganizerEntityId INT = (
    SELECT TOP (1) Id FROM dbo.OrganizerEntity WHERE EntityName = 'Institutional Events Office' ORDER BY Id
);

IF @CategoryAcademic IS NULL OR @CategoryCulture IS NULL OR @CategorySports IS NULL OR @CategoryTech IS NULL
BEGIN
    RAISERROR('Could not resolve one or more categories.', 16, 1);
    RETURN;
END;

IF @OrganizerId IS NULL OR @OrganizerEntityId IS NULL
BEGIN
    RAISERROR('Could not resolve organizer references.', 16, 1);
    RETURN;
END;

-- Insert at least 10 events. Safe to re-run: each INSERT checks Title.
IF NOT EXISTS (SELECT 1 FROM dbo.Event WHERE Title = 'Orientation Day 2026')
BEGIN
    INSERT INTO dbo.Event (EventDate, Place, Title, EventDescription, CategoryId, OrganizerId, OrganizerEntityId, AvalaibleEntries, ApprovedState, IsVirtual)
    VALUES ('2026-04-15T09:00:00', 'Main Auditorium', 'Orientation Day 2026', 'Welcome event for new students with institutional resources overview.', @CategoryAcademic, @OrganizerId, @OrganizerEntityId, 300, 1, 0);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Event WHERE Title = 'Research Methods Workshop')
BEGIN
    INSERT INTO dbo.Event (EventDate, Place, Title, EventDescription, CategoryId, OrganizerId, OrganizerEntityId, AvalaibleEntries, ApprovedState, IsVirtual)
    VALUES ('2026-04-22T14:00:00', 'Building B - Room 204', 'Research Methods Workshop', 'Practical workshop on qualitative and quantitative research methods.', @CategoryAcademic, @OrganizerId, @OrganizerEntityId, 80, 1, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Event WHERE Title = 'Spring Cultural Festival')
BEGIN
    INSERT INTO dbo.Event (EventDate, Place, Title, EventDescription, CategoryId, OrganizerId, OrganizerEntityId, AvalaibleEntries, ApprovedState, IsVirtual)
    VALUES ('2026-05-03T16:00:00', 'Central Plaza', 'Spring Cultural Festival', 'Open festival featuring music, dance, and student art displays.', @CategoryCulture, @OrganizerId, @OrganizerEntityId, 500, 1, 0);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Event WHERE Title = 'University Book Fair')
BEGIN
    INSERT INTO dbo.Event (EventDate, Place, Title, EventDescription, CategoryId, OrganizerId, OrganizerEntityId, AvalaibleEntries, ApprovedState, IsVirtual)
    VALUES ('2026-05-10T10:00:00', 'Library Hall', 'University Book Fair', 'Book fair with publishers, talks, and reading activities.', @CategoryCulture, @OrganizerId, @OrganizerEntityId, 250, 1, 0);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Event WHERE Title = 'Interfaculty Soccer Cup')
BEGIN
    INSERT INTO dbo.Event (EventDate, Place, Title, EventDescription, CategoryId, OrganizerId, OrganizerEntityId, AvalaibleEntries, ApprovedState, IsVirtual)
    VALUES ('2026-05-18T08:30:00', 'Campus Stadium', 'Interfaculty Soccer Cup', 'Tournament between faculty teams with semifinal and final matches.', @CategorySports, @OrganizerId, @OrganizerEntityId, 400, 1, 0);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Event WHERE Title = '5K Campus Run')
BEGIN
    INSERT INTO dbo.Event (EventDate, Place, Title, EventDescription, CategoryId, OrganizerId, OrganizerEntityId, AvalaibleEntries, ApprovedState, IsVirtual)
    VALUES ('2026-05-25T07:00:00', 'South Gate', '5K Campus Run', 'Community 5K run with hydration points and medals.', @CategorySports, @OrganizerId, @OrganizerEntityId, 600, 1, 0);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Event WHERE Title = 'AI for Education Summit')
BEGIN
    INSERT INTO dbo.Event (EventDate, Place, Title, EventDescription, CategoryId, OrganizerId, OrganizerEntityId, AvalaibleEntries, ApprovedState, IsVirtual)
    VALUES ('2026-06-05T09:30:00', 'Innovation Center', 'AI for Education Summit', 'Talks and demos on responsible AI applications in education.', @CategoryTech, @OrganizerId, @OrganizerEntityId, 220, 1, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Event WHERE Title = 'Cybersecurity Awareness Day')
BEGIN
    INSERT INTO dbo.Event (EventDate, Place, Title, EventDescription, CategoryId, OrganizerId, OrganizerEntityId, AvalaibleEntries, ApprovedState, IsVirtual)
    VALUES ('2026-06-12T11:00:00', 'Building C - Lab 3', 'Cybersecurity Awareness Day', 'Hands-on sessions on password security and phishing prevention.', @CategoryTech, @OrganizerId, @OrganizerEntityId, 120, 1, 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Event WHERE Title = 'Community Volunteering Fair')
BEGIN
    INSERT INTO dbo.Event (EventDate, Place, Title, EventDescription, CategoryId, OrganizerId, OrganizerEntityId, AvalaibleEntries, ApprovedState, IsVirtual)
    VALUES ('2026-06-20T15:00:00', 'North Courtyard', 'Community Volunteering Fair', 'NGOs and student groups present volunteering opportunities.', @CategoryCulture, @OrganizerId, @OrganizerEntityId, 180, 1, 0);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Event WHERE Title = 'Final Projects Expo')
BEGIN
    INSERT INTO dbo.Event (EventDate, Place, Title, EventDescription, CategoryId, OrganizerId, OrganizerEntityId, AvalaibleEntries, ApprovedState, IsVirtual)
    VALUES ('2026-06-28T10:00:00', 'Engineering Pavilion', 'Final Projects Expo', 'Showcase of capstone projects and innovation prototypes.', @CategoryAcademic, @OrganizerId, @OrganizerEntityId, 350, 1, 0);
END;

SELECT COUNT(*) AS TotalEvents FROM dbo.Event;
GO
