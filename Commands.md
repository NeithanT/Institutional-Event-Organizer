

# Para el BackEnd
instalarse SDK .NET
instalarse Docker

- sudo dnf install dotnet-sdk-10.0 "En mi caso"
- dotnet new webapi -o backend "Crear el proyecto"
- dotnet dev-certs https --trust "Confiar en los certificados"

- dotnet run watch "Ejecutar la weada en port 5154"

# Para el Frontend

Es solo html estatico entonces copien el index.html (el camino/ruta)
y lo pegan en su browser como file:///ruta



Se cancela el node js, igual hay que poner en la documentacion que lo vimos:


Instanlese node js :)

- cd frontend "Ir al proyecto"
- npm init "Inicializa node"
- npm install bootstrap@5.3.0-alpha1
- npm run "Ejecutar la wea"

ahora en el localhost que se pone lo abriran en un navegador como 
http://localhost:<port>/