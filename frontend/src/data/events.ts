// Three demo events relative to the demo "today" (2026-11-05): one live now,
// one upcoming, one past. registeredIds reference people in people.ts.
import type { EventItem } from '../types'

const ALL_STUDENTS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10']
const ALL_ALUMNI = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10']

export const events: EventItem[] = [
  {
    id: 'e-live',
    name: 'Fall Alumni & Student Mixer',
    description:
      'An evening of networking between current Beavers and alumni across industries.',
    venue: 'CH2M HILL Alumni Center, Corvallis',
    startsAt: '2026-11-05T17:30:00-08:00',
    endsAt: '2026-11-05T20:30:00-08:00',
    status: 'live',
    registeredIds: [...ALL_STUDENTS, ...ALL_ALUMNI],
  },
  {
    id: 'e-upcoming',
    name: 'Tech & Engineering Career Night',
    description:
      'Focused connections for students and alumni in software, hardware, and energy.',
    venue: 'Kelley Engineering Center, Corvallis',
    startsAt: '2026-11-19T18:00:00-08:00',
    endsAt: '2026-11-19T20:00:00-08:00',
    status: 'upcoming',
    registeredIds: ['s1', 's2', 's3', 's5', 's8', 's11', 's12', 'a1', 'a2', 'a5', 'a6', 'a11'],
  },
  {
    id: 'e-past',
    name: 'Homecoming Networking Brunch',
    description: 'A relaxed morning reconnecting alumni with students over coffee.',
    venue: 'The Valley Football Center, Corvallis',
    startsAt: '2026-10-15T10:00:00-07:00',
    endsAt: '2026-10-15T12:00:00-07:00',
    status: 'past',
    registeredIds: ['s1', 's4', 's6', 's7', 's9', 'a1', 'a3', 'a7', 'a8', 'a12'],
  },
]

export const liveEvent = events[0]
export const upcomingEvent = events[1]
export const pastEvent = events[2]
