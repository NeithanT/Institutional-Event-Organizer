INSERT INTO "Announcement" ("WriterId", "EventId", "Title", "About", "Body")
SELECT
    u."Id",
    e."Id",
    'Anuncio de participacion',
    'Participation update',
    'Pronto se acabaran las entradas'
FROM "User" u
JOIN "Event" e ON e."Title" = 'Bienvenida 2026'
WHERE u."Email" = 'organizer@itcr.ac.cr'
    AND NOT EXISTS (
            SELECT 1
            FROM "Announcement" a
            WHERE a."WriterId" = u."Id"
                AND a."EventId" = e."Id"
                AND a."Title" = 'Anuncio de participacion'
    );