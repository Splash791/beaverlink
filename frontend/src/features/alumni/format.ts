// Deterministic date/time formatting for the demo. Pin the timezone so the
// hardcoded PST event timestamps render the same in every environment.
const TZ = 'America/Los_Angeles'

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: TZ,
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** e.g. "Nov 5, 5:30 PM – 8:30 PM" */
export function formatRange(start: string, end: string): string {
  return `${formatEventDate(start)}, ${formatTime(start)} – ${formatTime(end)}`
}

const FORMAT_LABELS: Record<string, string> = {
  chat: 'Quick chat',
  coffee: 'Over coffee',
  'walk-around': 'Walk around',
}

export function formatLabel(format: string): string {
  return FORMAT_LABELS[format] ?? format
}
