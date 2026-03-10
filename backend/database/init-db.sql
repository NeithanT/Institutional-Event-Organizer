CREATE DATABASE Tarea01;
GO

USE Tarea01;
GO

CREATE TABLE Usuario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre varchar(64) NOT NULL,
    Salario money NOT NULL
);

INSERT INTO Empleado (Nombre, Salario)
VALUES ('Juan Perez', 200000.00)

GO