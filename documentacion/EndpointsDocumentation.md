# Documentación de Endpoints

Este documento resume todos los endpoints definidos en el backend, agrupados por rol de uso: estudiante, organizador y administrador.

Base URL sugerida para pruebas locales: `https://localhost:5001`

## Estudiante

### 1) Iniciar sesión

- Método: `POST`
- Ruta (estructura): `/user/auth`
- ¿Qué hace?: Autentica un usuario con correo y contraseña.
- ¿Para qué se usa?: Permite entrar al sistema y obtener datos básicos del usuario (id, nombre, correo y rol).
- Ejemplo de ruta: `/user/auth`
- Ejemplo mínimo de body (JSON):

```json
{
  "Email": "estudiante@estudiantec.cr",
  "Password": "Passw0rd!"
}
```

### 2) Registro de estudiante

- Método: `POST`
- Ruta (estructura): `/student/register`
- ¿Qué hace?: Registra un usuario nuevo con rol de estudiante, validando dominio institucional y formato de contraseña.
- ¿Para qué se usa?: Crear cuentas nuevas de estudiantes para poder participar en eventos.
- Ejemplo de ruta: `/student/register`
- Ejemplo mínimo de body (JSON):

```json
{
  "Name": "Ana",
  "LastName": "Soto",
  "IdCard": 2034500001,
  "Email": "ana.soto@estudiantec.cr",
  "Password": "Passw0rd!"
}
```

## Organizador

### 1) Listar todos los eventos (incluye cancelados)

- Método: `GET`
- Ruta (estructura): `/organizer/events/all`
- ¿Qué hace?: Retorna todos los eventos en base de datos sin filtrar cancelados.
- ¿Para qué se usa?: Revisiones internas o panel completo de gestión.
- Ejemplo de ruta: `/organizer/events/all`
- Ejemplo mínimo de request: sin body.

### 2) Listar eventos disponibles (excluye cancelados)

- Método: `GET`
- Ruta (estructura): `/organizer/events`
- ¿Qué hace?: Lista eventos no cancelados.
- ¿Para qué se usa?: Mostrar eventos activos para operación normal.
- Ejemplo de ruta: `/organizer/events`
- Ejemplo mínimo de request: sin body.

### 3) Obtener evento por id

- Método: `GET`
- Ruta (estructura): `/organizer/events/{id}`
- ¿Qué hace?: Busca un evento específico por su id.
- ¿Para qué se usa?: Ver detalle de un evento concreto.
- Ejemplo de ruta: `/organizer/events/15`
- Ejemplo mínimo de request: sin body.

### 4) Crear evento

- Método: `POST`
- Ruta (estructura): `/organizer/events`
- ¿Qué hace?: Crea un evento nuevo (incluye soporte para imagen en formulario).
- ¿Para qué se usa?: Publicar propuestas de evento desde organizaciones.
- Ejemplo de ruta: `/organizer/events`
- Ejemplo mínimo de body (form-data):

