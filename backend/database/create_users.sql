INSERT INTO "Role" ("RolName") VALUES ('Student') ON CONFLICT ("RolName") DO NOTHING;
INSERT INTO "Role" ("RolName") VALUES ('Organizer') ON CONFLICT ("RolName") DO NOTHING;
INSERT INTO "Role" ("RolName") VALUES ('Admin') ON CONFLICT ("RolName") DO NOTHING;


INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
SELECT 'admin123!', 'admin', 'admin@itcr.ac.cr', TRUE, r."Id", 2000000000
FROM "Role" r
WHERE r."RolName" = 'Admin'
ON CONFLICT ("Email") DO NOTHING;

INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
SELECT 'organizer123!', 'Main Organizer', 'organizer@itcr.ac.cr', TRUE, r."Id", 10000001
FROM "Role" r
WHERE r."RolName" = 'Organizer'
ON CONFLICT ("Email") DO NOTHING;


INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
SELECT 'UserPass123', src."UserName", src."Email", TRUE, r."Id", src."IdCard"
FROM (
    VALUES
        ('Neithan Vargas Vargas', 'n.vargas.5@estudiantec.cr', 1950000000),
        ('Erik Zhou Feng', 'e.zhou.1@estudiantec.cr', 1950000002),
        ('Sebastian Chaves Rojas', 's.chaves.5@estudiantec.cr', 1950000004),
        ('Dayanna Hernandez Castellon', 'd.hernandez.7@estudiantec.cr', 1950000012)
) AS src("UserName", "Email", "IdCard")
JOIN "Role" r ON r."RolName" = 'Admin'
ON CONFLICT ("Email") DO NOTHING;

INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
SELECT 'UserPass123', src."UserName", src."Email", TRUE, r."Id", src."IdCard"
FROM (
    VALUES
        ('Neithan Vargas Vargas', 'neithanvarvar@gmail.com', 2025149384),
        ('Erik Zhou Feng', 'erikzf025@gmail.com', 2025000002),
        ('Sebastian Chaves Rojas', 'schaves0707@gmail.com', 2025000004),
        ('Emmanuel Blanco Alfaro', 'blafaro07@gmail.com', 2025000007),
        ('Fabricio Hernandez', 'hernandezfabricio420@gmail.com', 2025000011),
        ('Dayanna Hernandez Castellon', 'dayannahernandezcr@gmail.com', 2025000012)
) AS src("UserName", "Email", "IdCard")
JOIN "Role" r ON r."RolName" = 'Student'
ON CONFLICT ("Email") DO NOTHING;

INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
SELECT
    'StudentPass123',
    'Student ' || gs::TEXT,
    'student' || gs::TEXT || '@estudiantec.cr',
    TRUE,
    r."Id",
    2000000000 + gs
FROM generate_series(1, 200) AS gs
JOIN "Role" r ON r."RolName" = 'Student'
ON CONFLICT ("Email") DO NOTHING;