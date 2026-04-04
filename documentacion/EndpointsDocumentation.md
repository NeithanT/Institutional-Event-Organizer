# Documentación de Endpoints

Este documento resume los endpoints definidos en el backend y actualiza los cambios recientes de rutas.

Base URL sugerida para pruebas locales: `https://localhost:5001`

## Notas generales

- Las rutas de gestión de eventos del organizador usan `organizer/my-events` para listados y detalle.
- El registro de usuarios es `/user/register`.
- Los endpoints de estudiante para eventos e inscripciones están bajo el prefijo `/api`.

## Autenticación

### 1) Iniciar sesión

- Método: `POST`
- Ruta: `/user/auth`
- ¿Qué hace?: Autentica con correo y contraseña.
- Body mínimo (JSON):

```json
{
  "Email": "estudiante@estudiantec.cr",
  "Password": "Passw0rd!"
}
```

### 2) Registro de usuario (rol estudiante)

- Método: `POST`
- Ruta: `/user/register`
- ¿Qué hace?: Registra un usuario validando dominio institucional y formato de contraseña.
- Body mínimo (JSON):

```json
{
  "Name": "Ana",
  "LastName": "Soto",
  "IdCard": 2034500001,
  "Email": "ana.soto@estudiantec.cr",
  "Password": "Passw0rd!"
}
```

## Estudiante

### 1) Listar eventos aprobados con filtros opcionales

- Método: `GET`
- Ruta: `/api/events`
- Query params opcionales: `category`, `modality`, `organizerEntity`, `date` (`yyyy-MM-dd`)
- ¿Qué hace?: Devuelve eventos aprobados aplicando filtros.
- Ejemplo: `/api/events?category=Arte&date=2026-05-20`

### 2) Obtener evento por id

- Método: `GET`
- Ruta: `/api/events/{id:int}`
- ¿Qué hace?: Devuelve detalle de un evento aprobado por id.
- Ejemplo: `/api/events/15`

### 3) Listar inscripciones de un usuario

- Método: `GET`
- Ruta: `/api/inscripciones`
- Query param requerido: `userId`
- ¿Qué hace?: Lista las inscripciones del usuario.
- Ejemplo: `/api/inscripciones?userId=203`

### 4) Crear inscripción

- Método: `POST`
- Ruta: `/api/inscripciones`
- ¿Qué hace?: Inscribe un usuario a un evento.
- Body mínimo (JSON):

```json
{
  "UserId": 203,
  "EventId": 15
}
```

### 5) Eliminar inscripción

- Método: `DELETE`
- Ruta: `/api/inscripciones/{eventId:int}`
- Query param requerido: `userId`
- ¿Qué hace?: Elimina la inscripción del usuario para el evento indicado.
- Ejemplo: `/api/inscripciones/15?userId=203`

## Organizador

### 1) Listar todos mis eventos

- Método: `GET`
- Ruta: `/organizer/my-events/all`
- Query param requerido: `organizerId`
- ¿Qué hace?: Retorna todos los eventos asociados a la entidad organizadora indicada.
- Ejemplo: `/organizer/my-events/all?organizerId=2`

### 2) Listar mis eventos activos (no cancelados)

- Método: `GET`
- Ruta: `/organizer/my-events`
- Query param requerido: `organizerId`
- ¿Qué hace?: Retorna eventos de la entidad organizadora excluyendo cancelados.
- Ejemplo: `/organizer/my-events?organizerId=2`

### 3) Obtener uno de mis eventos por id

- Método: `GET`
- Ruta: `/organizer/my-events/{id}`
- Query param requerido: `organizerId`
- ¿Qué hace?: Devuelve un evento específico, validando pertenencia de la entidad.
- Ejemplo: `/organizer/my-events/15?organizerId=2`

### 4) Crear evento

- Método: `POST`
- Ruta: `/organizer/events`
- ¿Qué hace?: Crea un evento nuevo. Recibe `multipart/form-data`.
- Body mínimo (form-data):

```text
Title=Feria de Clubes
EventDescription=Presentacion de clubes estudiantiles
Place=Auditorio Central
CategoryId=1
OrganizerId=203
OrganizerEntityId=2
AvalaibleEntries=120
IsVirtual=false
EventDate=2026-05-20T14:00:00
ImageFileEvent=(opcional, archivo)
```

### 5) Cancelar evento

