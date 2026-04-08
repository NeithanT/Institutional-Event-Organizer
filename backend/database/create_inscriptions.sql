DO $$
DECLARE
    students_to_create INTEGER := 200;
    event_row RECORD;
    target_inscriptions INTEGER;
    inscriptions_ratio NUMERIC;
BEGIN


    INSERT INTO "Inscriptions" ("EventId", "UserId", "InscriptionDate")
    SELECT
        e."Id",
        u."Id",
        LEAST(NOW(), e."EventDate" - INTERVAL '1 day')
    FROM (
        VALUES
            ('Bienvenida 2026', 'n.vargas.5@estudiantec.cr'),
            ('Bienvenida 2026', 'e.zhou.1@estudiantec.cr'),
            ('Taller Hackathon', 's.chaves.5@estudiantec.cr'),
            ('Taller Hackathon', 'e.zhou.1@estudiantec.cr'),
            ('Feria del Libro', 'n.vargas.5@estudiantec.cr'),
            ('Feria del Libro', 'blafaro07@gmail.com'),
            ('Copa de Fútbol', 's.chaves.5@estudiantec.cr'),
            ('Copa de Fútbol', 'blafaro07@gmail.com'),
            ('Copa de Fútbol', 'd.hernandez.7@estudiantec.cr'),
            ('Carrera Campus 5Km', 'd.hernandez.7@estudiantec.cr'),
            ('Carrera Campus 5Km', 'n.vargas.5@estudiantec.cr'),
            ('Charla sobre IA', 'e.zhou.1@estudiantec.cr'),
            ('Taller Hackathon', 'n.vargas.5@estudiantec.cr'),
            ('Feria del Libro', 'schaves0707@gmail.com'),
            ('Copa de Fútbol', 'erikzf025@gmail.com'),
            ('Carrera Campus 5Km', 'neithanvarvar@gmail.com')
    ) AS src("EventTitle", "UserEmail")
    JOIN "Event" e ON e."Title" = src."EventTitle"
    JOIN "User" u ON u."Email" = src."UserEmail"
    ON CONFLICT ("EventId", "UserId") DO NOTHING;

    FOR event_row IN
        SELECT "Id", "AvalaibleEntries", "EventDate"
        FROM "Event"
    LOOP
    
        inscriptions_ratio := 0.25 + (RANDOM() * 0.75);

        target_inscriptions := GREATEST(
            1,
            LEAST(
                students_to_create,
                CEIL(event_row."AvalaibleEntries" * inscriptions_ratio)::INTEGER
            )
        );

        INSERT INTO "Inscriptions" ("EventId", "UserId", "InscriptionDate")
        SELECT
            event_row."Id",
            u."Id",
            CASE
                WHEN event_row."EventDate" <= NOW() THEN
                    event_row."EventDate" - ((1 + FLOOR(RANDOM() * 30))::TEXT || ' days')::INTERVAL
                ELSE
                    NOW() - ((1 + FLOOR(RANDOM() * 60))::TEXT || ' days')::INTERVAL
            END
        FROM "User" u
        WHERE u."Email" LIKE 'student%@estudiantec.cr'
        ORDER BY md5(event_row."Id"::TEXT || '-' || u."Id"::TEXT)
        LIMIT target_inscriptions
        ON CONFLICT ("EventId", "UserId") DO NOTHING;
    END LOOP;
END
$$;