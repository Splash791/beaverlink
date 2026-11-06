// Simulates Supabase Realtime check-ins with a timer: starting from the
// already-checked-in attendees, it "checks in" one more registered person on
// each tick until everyone is in. The interval is cleared on unmount.
import { useEffect, useMemo, useState } from 'react'
import type { Person } from '../types'
import { attendeesForEvent, eventById, getPersonById } from '../data'

export interface CheckInEvent {
  person: Person
  at: string
}

export interface LiveCheckIns {
  registeredCount: number
  checkedInCount: number
  checkedInIds: string[]
  /** Most recent check-ins, newest first. */
  recentFeed: CheckInEvent[]
  isComplete: boolean
}

export function useLiveCheckIns(eventId: string, intervalMs = 3500): LiveCheckIns {
  const event = eventById(eventId)
  const registeredCount = event?.registeredIds.length ?? 0

  const initialCheckedIn = useMemo(
    () =>
      attendeesForEvent(eventId)
        .filter((a) => a.checkInStatus === 'checked-in')
        .map((a) => a.personId),
    [eventId],
  )

  // Registered people not yet checked in, in a stable arrival order.
  const queue = useMemo(() => {
    const checkedIn = new Set(initialCheckedIn)
    return (event?.registeredIds ?? []).filter((id) => !checkedIn.has(id))
  }, [event, initialCheckedIn])

  const [trackedEventId, setTrackedEventId] = useState(eventId)
  const [checkedInIds, setCheckedInIds] = useState<string[]>(initialCheckedIn)
  const [feed, setFeed] = useState<CheckInEvent[]>([])
  const [cursor, setCursor] = useState(0)

  // Reset during render when the event changes (no effect needed).
  if (trackedEventId !== eventId) {
    setTrackedEventId(eventId)
    setCheckedInIds(initialCheckedIn)
    setFeed([])
    setCursor(0)
  }

  useEffect(() => {
    if (cursor >= queue.length) return
    const timer = setInterval(() => {
      setCursor((c) => {
        if (c >= queue.length) return c
        const personId = queue[c]
        const person = getPersonById(personId)
        if (person) {
          setCheckedInIds((ids) => [...ids, personId])
          setFeed((f) =>
            [{ person, at: new Date().toISOString() }, ...f].slice(0, 8),
          )
        }
        return c + 1
      })
    }, intervalMs)
    return () => clearInterval(timer)
  }, [queue, cursor, intervalMs])

  return {
    registeredCount,
    checkedInCount: checkedInIds.length,
    checkedInIds,
    recentFeed: feed,
    isComplete: cursor >= queue.length,
  }
}
