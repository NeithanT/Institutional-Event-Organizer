DO $$
DECLARE
    students_to_create INTEGER := 300;
    events_to_create INTEGER := 50;
    min_entries_per_event INTEGER := 80;
    max_entries_per_event INTEGER := 450;

    organizer_email VARCHAR(100) := 'organizer@itcr.ac.cr';
    organizer_entity_name VARCHAR(50) := 'Oficina de Eventos ITCR';
    base_date TIMESTAMP := TIMESTAMP '2026-04-01 08:00:00';

    student_role_id INTEGER;
    organizer_role_id INTEGER;
    organizer_entity_id INTEGER;
    organizer_id INTEGER;
    i INTEGER;
    event_row RECORD;
    target_inscriptions INTEGER;
    target_attendance INTEGER;
BEGIN
    INSERT INTO "Role" ("RolName") VALUES ('Student') ON CONFLICT ("RolName") DO NOTHING;
    INSERT INTO "Role" ("RolName") VALUES ('Organizer') ON CONFLICT ("RolName") DO NOTHING;
    INSERT INTO "Role" ("RolName") VALUES ('Admin') ON CONFLICT ("RolName") DO NOTHING;

    SELECT "Id" INTO student_role_id FROM "Role" WHERE "RolName" = 'Student' LIMIT 1;
    SELECT "Id" INTO organizer_role_id FROM "Role" WHERE "RolName" = 'Organizer' LIMIT 1;
    SELECT "Id" INTO admin_role_id FROM "Role" WHERE "RolName" = 'Admin' LIMIT 1;

    INSERT INTO "OrganizerEntity" ("EntityName") VALUES (organizer_entity_name)
    ON CONFLICT ("EntityName") DO NOTHING;

    SELECT "Id" INTO organizer_entity_id
    FROM "OrganizerEntity"
    WHERE "EntityName" = organizer_entity_name
    LIMIT 1;

    INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
    VALUES ('admin123!', 'admin', 'admin@itcr.ac.cr', TRUE, admin_role_id, 2000000000)
    ON CONFLICT ("Email") DO NOTHING;

    INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
    SELECT 'Organizer123!', 'Main Organizer', organizer_email, TRUE, organizer_role_id, 91000001
    WHERE NOT EXISTS (
        SELECT 1 FROM "User" u WHERE u."Email" = organizer_email
    );

    SELECT "Id" INTO organizer_id FROM "User" WHERE "Email" = organizer_email LIMIT 1;

    INSERT INTO "Category" ("NameCategory") VALUES ('Academic') ON CONFLICT ("NameCategory") DO NOTHING;
    INSERT INTO "Category" ("NameCategory") VALUES ('Culture') ON CONFLICT ("NameCategory") DO NOTHING;
    INSERT INTO "Category" ("NameCategory") VALUES ('Sports') ON CONFLICT ("NameCategory") DO NOTHING;
    INSERT INTO "Category" ("NameCategory") VALUES ('Technology') ON CONFLICT ("NameCategory") DO NOTHING;
    INSERT INTO "Category" ("NameCategory") VALUES ('Community') ON CONFLICT ("NameCategory") DO NOTHING;
    INSERT INTO "Category" ("NameCategory") VALUES ('Health') ON CONFLICT ("NameCategory") DO NOTHING;

    FOR i IN 1..students_to_create LOOP
        INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
        VALUES (
            'StudentPass123',
            'Student ' || i,
            'student' || i || '@estudiantec.cr',
            TRUE,
            student_role_id,
            93000000 + i
        )
        ON CONFLICT ("Email") DO NOTHING;
    END LOOP;

    FOR i IN 1..events_to_create LOOP
        INSERT INTO "Event" (
            "EventDate", "Place", "Title", "EventDescription", "CategoryId",
            "OrganizerId", "OrganizerEntityId", "AvalaibleEntries", "ApprovedState",
            "ImageFileEvent", "IsVirtual"
        )
        SELECT
            base_date
                + (i * INTERVAL '2 days')
                + (((i % 10) + 8) || ' hours')::INTERVAL,
            'Campus Zone ' || (((i - 1) % 25) + 1),
            'Massive Event ' || i,
            'Auto-generated event for load testing. Batch #' || i || '. Includes broad institutional participation.',
            c."Id",
            organizer_id,
            organizer_entity_id,
            min_entries_per_event + FLOOR(RANDOM() * (max_entries_per_event - min_entries_per_event + 1))::INTEGER,
            TRUE,
            NULL,
            CASE WHEN (i % 5) = 0 THEN TRUE ELSE FALSE END
        FROM "Category" c
        WHERE c."NameCategory" = (
            ARRAY['Academic', 'Culture', 'Sports', 'Technology', 'Community', 'Health']
        )[((i - 1) % 6) + 1]
          AND NOT EXISTS (
              SELECT 1 FROM "Event" e WHERE e."Title" = 'Massive Event ' || i
          );
    END LOOP;

    FOR event_row IN
        SELECT "Id", "AvalaibleEntries"
        FROM "Event"
        WHERE "Title" LIKE 'Massive Event %'
    LOOP
        target_inscriptions := GREATEST(
            1,
            LEAST(
                students_to_create,
                CEIL(event_row."AvalaibleEntries" * (0.75 + RANDOM() * 0.25))::INTEGER
            )
        );

        target_attendance := GREATEST(
            1,
            LEAST(
                target_inscriptions,
                CEIL(target_inscriptions * (0.60 + RANDOM() * 0.30))::INTEGER
            )
        );

        INSERT INTO "Inscriptions" ("EventId", "UserId")
        SELECT event_row."Id", u."Id"
        FROM "User" u
        WHERE u."Email" LIKE 'student.%@estudiantec.cr'
        ORDER BY md5(event_row."Id"::TEXT || '-' || u."Id"::TEXT)
        LIMIT target_inscriptions
        ON CONFLICT ("EventId", "UserId") DO NOTHING;

        INSERT INTO "Attendance" ("EventId", "UserId")
        SELECT event_row."Id", src."UserId"
        FROM (
            SELECT i."UserId"
            FROM "Inscriptions" i
            WHERE i."EventId" = event_row."Id"
            ORDER BY i."UserId"
            LIMIT target_attendance
        ) AS src
        ON CONFLICT ("EventId", "UserId") DO NOTHING;
    END LOOP;

    INSERT INTO "Announcement" ("WriterId", "Title", "About", "Body")
    SELECT
        organizer_id,
        'Massive bulletin #' || e."Id",
        'Participation update',
        'Operational bulletin linked to ' || e."Title" || '. This announcement is auto-generated for data growth.'
    FROM "Event" e
    WHERE e."Title" LIKE 'Massive Event %'
      AND (e."Id" % 25 = 0)
      AND NOT EXISTS (
          SELECT 1
          FROM "Announcement" a
          WHERE a."Title" = 'Massive bulletin #' || e."Id"
      );

END
$$;
