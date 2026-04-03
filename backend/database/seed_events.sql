INSERT INTO "Role" ("RolName") VALUES ('Organizer')
ON CONFLICT ("RolName") DO NOTHING;

INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
SELECT 'SeedPass123', 'Seed Organizer', 'organizer@itcr.ac.cr', TRUE, r."Id", 10000001
FROM "Role" r
WHERE r."RolName" = 'Organizer'
  AND NOT EXISTS (
      SELECT 1 FROM "User" u WHERE u."Email" = 'organizer@itcr.ac.cr'
  );

INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Oficina de Eventos ITCR')
ON CONFLICT ("EntityName") DO NOTHING;

INSERT INTO "Category" ("NameCategory") VALUES ('Academic') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Culture') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Sports') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Technology') ON CONFLICT ("NameCategory") DO NOTHING;

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-02-16 09:00:00', 'Centro de las Artes', 'Bienvenida 2026', 'Evento de bienvenida para nuevos estudiantes con una visión general de los recursos institucionales.',
       c."Id", u."Id", oe."Id", 300, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer@itcr.ac.cr'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Oficina de Eventos ITCR'
WHERE c."NameCategory" = 'Academic'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Bienvenida 2026');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-04-22 14:00:00', 'B3', 'Taller Hackathon', 'Taller sobre ciberseguridad',
       c."Id", u."Id", oe."Id", 80, TRUE, TRUE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer@itcr.ac.cr'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Oficina de Eventos ITCR'
WHERE c."NameCategory" = 'Academic'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Taller Hackathon');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-05-10 10:00:00', 'Salón de la Biblioteca', 'Feria del Libro', 'Feria del libro con editoriales, charlas y actividades de lectura.',
       c."Id", u."Id", oe."Id", 250, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer@itcr.ac.cr'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Oficina de Eventos ITCR'
WHERE c."NameCategory" = 'Culture'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Feria del Libro');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-05-18 08:30:00', 'Cancha Campus Cartago', 'Copa de Fútbol', 'Torneo entre equipos de facultades.',
       c."Id", u."Id", oe."Id", 400, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer@itcr.ac.cr'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Oficina de Eventos ITCR'
WHERE c."NameCategory" = 'Sports'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Copa de Fútbol');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-05-25 07:00:00', 'Puerta Sur', 'Carrera Campus 5Km', 'Carrera alrededor del campus de 5Km.',
       c."Id", u."Id", oe."Id", 600, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer@itcr.ac.cr'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Oficina de Eventos ITCR'
WHERE c."NameCategory" = 'Sports'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Carrera Campus 5Km');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-06-05 09:30:00', 'Centro de Investigacion de Computacion', 'Charla sobre IA', 'Charlas y demostraciones sobre aplicaciones de IA en educación.',
       c."Id", u."Id", oe."Id", 220, TRUE, TRUE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer@itcr.ac.cr'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Oficina de Eventos ITCR'
WHERE c."NameCategory" = 'Technology'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Charla sobre IA');
