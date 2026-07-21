// Dates in the kit read like "July 02, 2026" (padded day). Keep that style.
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatDate(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${MONTHS[date.getUTCMonth()]} ${d}, ${date.getUTCFullYear()}`;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
