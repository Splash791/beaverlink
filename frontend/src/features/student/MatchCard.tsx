// One ranked alumni match. Collapsed by default; expanding reveals the full
// factor breakdown via the shared WhyMatchPanel.
import { useId, useState } from 'react'
import type { Alumnus, Match } from '../../types'
import { Card, Badge, Avatar, MatchScoreRing, WhyMatchPanel } from '../../components/shared'
import { Button } from '../../components/Button'

interface MatchCardProps {
  match: Match
  alumnus: Alumnus
  rank: number
  saved: boolean
  onToggleSave: () => void
  onDraftIntro: () => void
}

export function MatchCard({
  match,
  alumnus,
  rank,
  saved,
  onToggleSave,
  onDraftIntro,
}: MatchCardProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <MatchScoreRing score={match.score} size="lg" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
            #{rank}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar initials={alumnus.initials} role="alumnus" size="md" />
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-ink">
                  {alumnus.name}
                </h3>
                <p className="truncate text-sm text-stone-500">
                  {alumnus.jobTitle} · {alumnus.company}
                </p>
              </div>
            </div>
            <Badge tone={match.score >= 75 ? 'osu' : 'neutral'} className="shrink-0">
              {match.mentorshipFit}
            </Badge>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-ink">{match.headline}</p>

          {match.sharedInterests.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Shared interests">
              {match.sharedInterests.slice(0, 3).map((interest) => (
                <li key={interest}>
                  <Badge tone="osu">{interest}</Badge>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={panelId}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-osu-dark transition-colors hover:bg-osu-tint focus:outline-none focus:ring-2 focus:ring-osu/40"
            >
              {open ? 'Hide why' : 'Why this match'}
              <svg
                viewBox="0 0 20 20"
                className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <Button
              variant="secondary"
              onClick={onToggleSave}
              aria-pressed={saved}
              className="!px-3 !py-1.5"
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button onClick={onDraftIntro} className="!px-3 !py-1.5">
              Draft intro
            </Button>
          </div>

          {open && (
            <div id={panelId} className="mt-4 border-t border-stone-100 pt-4">
              <WhyMatchPanel match={match} />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
