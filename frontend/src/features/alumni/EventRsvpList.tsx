// The alumnus's events with RSVP status, plus a live check-in count for the
// in-progress event that climbs over time via useLiveCheckIns.
import type { Alumnus, EventItem, RsvpStatus } from '../../types'
import { attendeeFor, eventsForPerson, liveEvent } from '../../data'
import { useLiveCheckIns } from '../../hooks/useLiveCheckIns'
import { Badge, Card, EmptyState } from '../../components/shared'
import type { BadgeTone } from '../../components/shared'
import { formatRange } from './format'

const STATUS_TONE: Record<EventItem['status'], BadgeTone> = {
  live: 'green',
  upcoming: 'osu',
  past: 'neutral',
}

const STATUS_LABEL: Record<EventItem['status'], string> = {
  live: 'Live now',
  upcoming: 'Upcoming',
  past: 'Past',
}

const RSVP_LABEL: Record<RsvpStatus, string> = {
  going: 'Going',
  maybe: 'Maybe',
  declined: 'Declined',
}

// Live events first, then soonest upcoming, then past.
const ORDER: Record<EventItem['status'], number> = {
  live: 0,
  upcoming: 1,
  past: 2,
}

function LiveCount() {
  const { checkedInCount, registeredCount } = useLiveCheckIns(liveEvent.id)
  const pct = registeredCount
    ? Math.round((checkedInCount / registeredCount) * 100)
    : 0
  return (
    <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-emerald-800">Checked in</span>
        <span className="font-bold text-emerald-800 tabular-nums">
          {checkedInCount}
          <span className="font-medium text-emerald-700/70">
            {' '}
            / {registeredCount}
          </span>
        </span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-200"
        role="presentation"
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function EventRsvpList({ alumnus }: { alumnus: Alumnus }) {
  const myEvents = [...eventsForPerson(alumnus.id)].sort(
    (a, b) => ORDER[a.status] - ORDER[b.status],
  )

  return (
    <Card>
      <h2 className="text-lg font-semibold text-ink">Your events</h2>
      {myEvents.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="RSVP to an OSU networking event to see it here."
        />
      ) : (
        <ul className="mt-4 space-y-3">
          {myEvents.map((event) => {
            const rsvp = attendeeFor(event.id, alumnus.id)?.rsvp
            return (
              <li
                key={event.id}
                className="rounded-xl border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink">{event.name}</h3>
                    <p className="mt-0.5 text-sm text-stone-500 tabular-nums">
                      {formatRange(event.startsAt, event.endsAt)}
                    </p>
                    <p className="text-sm text-stone-500">{event.venue}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge tone={STATUS_TONE[event.status]}>
                      {STATUS_LABEL[event.status]}
                    </Badge>
                    {rsvp && (
                      <span className="text-xs font-medium text-stone-500">
                        {RSVP_LABEL[rsvp]}
                      </span>
                    )}
                  </div>
                </div>
                {event.status === 'live' && <LiveCount />}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
