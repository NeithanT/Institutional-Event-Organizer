

# Para el BackEnd
instalarse SDK .NET
instalarse Docker

Primero, tener la imagen de docker

- docker pull mcr.microsoft.com/mssql/server:2022-latest

Ejecutar la base de datos sin nada:

- docker run -e "ACCEPT_EULA=Y"            -p 1433:1433            --name sqlserver2022            -d mcr.microsoft.com/mssql/server:2022-latest

"Esto crea un contenedor con esa imagen, y tiene el nombre de sqlserver2022"

Pueden ver los contenedores activos con:

- docker ps -a

Entonces para detenerlo o borrar la instancia se puede:

- docker stop sqlserver2022
- docker rm sqlserver2022

Ejecutarla con Volumes/Bind Mounts(Que se guarden los datos entre sesiones)

Primero se creo, el volume(un espacio en su compu):

- cd backend/database
- docker volume create sqlservervol
- docker volume ls "Ver los volumen"

Ahorra correr sqlserver

- docker run -e "ACCEPT_EULA=Y"            -p 1433:1433            --name sqlserver2022            -d             --mount source=sqlservervol,target=/var/lib/sqlserver mcr.microsoft.com/mssql/server:2022-latest 

Ahora cosas para la DB:

CREATE DATABASE users;

USE users;

CREATE TABLE test_table (
    somevalue VARCHAR(50)
);

INSERT INTO test_table (somevalue) VALUES ('Test Insert');

COMMIT;

SELECT somevalue FROM test_table;


Para dotnet:

- sudo dnf install dotnet-sdk-10.0 "En mi caso, instalarse .NET"

- dotnet new webapi -o backend "Crear el proyecto"
- dotnet dev-certs https --trust "Confiar en los certificados"

- dotnet run watch "Ejecutar la weada en port 5154"

# Para el Frontend


Devuelta a node js, igual hay que poner en la documentacion que lo vimos:


Instanlese node js :)

- npm install -g @angular/cli
- ng new frontend
- ng add @ng-bootstrap/ng-bootstrap
- ng serve

ahora en el localhost que se pone lo abriran en un navegador como 
http://localhost:<port>/
