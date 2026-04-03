
INSERT INTO "Category" ("NameCategory") VALUES ('Academico') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Cultural') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Deportivo') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Tecnologico') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Comunitario') ON CONFLICT ("NameCategory") DO NOTHING;
INSERT INTO "Category" ("NameCategory") VALUES ('Salud') ON CONFLICT ("NameCategory") DO NOTHING;

INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Oficina de Eventos ITCR') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('FEITEC') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Administración de Empresas') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Administración de Tecnologías de Información') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Agronegocios') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Biología') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ciencia e Ingeniería de los Materiales') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ciencias del Lenguaje') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ciencias Sociales') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Cultura y Deporte') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Diseño Industrial') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Física') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería Agrícola') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería Electromecánica') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería Electrónica') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería en Agronomía') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería en Computación') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería en Computadores') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería en Construcción') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería en Producción Industrial') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería en Seguridad Laboral e Higiene Ambiental') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería Forestal') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Ingeniería Mecatrónica') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Matemática') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Escuela de Química') ON CONFLICT ("EntityName") DO NOTHING;
INSERT INTO "OrganizerEntity" ("EntityName") VALUES ('Otro') ON CONFLICT ("EntityName") DO NOTHING;


INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-02-16 09:00:00', 'Centro de las Artes', 'Bienvenida 2026', 'Evento de bienvenida para nuevos estudiantes con una visión general de los recursos institucionales.',
       c."Id", u."Id", oe."Id", 300, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer@itcr.ac.cr'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Oficina de Eventos ITCR'
WHERE c."NameCategory" = 'Academico'
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
WHERE c."NameCategory" = 'Academico'
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
WHERE c."NameCategory" = 'Cultural'
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
WHERE c."NameCategory" = 'Deportivo'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Copa de Fútbol');

INSERT INTO "Event" (
    "EventDate", "Place", "Title", "EventDescription", "CategoryId",
    "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState", "IsVirtual"
)
SELECT TIMESTAMP '2026-05-25 07:00:00', 'Forestal', 'Carrera Campus 5Km', 'Carrera alrededor del campus de 5Km.',
       c."Id", u."Id", oe."Id", 600, TRUE, FALSE
FROM "Category" c
JOIN "User" u ON u."Email" = 'organizer@itcr.ac.cr'
JOIN "OrganizerEntity" oe ON oe."EntityName" = 'Oficina de Eventos ITCR'
WHERE c."NameCategory" = 'Deportivo'
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
WHERE c."NameCategory" = 'Tecnologico'
  AND NOT EXISTS (SELECT 1 FROM "Event" e WHERE e."Title" = 'Charla sobre IA');