- Método: `POST`
- Ruta: `/organizer/events/{id:int}/cancel`
- ¿Qué hace?: Cancela un evento aprobado y notifica por correo a personas inscritas.
- Body mínimo (JSON):

```json
{
  "OrganizerId": 2,
  "Reason": "Cambio de fecha por mantenimiento del auditorio"
}
```

### 6) Enviar anuncio del evento

- Método: `POST`
- Ruta: `/organizer/events/{id:int}/notice`
- ¿Qué hace?: Crea un anuncio y lo envía por correo a personas inscritas.
- Body mínimo (JSON):

```json
{
  "WriterId": 2,
  "Title": "Cambio de aula",
  "About": "Actualizacion logistica",
  "Body": "El evento se movera al Aula B3."
}
```

### 7) Eliminar evento

- Método: `DELETE`
- Ruta: `/organizer/events/{id}`
- Query param requerido: `organizerId`
- ¿Qué hace?: Elimina un evento si pertenece a la entidad organizadora indicada.
- Ejemplo: `/organizer/events/15?organizerId=2`

### 8) Ver lista de asistencia de un evento

- Método: `GET`
- Ruta: `/organizer/events/{id:int}/check-list`
- ¿Qué hace?: Muestra inscritos con estado de asistencia.
- Ejemplo: `/organizer/events/15/check-list`

### 9) Marcar asistencia de usuario

- Método: `POST`
- Ruta: `/organizer/events/{eventId:int}/check-list/{userId:int}`
- ¿Qué hace?: Registra asistencia de un usuario inscrito.
- Ejemplo: `/organizer/events/15/check-list/203`

### 10) Quitar marca de asistencia

- Método: `DELETE`
- Ruta: `/organizer/events/{eventId:int}/check-list/{userId:int}`
- ¿Qué hace?: Elimina el registro de asistencia de un usuario.
- Ejemplo: `/organizer/events/15/check-list/203`

### 11) Listar categorías de eventos

- Método: `GET`
- Ruta: `/organizer/get-events-categories`
- ¿Qué hace?: Lista categorías de eventos ordenadas por nombre.
- Ejemplo: `/organizer/get-events-categories`

### 12) Listar entidades organizadoras

- Método: `GET`
- Ruta: `/organizer/get-entities`
- ¿Qué hace?: Lista entidades organizadoras ordenadas por nombre.
- Ejemplo: `/organizer/get-entities`

## Administrador

### 1) Listar todos los eventos

- Método: `GET`
- Ruta: `/administrator/events/all`
- ¿Qué hace?: Devuelve todos los eventos sin filtrar.

### 2) Listar eventos administrables (no cancelados)

- Método: `GET`
- Ruta: `/administrator/events`
- ¿Qué hace?: Devuelve eventos no cancelados.

### 3) Aprobar evento

- Método: `POST`
- Ruta: `/administrator/{id:int}/approve`
- ¿Qué hace?: Cambia el estado del evento a aprobado.

### 4) Denegar evento

- Método: `POST`
- Ruta: `/administrator/{id:int}/deny`
- ¿Qué hace?: Deniega el evento y registra motivo en cancelados.
- Body mínimo (JSON):

```json
{
  "reason": "No cumple lineamientos institucionales"
}
```

### 5) Buscar usuario por nombre

- Método: `GET`
- Ruta: `/administrator/search-user-by-name/{name}`
- ¿Qué hace?: Busca usuario por nombre exacto.

### 6) Buscar usuario por cédula

- Método: `GET`
- Ruta: `/administrator/search-user-by-idcard/{idCard:int}`
- ¿Qué hace?: Busca usuario por cédula.

### 7) Cambiar rol a organizador

- Método: `POST`
- Ruta: `/administrator/change-rol/to-organizer/{id:int}`
- ¿Qué hace?: Cambia rol de un usuario activo a organizador.

### 8) Cambiar rol a estudiante

- Método: `POST`
- Ruta: `/administrator/change-rol/to-student/{id:int}`
- ¿Qué hace?: Cambia rol de un usuario activo a estudiante.

### 9) Generar reporte PDF por rango de fechas

- Método: `POST`
- Ruta: `/administrator/generate-report`
- ¿Qué hace?: Genera un PDF con métricas por categoría en el rango indicado.
- Body mínimo (JSON):

```json
{
  "DateStart": "2026-01-01T00:00:00",
  "DateEnd": "2026-12-31T23:59:59"
}
```
