// Matching health: a survey/match funnel, average score, a hand-built score
// distribution, and the list of attendees who need follow-up. No chart lib.
import { Avatar, Badge, Card, EmptyState, MatchScoreRing } from '../../components/shared'
import { bestMatchScore, surveyFunnel, weakMatchAttendees } from '../../data'
import type { EventItem } from '../../types'
import { averageMatchScore, scoreDistribution } from './helpers'

interface MatchingHealthProps {
  event: EventItem
  onSelectPerson: (personId: string, trigger: HTMLElement | null) => void
}

export function MatchingHealth({ event, onSelectPerson }: MatchingHealthProps) {
  const funnel = surveyFunnel(event.id)
  const avg = averageMatchScore(event.id)
  const distribution = scoreDistribution(event.id)
  const weak = weakMatchAttendees(event.id)
  const maxBand = Math.max(1, ...distribution.map((d) => d.count))

  const funnelSteps = [
    { label: 'Registered', value: funnel.registered, tone: 'bg-stone-400' },
    { label: 'Survey complete', value: funnel.surveyComplete, tone: 'bg-osu/70' },
    { label: 'Matched', value: funnel.matched, tone: 'bg-osu' },
  ]
  const funnelMax = Math.max(1, funnel.registered)

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold tracking-tight text-ink">Matching health</h2>
        <div className="flex items-center gap-2">
          <MatchScoreRing score={avg} size="sm" />
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Avg score</p>
            <p className="text-sm font-semibold tabular-nums text-ink">{avg} / 100</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        {/* Funnel */}
        <section aria-labelledby="funnel-h">
          <h3 id="funnel-h" className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Survey → match funnel
          </h3>
          <div className="mt-3 space-y-2.5">
            {funnelSteps.map((step) => (
              <div key={step.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">{step.label}</span>
                  <span className="font-semibold tabular-nums text-ink">{step.value}</span>
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${step.tone}`}
                    style={{ width: `${Math.round((step.value / funnelMax) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Distribution */}
        <section aria-labelledby="dist-h">
          <h3 id="dist-h" className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Match score distribution
          </h3>
          <div className="mt-3 space-y-2.5">
            {distribution.map(({ band, count }) => (
              <div key={band.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">{band.label}</span>
                  <span className="font-semibold tabular-nums text-ink">{count}</span>
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-indigo-400 transition-[width] duration-500"
                    style={{ width: `${Math.round((count / maxBand) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Needs attention */}
      <section aria-labelledby="attention-h" className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h3 id="attention-h" className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Needs attention
          </h3>
          {weak.length > 0 && <Badge tone="amber">{weak.length} to review</Badge>}
        </div>
        {weak.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="Everyone has a solid match"
              description="No registered attendees are below the weak-match threshold."
            />
          </div>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {weak.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={(e) => onSelectPerson(person.id, e.currentTarget)}
                  className="flex w-full items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2 text-left hover:border-osu/40 hover:bg-osu-tint/40 focus:outline-none focus:ring-2 focus:ring-osu/40"
                >
                  <Avatar initials={person.initials} role={person.role} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{person.name}</p>
                    <p className="truncate text-xs text-stone-500">{person.headline}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-stone-500">
                    {bestMatchScore(person.id) === 0 ? 'No match' : bestMatchScore(person.id)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Card>
  )
}
