#!/bin/bash

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &
SQL_PID=$!

for i in {1..50}; do
    /opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1 -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "SELECT 1" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "SQL Server is up - executing init script"
        /opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1 -U sa -P "$MSSQL_SA_PASSWORD" -d master -i /usr/src/app/initdb.sql -C
        echo "Init script completed. SQL Server is ready for connections."
        break
    else
        echo "SQL Server not ready yet... ($i/50)"
        sleep 2
    fi
done

wait $SQL_PID