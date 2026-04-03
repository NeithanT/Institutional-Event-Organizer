INSERT INTO "Role" ("RolName") VALUES ('Student') ON CONFLICT ("RolName") DO NOTHING;
INSERT INTO "Role" ("RolName") VALUES ('Organizer') ON CONFLICT ("RolName") DO NOTHING;

INSERT INTO "User" ("UserPass", "UserName", "Email", "Active", "RoleId", "IdCard")
SELECT 'UserPass123', src."UserName", src."Email", TRUE, r."Id", src."IdCard"
FROM (
    VALUES
        ('Ana Rojas', 'neithanvarvar@gmail.com', 20000001),
        ('Bruno Diaz', 'erikzf025@gmail.com', 20000002),
        ('Diego Ramirez', 'schaves0707@gmail.com', 20000004),
        ('Gabriela Soto', 'blafaro07@gmail.com', 20000007),
        ('Karla Mendoza', 'hernandezfabricio420@gmail.com', 20000011),
        ('Lucas Guzman', 'dayannahernandezcr@gmail.com', 20000012)
) AS src("UserName", "Email", "IdCard")
JOIN "Role" r ON r."RolName" = 'Student'
ON CONFLICT ("Email") DO NOTHING;

INSERT INTO "Inscriptions" ("EventId", "UserId")
SELECT e."Id", u."Id"
FROM (
    VALUES
        ('Orientation Day 2026', 'neithanvarvar@gmail.com'),
        ('Orientation Day 2026', 'erikzf025@gmail.com'),
        ('Research Methods Workshop', 'schaves0707@gmail.com'),
        ('Research Methods Workshop', 'erikzf025@gmail.com'),
        ('Spring Cultural Festival', 'neithanvarvar@gmail.com'),
        ('Spring Cultural Festival', 'blafaro07@gmail.com'),
        ('University Book Fair', 'schaves0707@gmail.com'),
        ('Interfaculty Soccer Cup', 'blafaro07@gmail.com'),
        ('Interfaculty Soccer Cup', 'hernandezfabricio420@gmail.com'),
        ('5K Campus Run', 'dayannahernandezcr@gmail.com'),
        ('5K Campus Run', 'neithanvarvar@gmail.com'),
        ('AI for Education Summit', 'erikzf025@gmail.com'),
        ('Cybersecurity Awareness Day', 'neithanvarvar@gmail.com'),
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

SELECT COUNT(*) AS "TotalUsers" FROM "User";
SELECT COUNT(*) AS "TotalInscriptions" FROM "Inscriptions";
SELECT COUNT(*) AS "TotalAttendance" FROM "Attendance";
