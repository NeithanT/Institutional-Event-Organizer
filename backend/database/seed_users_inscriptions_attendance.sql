INSERT INTO "Role" ("RolName") VALUES ('Student') ON CONFLICT ("RolName") DO NOTHING;
INSERT INTO "Role" ("RolName") VALUES ('Organizer') ON CONFLICT ("RolName") DO NOTHING;

INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
SELECT 'UserPass123', src."UserName", src."Email", TRUE, r."Id", src."IdCard"
FROM (
    VALUES
        ('Neithan Vargas Vargas', 'n.vargas.5@estudiantec.cr', 2025149384),
        ('Erik Zhou Feng', 'e.zhou.1@estudiantec.cr', 2025000002),
        ('Sebastian Chaves Rojas', 's.chaves.5@estudiantec.cr', 2025000004),
        ('Dayanna Hernandez Castellon', 'd.hernandez.7@estudiantec.cr', 2025000012)
) AS src("UserName", "Email", "IdCard")
JOIN "Role" r ON r."RolName" = 'Student'
ON CONFLICT ("Email") DO NOTHING;

INSERT INTO "Inscriptions" ("EventId", "UserId")
SELECT e."Id", u."Id"
FROM (
    VALUES
        ('Orientation Day 2026', 'n.vargas.5@estudiantec.cr'),
        ('Orientation Day 2026', 'e.zhou.1@estudiantec.cr'),
        ('Research Methods Workshop', 's.chaves.5@estudiantec.cr'),
        ('Research Methods Workshop', 'e.zhou.1@estudiantec.cr'),
        ('Spring Cultural Festival', 'n.vargas.5@estudiantec.cr'),
        ('Spring Cultural Festival', 'b.lafaro.7@estudiantec.cr'),
        ('University Book Fair', 's.chaves.4@estudiantec.cr'),
        ('Interfaculty Soccer Cup', 'b.lafaro.7@estudiantec.cr'),
        ('Interfaculty Soccer Cup', 'd.hernandez.7@estudiantec.cr'),
        ('5K Campus Run', 'd.hernandez.7@estudiantec.cr'),
        ('5K Campus Run', 'n.vargas.5@estudiantec.cr'),
        ('AI for Education Summit', 'e.zhou.1@estudiantec.cr'),
        ('Cybersecurity Awareness Day', 'n.vargas.5@estudiantec.cr'),
        ('Community Volunteering Fair', 'schaves0707@gmail.com'),
        ('Final Projects Expo', 'erikzf025@gmail.com'),
        ('Final Projects Expo', 'neithanvarvar@gmail.com')
) AS src("EventTitle", "UserEmail")
JOIN "Event" e ON e."Title" = src."EventTitle"
JOIN "User" u ON u."Email" = src."UserEmail"
ON CONFLICT ("EventId", "UserId") DO NOTHING;

INSERT INTO "Attendance" ("EventId", "UserId")
SELECT e."Id", u."Id"
FROM (
    VALUES
        ('Orientation Day 2026', 'neithanvarvar@gmail.com'),
        ('Orientation Day 2026', 'erikzf025@gmail.com'),
        ('Research Methods Workshop', 'erikzf025@gmail.com'),
        ('Spring Cultural Festival', 'neithanvarvar@gmail.com'),
        ('University Book Fair', 'schaves0707@gmail.com'),
        ('Interfaculty Soccer Cup', 'blafaro07@gmail.com'),
        ('5K Campus Run', 'neithanvarvar@gmail.com'),
        ('AI for Education Summit', 'erikzf025@gmail.com'),
        ('Cybersecurity Awareness Day', 'neithanvarvar@gmail.com'),
        ('Final Projects Expo', 'neithanvarvar@gmail.com')
) AS src("EventTitle", "UserEmail")
JOIN "Event" e ON e."Title" = src."EventTitle"
JOIN "User" u ON u."Email" = src."UserEmail"
ON CONFLICT ("EventId", "UserId") DO NOTHING;
