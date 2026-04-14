-- Agrega la columna ReminderSent a la tabla Event para el sistema de recordatorios automáticos.
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "ReminderSent" BOOLEAN NOT NULL DEFAULT FALSE;
