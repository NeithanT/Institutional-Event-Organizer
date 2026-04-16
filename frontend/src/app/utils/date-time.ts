const DATE_TIME_REGEX = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,7}))?)?)?$/;

export function parseApiDateTime(value: string | null | undefined): Date | null {
  if (!value) return null;

  const normalized = value.trim();
  const match = DATE_TIME_REGEX.exec(normalized);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4] ?? '0');
    const minute = Number(match[5] ?? '0');
    const second = Number(match[6] ?? '0');
    const millisecondsRaw = (match[7] ?? '').slice(0, 3);
    const millisecond = Number(millisecondsRaw.padEnd(3, '0') || '0');

    return new Date(year, month - 1, day, hour, minute, second, millisecond);
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatApiDateTimeEsCR(value: string, includeTime: boolean = true): string {
  const parsed = parseApiDateTime(value);
  if (!parsed) return '';

  const options: Intl.DateTimeFormatOptions = includeTime
    ? {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    : {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };

  return parsed.toLocaleString('es-CR', options);
}

export function isFutureDateTime(value: string): boolean {
  const parsed = parseApiDateTime(value);
  return !!parsed && parsed.getTime() > Date.now();
}
