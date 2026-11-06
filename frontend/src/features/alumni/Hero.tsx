// Welcome banner plus the alumnus's next event, with a live "happening now"
// treatment when the event is in progress.
import type { Alumnus } from '../../types'
import { nextEventFor } from '../../data'
import { Badge, Card } from '../../components/shared'
import { formatRange } from './format'

export function Hero({ alumnus }: { alumnus: Alumnus }) {
  const event = nextEventFor(alumnus.id)
  const firstName = alumnus.name.split(' ')[0]

  return (
    <section aria-labelledby="hero-heading">
      <div className="flex flex-wrap items-center gap-3">
        <h1
          id="hero-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Welcome back, {firstName}
        </h1>
        <Badge tone="amber">Demo data</Badge>
      </div>
      <p className="mt-1 max-w-prose text-sm text-stone-600">
        {alumnus.jobTitle} at {alumnus.company}. Here are the students who'd get
        the most out of meeting you tonight.
      </p>

      {event && (
        <Card className="mt-5 overflow-hidden" padded={false}>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="flex items-center gap-2">
                {event.status === 'live' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-osu">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-osu/70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-osu" />
                    </span>
                    Happening now
                  </span>
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Your next event
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-lg font-semibold text-ink">
                {event.name}
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                {event.venue}
              </p>
              <p className="mt-0.5 text-sm text-stone-500 tabular-nums">
                {formatRange(event.startsAt, event.endsAt)}
              </p>
            </div>
            <div className="shrink-0">
              <Badge tone={event.status === 'live' ? 'green' : 'osu'}>
                {event.registeredIds.length} registered
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </section>
  )
}
