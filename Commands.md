# Pasos de ejecucion

- Se debe ejecutar la base de datos primero:
- ir a backend/database/
- docker compose up -d

- ahora el backend
- backend/api/
- dotnet run watch

- ahora el frontend
- frontend/
- ng serve

# Para el BackEnd
instalarse SDK .NET
instalarse Docker

Primero, tener la imagen de docker

- docker pull postgres:17-alpine

Ejecutar la base de datos sin nada:

- docker run --name eventorganizer-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=EventOrganizer -p 127.0.0.1:5432:5432 -d postgres:17-alpine

"Esto crea un contenedor PostgreSQL con el nombre eventorganizer-postgres"

Pueden ver los contenedores activos con:

- docker ps -a

Entonces para detenerlo o borrar la instancia se puede:

- docker stop eventorganizer-postgres
- docker rm eventorganizer-postgres

Ejecutarla con Volumes/Bind Mounts(Que se guarden los datos entre sesiones)

Primero se creo, el volume(un espacio en su compu):

- cd backend/database
- docker volume create postgresvol
- docker volume ls "Ver los volumen"

Ahora correr postgres con volumen:

- docker run --name eventorganizer-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=EventOrganizer -p 127.0.0.1:5432:5432 -d --mount source=postgresvol,target=/var/lib/postgresql/data postgres:17-alpine

Ahora cosas para la DB:

CREATE DATABASE users;

\c users;

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


# Para produccion
cd ~/Institutional-Event-Organizer/deploy
git pull
docker-compose up -d --build api
