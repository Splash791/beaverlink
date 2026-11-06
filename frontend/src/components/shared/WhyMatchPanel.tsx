// Factor-by-factor explanation of a match. Per FR-5 the factor scores sum to
// the match total, which this panel shows explicitly.
import type { Match } from '../../types'

export function WhyMatchPanel({ match }: { match: Match }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-ink">Why this match</h4>
        <p className="text-sm text-stone-500">
          <span className="font-bold tabular-nums text-ink">{match.score}</span>
          <span className="text-stone-400"> / 100</span>
        </p>
      </div>
      <dl className="mt-3 space-y-3">
        {match.factors.map((factor) => (
          <div key={factor.key}>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-sm font-medium text-ink">{factor.label}</dt>
              <dd className="shrink-0 text-xs font-semibold tabular-nums text-stone-500">
                {factor.score}
                <span className="text-stone-400">/{factor.weight}</span>
              </dd>
            </div>
            <div
              className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100"
              role="presentation"
            >
              <div
                className="h-full rounded-full bg-osu"
                style={{
                  width: `${(factor.score / factor.weight) * 100}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              {factor.explanation}
            </p>
          </div>
        ))}
      </dl>
    </div>
  )
}
