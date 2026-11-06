// Public data API for the demo. Role pages import selectors from here; they
// must not mutate the underlying arrays. All data is fake (FR: dev-only seed).
import type {
  Alumnus,
  Attendee,
  EventItem,
  Match,
  Person,
  Student,
  SurveyFunnel,
} from '../types'
import { alumni, students } from './people'
import { events } from './events'
import { attendees } from './attendees'
import { matches } from './matches'

export { students, alumni } from './people'
export { events, liveEvent, upcomingEvent, pastEvent } from './events'
export { attendees } from './attendees'
export { matches } from './matches'
export * from './vocab'

export const DEMO_TODAY = '2026-11-05T18:10:00-08:00'

const peopleById = new Map<string, Person>(
  [...students, ...alumni].map((p) => [p.id, p]),
)

export function getPersonById(id: string): Person | undefined {
  return peopleById.get(id)
}

export function getStudent(id: string): Student | undefined {
  const p = peopleById.get(id)
  return p?.role === 'student' ? p : undefined
}

export function getAlumnus(id: string): Alumnus | undefined {
  const p = peopleById.get(id)
  return p?.role === 'alumnus' ? p : undefined
}

export function personByEmail(email: string): Person | undefined {
  return [...students, ...alumni].find((p) => p.email === email)
}

export function eventById(id: string): EventItem | undefined {
  return events.find((e) => e.id === id)
}

export function attendeesForEvent(eventId: string): Attendee[] {
  return attendees.filter((a) => a.eventId === eventId)
}

export function attendeeFor(
  eventId: string,
  personId: string,
): Attendee | undefined {
  return attendees.find((a) => a.eventId === eventId && a.personId === personId)
}

/** Events a person is registered for, soonest first. */
export function eventsForPerson(personId: string): EventItem[] {
  return events
    .filter((e) => e.registeredIds.includes(personId))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

/** The live event if registered, else the soonest upcoming one. */
export function nextEventFor(personId: string): EventItem | undefined {
  const mine = eventsForPerson(personId)
  return (
    mine.find((e) => e.status === 'live') ??
    mine.find((e) => e.status === 'upcoming') ??
    mine[0]
  )
}

export function matchesForStudent(studentId: string): Match[] {
  return matches
    .filter((m) => m.studentId === studentId)
    .sort((a, b) => b.score - a.score)
}

export function matchesForAlumnus(alumnusId: string): Match[] {
  return matches
    .filter((m) => m.alumnusId === alumnusId)
    .sort((a, b) => b.score - a.score)
}

/** Registered → survey complete → matched funnel for an event. */
export function surveyFunnel(eventId: string): SurveyFunnel {
  const evt = eventById(eventId)
  if (!evt) return { registered: 0, surveyComplete: 0, matched: 0 }
  const eventAttendees = attendeesForEvent(eventId)
  const surveyComplete = eventAttendees.filter(
    (a) => a.surveyStatus === 'complete',
  ).length
  const matched = evt.registeredIds.filter((id) =>
    matches.some((m) => (m.studentId === id || m.alumnusId === id) && m.score >= 50),
  ).length
  return { registered: evt.registeredIds.length, surveyComplete, matched }
}

/** The best match score available to a person (0 if none). */
export function bestMatchScore(personId: string): number {
  const relevant = matches.filter(
    (m) => m.studentId === personId || m.alumnusId === personId,
  )
  return relevant.reduce((max, m) => Math.max(max, m.score), 0)
}

/** Registered people whose best match is weak, for admin follow-up. */
export function weakMatchAttendees(eventId: string, threshold = 50): Person[] {
  const evt = eventById(eventId)
  if (!evt) return []
  return evt.registeredIds
    .map((id) => getPersonById(id))
    .filter((p): p is Person => p !== undefined)
    .filter((p) => bestMatchScore(p.id) < threshold)
}
