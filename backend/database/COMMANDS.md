Run docker with everything:

docker compose up -d

Run the container alone

docker run -e "ACCEPT_EULA=Y"     -e "MSSQL_SA_PASSWORD=YourStrong1Pass"       -p 1433:1433            --name sqlserver2022            -d mcr.microsoft.com/mssql/server:2022-latest

Connect to the container:

docker exec -it sqlserver2022 bash