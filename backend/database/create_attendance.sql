INSERT INTO "Attendance" ("EventId", "UserId")
SELECT e."Id", u."Id"
FROM (
    VALUES
        ('Bienvenida 2026', 'neithanvarvar@gmail.com'),
        ('Bienvenida 2026', 'erikzf025@gmail.com'),
        ('Taller Hackathon', 'erikzf025@gmail.com'),
        ('Feria del Libro', 'neithanvarvar@gmail.com'),
        ('Copa de Fútbol', 'schaves0707@gmail.com'),
        ('Copa de Fútbol', 'blafaro07@gmail.com'),
        ('Carrera Campus 5Km', 'neithanvarvar@gmail.com'),
        ('Charla sobre IA', 'erikzf025@gmail.com'),
        ('Charla sobre IA', 'neithanvarvar@gmail.com'),
        ('Feria del Libro', 'schaves0707@gmail.com')
) AS src("EventTitle", "UserEmail")
JOIN "Event" e ON e."Title" = src."EventTitle"
JOIN "User" u ON u."Email" = src."UserEmail"
ON CONFLICT ("EventId", "UserId") DO NOTHING;

DO $$
DECLARE
    event_row RECORD;
    target_attendance INTEGER;
    attendance_seed BIGINT;
    attendance_ratio NUMERIC;
BEGIN
    FOR event_row IN
        SELECT e."Id", COUNT(i."Id")::INTEGER AS inscription_count
        FROM "Event" e
        LEFT JOIN "Inscriptions" i ON i."EventId" = e."Id"
        GROUP BY e."Id"
    LOOP
        IF event_row.inscription_count = 0 THEN
            CONTINUE;
        END IF;

        attendance_seed := ABS((('x' || SUBSTR(md5(event_row."Id"::TEXT || '-attendance'), 1, 8))::bit(32)::int)::BIGINT);
        attendance_ratio := 0.40 + ((attendance_seed::NUMERIC / 4294967295.0) * 0.60);

        target_attendance := GREATEST(
            1,
            LEAST(
                event_row.inscription_count,
                CEIL(event_row.inscription_count * attendance_ratio)::INTEGER
            )
        );

        INSERT INTO "Attendance" ("EventId", "UserId")
        SELECT event_row."Id", src."UserId"
        FROM (
            SELECT i."UserId"
            FROM "Inscriptions" i
            WHERE i."EventId" = event_row."Id"
            ORDER BY md5(event_row."Id"::TEXT || '-' || i."UserId"::TEXT || '-attendance')
            LIMIT target_attendance
        ) AS src
        ON CONFLICT ("EventId", "UserId") DO NOTHING;
    END LOOP;
END
$$;
