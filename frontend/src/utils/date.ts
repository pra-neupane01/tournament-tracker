export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Not set';
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function toLocalDateTimeInput(value: string | null | undefined) {
  if (!value) {
    return '';
  }
  return value.slice(0, 16);
}
