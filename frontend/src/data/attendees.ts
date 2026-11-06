// Per-event attendee records: RSVP, check-in, and survey status. Built
// deterministically from the people + events so the same person looks
// consistent across every role view.
import type { Attendee, CheckInStatus, SurveyStatus } from '../types'
import { events } from './events'
import { students } from './people'

// Small deterministic hash so "random-looking" fields stay stable per person.
function seed(id: string): number {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997
  return h
}

const studentCompleteness = new Map(students.map((s) => [s.id, s.surveyCompleteness]))

function surveyStatusFor(personId: string): SurveyStatus {
  const completeness = studentCompleteness.get(personId)
  if (completeness !== undefined) {
    if (completeness >= 80) return 'complete'
    if (completeness >= 40) return 'partial'
    return 'none'
  }
  // Alumni: deterministic spread, mostly complete.
  const r = seed(personId) % 10
  if (r < 7) return 'complete'
  if (r < 9) return 'partial'
  return 'none'
}

// Live event: this subset has already checked in; useLiveCheckIns adds more.
const LIVE_CHECKED_IN = new Set(['s2', 's3', 's5', 's8', 'a1', 'a2', 'a6', 'a3'])
// Past event: these registered but never showed.
const PAST_NO_SHOW = new Set(['s9', 'a7'])

function checkInStatusFor(eventId: string, personId: string): CheckInStatus {
  if (eventId === 'e-live') {
    return LIVE_CHECKED_IN.has(personId) ? 'checked-in' : 'registered'
  }
  if (eventId === 'e-past') {
    return PAST_NO_SHOW.has(personId) ? 'no-show' : 'checked-in'
  }
  return 'registered' // upcoming: check-in not open yet
}

function checkInAtFor(
  eventId: string,
  personId: string,
  status: CheckInStatus,
  index: number,
): string | undefined {
  if (status !== 'checked-in') return undefined
  if (eventId === 'e-live') {
    const minute = 30 + (index % 20)
    return `2026-11-05T17:${String(minute).padStart(2, '0')}:00-08:00`
  }
  const minute = (seed(personId) % 50) + 5
  return `2026-10-15T10:${String(minute).padStart(2, '0')}:00-07:00`
}

export const attendees: Attendee[] = events.flatMap((event) =>
  event.registeredIds.map((personId, index) => {
    const checkInStatus = checkInStatusFor(event.id, personId)
    const rsvp = seed(personId) % 5 === 0 ? 'maybe' : 'going'
    return {
      eventId: event.id,
      personId,
      rsvp,
      checkInStatus,
      surveyStatus: surveyStatusFor(personId),
      checkInAt: checkInAtFor(event.id, personId, checkInStatus, index),
    }
  }),
)
