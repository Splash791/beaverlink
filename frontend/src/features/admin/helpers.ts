// Pure helpers for the organizer dashboard: relative time, CSV export,
// and match-score aggregation. No React, no side effects beyond the
// explicitly guarded download.
import { attendeesForEvent, bestMatchScore, eventById, getPersonById } from '../../data'
import type { CheckInStatus, SurveyStatus } from '../../types'

/** Human relative time, defaulting to "just now" for very recent events. */
export function relativeTime(from: string | number | Date, now: number = Date.now()): string {
  const t = typeof from === 'number' ? from : new Date(from).getTime()
  const diffSec = Math.max(0, Math.round((now - t) / 1000))
  if (diffSec < 15) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  const min = Math.round(diffSec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} hr ago`
  const day = Math.round(hr / 24)
  return `${day} day${day === 1 ? '' : 's'} ago`
}

export const CHECK_IN_LABELS: Record<CheckInStatus, string> = {
  'checked-in': 'Checked in',
  registered: 'Registered',
  'no-show': 'No-show',
}

export const SURVEY_LABELS: Record<SurveyStatus, string> = {
  complete: 'Complete',
  partial: 'Partial',
  none: 'Not started',
}

/** Average best-match score across an event's registered people (0–100). */
export function averageMatchScore(eventId: string): number {
  const ids = eventById(eventId)?.registeredIds ?? []
  if (ids.length === 0) return 0
  const total = ids.reduce((sum, id) => sum + bestMatchScore(id), 0)
  return Math.round(total / ids.length)
}

export interface ScoreBand {
  label: string
  min: number
  max: number
}

// Bands mirror the MatchScoreRing color thresholds (75 / 55).
export const SCORE_BANDS: ScoreBand[] = [
  { label: 'Strong (75+)', min: 75, max: 100 },
  { label: 'Good (55–74)', min: 55, max: 74 },
  { label: 'Fair (40–54)', min: 40, max: 54 },
  { label: 'Needs attention (<40)', min: 0, max: 39 },
]

/** Counts of registered people per match-score band for the distribution chart. */
export function scoreDistribution(eventId: string): { band: ScoreBand; count: number }[] {
  const ids = eventById(eventId)?.registeredIds ?? []
  return SCORE_BANDS.map((band) => ({
    band,
    count: ids.filter((id) => {
      const s = bestMatchScore(id)
      return s >= band.min && s <= band.max
    }).length,
  }))
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Build a CSV string of an event's attendees joined with their person record. */
export function buildAttendeeCsv(eventId: string): string {
  const header = ['Name', 'Role', 'RSVP', 'Check-in', 'Survey', 'Best match score']
  const rows = attendeesForEvent(eventId).map((a) => {
    const person = getPersonById(a.personId)
    return [
      person?.name ?? a.personId,
      person?.role ?? '',
      a.rsvp,
      a.checkInStatus,
      a.surveyStatus,
      String(bestMatchScore(a.personId)),
    ]
  })
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')
}

/**
 * Trigger a client-side CSV download. Feature-detects browser APIs so it is a
 * no-op (returning false) in the test/SSR environment rather than throwing.
 */
export function downloadCsv(filename: string, content: string): boolean {
  if (typeof document === 'undefined') return false
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return false
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
  return true
}
