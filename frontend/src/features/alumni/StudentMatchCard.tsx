// One ranked student match: score ring, who they are, mentorship-fit tag, and
// a keyboard-accessible expander revealing the full WhyMatchPanel breakdown.
import { useId, useState } from 'react'
import type { Match } from '../../types'
import { getStudent } from '../../data'
import {
  Avatar,
  Badge,
  Card,
  MatchScoreRing,
  WhyMatchPanel,
} from '../../components/shared'
import type { BadgeTone } from '../../components/shared'

function fitTone(score: number): BadgeTone {
  if (score >= 80) return 'green'
  if (score >= 60) return 'osu'
  if (score >= 40) return 'amber'
  return 'neutral'
}

export function StudentMatchCard({
  match,
  rank,
}: {
  match: Match
  rank: number
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const student = getStudent(match.studentId)
  if (!student) return null

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-start gap-4 p-5">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <MatchScoreRing score={match.score} size="md" />
          <span className="text-[11px] font-medium text-stone-400 tabular-nums">
            #{rank}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar initials={student.initials} role="student" size="sm" />
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-ink">
                  {student.name}
                </h3>
                <p className="truncate text-sm text-stone-500">
                  {student.major} · Class of {student.classYear}
                </p>
              </div>
            </div>
            <Badge tone={fitTone(match.score)} className="shrink-0">
              {match.mentorshipFit}
            </Badge>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            {match.headline}
          </p>

          {match.sharedInterests.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {match.sharedInterests.map((interest) => (
                <li key={interest}>
                  <Badge tone="neutral">{interest}</Badge>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`Why ${student.name} is a good match`}
            className="mt-4 inline-flex items-center gap-1 rounded-md text-sm font-semibold text-osu-dark underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-osu/40"
          >
            {open ? 'Hide breakdown' : 'See the breakdown'}
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id={panelId}
          className="border-t border-stone-200 bg-stone-50/60 p-5"
        >
          <WhyMatchPanel match={match} />
        </div>
      )}
    </Card>
  )
}