```text
Title=Feria de Clubes
EventDescription=Presentacion de clubes estudiantiles
Place=Auditorio Central
CategoryId=1
OrganizerId=203
OrganizerEntityId=2
AvalaibleEntries=120
ApprovedState=false
IsVirtual=false
EventDate=2026-05-20T14:00:00
ImageFileEvent=(opcional, archivo)`
```

### 5) Cancelar evento

- Método: `POST`
- Ruta (estructura): `/organizer/events/{id:int}/cancel`
- ¿Qué hace?: Marca un evento aprobado como cancelado y notifica por correo a inscritos.
- ¿Para qué se usa?: Suspender un evento ya publicado cuando sea necesario.
- Ejemplo de ruta: `/organizer/events/15/cancel`
- Ejemplo mínimo de body (JSON):

```json
{
  "Reason": "Cambio de fecha por mantenimiento del auditorio"
}
```

### 6) Enviar anuncio de evento

- Método: `POST`
- Ruta (estructura): `/organizer/events/{id:int}/notice`
- ¿Qué hace?: Crea un anuncio y lo envía por correo a las personas inscritas.
- ¿Para qué se usa?: Comunicar cambios o avisos importantes del evento.
- Ejemplo de ruta: `/organizer/events/15/notice`
- Ejemplo mínimo de body (JSON):

```json
{
  "WriterId": 203,
  "Title": "Cambio de aula",
  "About": "Actualizacion logistica",
  "Body": "El evento se movera al Aula B3."
}
```

### 7) Eliminar evento

- Método: `DELETE`
- Ruta (estructura): `/organizer/events/{id}`
- ¿Qué hace?: Elimina un evento de la base de datos.
- ¿Para qué se usa?: Borrar eventos que no deben mantenerse en el sistema.
- Ejemplo de ruta: `/organizer/events/15`
- Ejemplo mínimo de request: sin body.

### 8) Ver lista de asistencia de un evento

- Método: `GET`
- Ruta (estructura): `/organizer/events/{id:int}/check-list`
- ¿Qué hace?: Muestra inscritos del evento e indica si ya tienen asistencia marcada.
- ¿Para qué se usa?: Control de entrada y seguimiento de participantes.
- Ejemplo de ruta: `/organizer/events/15/check-list`
- Ejemplo mínimo de request: sin body.

### 9) Marcar asistencia de usuario

- Método: `POST`
- Ruta (estructura): `/organizer/events/{eventId:int}/check-list/{userId:int}`
- ¿Qué hace?: Registra que un usuario asistió al evento.
- ¿Para qué se usa?: Llevar el control oficial de asistencia.
- Ejemplo de ruta: `/organizer/events/15/check-list/203`
- Ejemplo mínimo de request: sin body.

### 10) Quitar marca de asistencia

- Método: `DELETE`
- Ruta (estructura): `/organizer/events/{eventId:int}/check-list/{userId:int}`
- ¿Qué hace?: Elimina un registro de asistencia de un usuario.
- ¿Para qué se usa?: Corregir errores de marcación.
- Ejemplo de ruta: `/organizer/events/15/check-list/203`
- Ejemplo mínimo de request: sin body.

### 11) Listar entidades organizadoras

- Método: `GET`
- Ruta (estructura): `/organizer/get-entities`
- ¿Qué hace?: Retorna id y nombre de entidades organizadoras ordenadas alfabéticamente.
- ¿Para qué se usa?: Cargar opciones de entidad al crear o editar eventos.
- Ejemplo de ruta: `/organizer/get-entities`
- Ejemplo mínimo de request: sin body.

## Administrador

### 1) Listar todos los eventos (incluye denegados/cancelados)

- Método: `GET`
- Ruta (estructura): `/administrator/events/all`
- ¿Qué hace?: Devuelve todos los eventos sin filtros.
- ¿Para qué se usa?: Auditoría o gestión administrativa completa.
- Ejemplo de ruta: `/administrator/events/all`
- Ejemplo mínimo de request: sin body.

### 2) Listar eventos administrables (no cancelados)

- Método: `GET`
- Ruta (estructura): `/administrator/events`
- ¿Qué hace?: Lista eventos que aún no están cancelados.
- ¿Para qué se usa?: Revisar eventos pendientes o aprobados para toma de decisiones.
- Ejemplo de ruta: `/administrator/events`
- Ejemplo mínimo de request: sin body.

### 3) Aprobar evento

- Método: `POST`
- Ruta (estructura): `/administrator/{id:int}/approve`
- ¿Qué hace?: Cambia el estado del evento a aprobado.
- ¿Para qué se usa?: Habilitar oficialmente la publicación/ejecución del evento.
- Ejemplo de ruta: `/administrator/15/approve`
- Ejemplo mínimo de request: sin body.

### 4) Denegar evento

- Método: `POST`
- Ruta (estructura): `/administrator/{id:int}/deny`
- ¿Qué hace?: Deniega el evento y registra motivo en cancelados.
- ¿Para qué se usa?: Rechazar propuestas que no cumplen criterios.
- Ejemplo de ruta: `/administrator/15/deny`
- Ejemplo mínimo de body (JSON):

```json
{
  "reason": "No cumple lineamientos institucionales"
}
```

### 5) Buscar usuario por nombre

- Método: `GET`
- Ruta (estructura): `/administrator/search-user-by-name/{name}`
- ¿Qué hace?: Busca usuario exacto por nombre y devuelve información de perfil/rol.
- ¿Para qué se usa?: Consultas administrativas rápidas de usuarios.
- Ejemplo de ruta: `/administrator/search-user-by-name/Juan%20Perez`
- Ejemplo mínimo de request: sin body.

### 6) Buscar usuario por cédula

- Método: `GET`
- Ruta (estructura): `/administrator/search-user-by-idcard/{idCard:int}`
- ¿Qué hace?: Busca usuario por cédula y devuelve información completa.
- ¿Para qué se usa?: Soporte y validación administrativa de identidad.
- Ejemplo de ruta: `/administrator/search-user-by-idcard/2034500001`
- Ejemplo mínimo de request: sin body.

### 7) Cambiar rol a organizador

- Método: `POST`
- Ruta (estructura): `/administrator/change-rol/to-organizer/{id:int}`
- ¿Qué hace?: Promueve un usuario activo al rol de organizador.
- ¿Para qué se usa?: Delegar gestión de eventos a nuevos responsables.
- Ejemplo de ruta: `/administrator/change-rol/to-organizer/203`
- Ejemplo mínimo de request: sin body.

### 8) Cambiar rol a estudiante

- Método: `POST`
- Ruta (estructura): `/administrator/change-rol/to-student/{id:int}`
- ¿Qué hace?: Regresa un usuario activo al rol de estudiante.
- ¿Para qué se usa?: Ajustar permisos cuando un usuario deja de organizar.
- Ejemplo de ruta: `/administrator/change-rol/to-student/203`
- Ejemplo mínimo de request: sin body.

### 9) Generar reporte PDF por rango de fechas

- Método: `POST`
- Ruta (estructura): `/administrator/generate-report`
- ¿Qué hace?: Genera y devuelve un PDF con métricas de asistencia por categoría.
- ¿Para qué se usa?: Reportería institucional y análisis de participación.
- Ejemplo de ruta: `/administrator/generate-report`
- Ejemplo mínimo de body (JSON):

```json
{
  "DateStart": "2026-01-01T00:00:00",
  "DateEnd": "2026-12-31T23:59:59"
}
```
