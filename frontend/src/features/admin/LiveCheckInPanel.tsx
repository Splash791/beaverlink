// Live check-in panel: animated progress toward full attendance plus a
// streaming feed of recent arrivals. For non-live events it shows a static
// summary or an empty state instead of the live stream.
import { Avatar, Badge, Card, EmptyState } from '../../components/shared'
import { getPersonById } from '../../data'
import type { EventItem } from '../../types'
import type { LiveCheckIns } from '../../hooks/useLiveCheckIns'
import { relativeTime } from './helpers'

interface LiveCheckInPanelProps {
  event: EventItem
  live: LiveCheckIns
}

export function LiveCheckInPanel({ event, live }: LiveCheckInPanelProps) {
  const isLive = event.status === 'live'
  const { registeredCount, checkedInCount, recentFeed, isComplete } = live
  const pct = registeredCount ? Math.round((checkedInCount / registeredCount) * 100) : 0

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold tracking-tight text-ink">Live check-in</h2>
        {isLive &&
          (isComplete ? (
            <Badge tone="green">All in</Badge>
          ) : (
            <Badge tone="osu">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-osu/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-osu" />
              </span>
              Live
            </Badge>
          ))}
      </div>

      {isLive ? (
        <>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-ink">{checkedInCount}</span>
            <span className="text-sm text-stone-500 tabular-nums">of {registeredCount} checked in</span>
            <span className="ml-auto text-sm font-semibold tabular-nums text-osu">{pct}%</span>
          </div>

          {/* Animated progress bar — width transitions as people arrive. */}
          <div
            className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-stone-200"
            role="progressbar"
            aria-valuenow={checkedInCount}
            aria-valuemin={0}
            aria-valuemax={registeredCount}
            aria-label="Check-in progress"
          >
            <div
              className="h-full rounded-full bg-osu transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Recent arrivals
          </h3>
          <div className="mt-2 flex-1">
            {recentFeed.length === 0 ? (
              <p className="text-sm text-stone-500">
                Watching for new check-ins — arrivals will stream in here.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentFeed.map((item) => (
                  <li
                    key={`${item.person.id}-${item.at}`}
                    className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2"
                  >
                    <Avatar initials={item.person.initials} role={item.person.role} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{item.person.name}</p>
                      <p className="text-xs text-stone-500">{item.person.headline}</p>
                    </div>
                    <span className="shrink-0 text-xs text-stone-400 tabular-nums">
                      {relativeTime(item.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : event.status === 'upcoming' ? (
        <div className="mt-4 flex-1">
          <EmptyState
            title="Check-in not open yet"
            description={`${registeredCount} people are registered. Check-in opens when the event goes live.`}
          />
        </div>
      ) : (
        <PastSummary event={event} />
      )}
    </Card>
  )
}

function PastSummary({ event }: { event: EventItem }) {
  // For a past event, show who actually attended from the seed data.
  const attended = event.registeredIds
    .map((id) => getPersonById(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  return (
    <>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums text-ink">{attended.length}</span>
        <span className="text-sm text-stone-500">registered attendees</span>
      </div>
      <p className="mt-2 text-sm text-stone-500">
        This event has ended. Live check-in is closed; see the attendee table for final status.
      </p>
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div className="h-full w-full rounded-full bg-stone-300" />
      </div>
    </>
  )
}
