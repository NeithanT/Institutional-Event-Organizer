INSERT INTO "Role" ("RolName") VALUES ('Organizer')
ON CONFLICT ("RolName") DO NOTHING;

INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
SELECT 'SeedPass123', 'Seed Organizer', 'organizer.seed@event.local', TRUE, r."Id", 10000001
FROM "Role" r
WHERE r."RolName" = 'Organizer'
  AND NOT EXISTS (
      SELECT 1 FROM "User" u WHERE u."Email" = 'organizer.seed@event.local'
  );

INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Institutional Events Office')
ON CONFLICT ("EntityName") DO NOTHING;

INSERT INTO "Category" ("NameCategory") VALUES ('Academic') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Culture') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Sports') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Technology') ON CONFLICT ("NameCategory") DO NOTHING;

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-04-15 09:00:00', 'Main Auditorium', 'Orientation Day 2026', 'Welcome event for new students with institutional resources overview.',
       c."Id", u."Id", oe."Id", 300, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer.seed@event.local'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Institutional Events Office'
WHERE c."NameCategory" = 'Academic'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Orientation Day 2026');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-04-22 14:00:00', 'Building B - Room 204', 'Research Methods Workshop', 'Practical workshop on qualitative and quantitative research methods.',
       c."Id", u."Id", oe."Id", 80, TRUE, TRUE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer.seed@event.local'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Institutional Events Office'
WHERE c."NameCategory" = 'Academic'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Research Methods Workshop');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-05-03 16:00:00', 'Central Plaza', 'Spring Cultural Festival', 'Open festival featuring music, dance, and student art displays.',
       c."Id", u."Id", oe."Id", 500, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer.seed@event.local'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Institutional Events Office'
WHERE c."NameCategory" = 'Culture'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Spring Cultural Festival');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-05-10 10:00:00', 'Library Hall', 'University Book Fair', 'Book fair with publishers, talks, and reading activities.',
       c."Id", u."Id", oe."Id", 250, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer.seed@event.local'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Institutional Events Office'
WHERE c."NameCategory" = 'Culture'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'University Book Fair');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-05-18 08:30:00', 'Campus Stadium', 'Interfaculty Soccer Cup', 'Tournament between faculty teams with semifinal and final matches.',
       c."Id", u."Id", oe."Id", 400, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer.seed@event.local'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Institutional Events Office'
WHERE c."NameCategory" = 'Sports'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Interfaculty Soccer Cup');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-05-25 07:00:00', 'South Gate', '5K Campus Run', 'Community 5K run with hydration points and medals.',
       c."Id", u."Id", oe."Id", 600, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer.seed@event.local'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Institutional Events Office'
WHERE c."NameCategory" = 'Sports'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = '5K Campus Run');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-06-05 09:30:00', 'Innovation Center', 'AI for Education Summit', 'Talks and demos on responsible AI applications in education.',
       c."Id", u."Id", oe."Id", 220, TRUE, TRUE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer.seed@event.local'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Institutional Events Office'
WHERE c."NameCategory" = 'Technology'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'AI for Education Summit');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-06-12 11:00:00', 'Building C - Lab 3', 'Cybersecurity Awareness Day', 'Hands-on sessions on password security and phishing prevention.',
       c."Id", u."Id", oe."Id", 120, TRUE, TRUE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer.seed@event.local'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Institutional Events Office'
WHERE c."NameCategory" = 'Technology'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Cybersecurity Awareness Day');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-06-20 15:00:00', 'North Courtyard', 'Community Volunteering Fair', 'NGOs and student groups present volunteering opportunities.',
       c."Id", u."Id", oe."Id", 180, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer.seed@event.local'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Institutional Events Office'
WHERE c."NameCategory" = 'Culture'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Community Volunteering Fair');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-06-28 10:00:00', 'Engineering Pavilion', 'Final Projects Expo', 'Showcase of capstone projects and innovation prototypes.',
       c."Id", u."Id", oe."Id", 350, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer.seed@event.local'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Institutional Events Office'
WHERE c."NameCategory" = 'Academic'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Final Projects Expo');

SELECT COUNT(*) AS "TotalEvents" FROM "Event";
