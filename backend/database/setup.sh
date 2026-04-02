#!/bin/bash

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &
SQL_PID=$!

sleep 10s
/opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1 -U sa -P "$MSSQL_SA_PASSWORD" -d master -i /usr/src/app/initdb.sql -C

sleep 10s
/opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1 -U sa -P "$MSSQL_SA_PASSWORD" -d master -i /usr/src/app/seed_events.sql -C

sleep 10s
/opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1 -U sa -P "$MSSQL_SA_PASSWORD" -d master -i /usr/src/app/seed_users_inscriptions_attendance.sql -C

sleep 10s
/opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1 -U sa -P "$MSSQL_SA_PASSWORD" -d master -i /usr/src/app/seed_massive_participation.sql -C

wait $SQL_PID