// Student landing page: personalized hero + countdown, ranked alumni matches
// with working filters/sort, survey completeness, events with check-in, and
// saved connections with a templated intro helper. Demo data only.
import { useMemo, useState } from 'react'
import type { Alumnus } from '../../types'
import {
  students,
  personByEmail,
  getAlumnus,
  eventsForPerson,
  attendeeFor,
  matchesForStudent,
  liveEvent,
  upcomingEvent,
  INDUSTRIES,
  STUDENT_GOALS,
  DEMO_TODAY,
} from '../../data'
import { useAuth } from '../../auth/useAuth'
import { useLiveCheckIns } from '../../hooks/useLiveCheckIns'
import {
  AppShell,
  Card,
  Badge,
  Avatar,
  StatTile,
  EmptyState,
  MatchScoreRing,
} from '../../components/shared'
import { Button } from '../../components/Button'
import { MatchCard } from './MatchCard'
import {
  countdownTo,
  formatEventDate,
  formatEventTime,
  alumnusServesGoal,
  draftIntro,
} from './helpers'

type SortKey = 'score' | 'name'

export default function StudentLanding() {
  const { user } = useAuth()
  const me = user ? personByEmail(user.email) : undefined
  const student = me && me.role === 'student' ? me : students[0]

  const matches = useMemo(() => matchesForStudent(student.id), [student.id])
  const myEvents = useMemo(() => eventsForPerson(student.id), [student.id])

  // Filters + sort state.
  const [industry, setIndustry] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [goal, setGoal] = useState('')
  const [sort, setSort] = useState<SortKey>('score')

  // Distinct grad years among this student's matched alumni.
  const gradYears = useMemo(() => {
    const years = new Set<number>()
    for (const m of matches) {
      const a = getAlumnus(m.alumnusId)
      if (a) years.add(a.gradYear)
    }
    return [...years].sort((a, b) => b - a)
  }, [matches])

  const visibleMatches = useMemo(() => {
    const filtered = matches.filter((m) => {
      const a = getAlumnus(m.alumnusId)
      if (!a) return false
      if (industry && a.industry !== industry) return false
      if (gradYear && String(a.gradYear) !== gradYear) return false
      if (goal && !alumnusServesGoal(a, goal)) return false
      return true
    })
    if (sort === 'name') {
      filtered.sort((x, y) => {
        const ax = getAlumnus(x.alumnusId)?.name ?? ''
        const ay = getAlumnus(y.alumnusId)?.name ?? ''
        return ax.localeCompare(ay)
      })
    }
    return filtered
  }, [matches, industry, gradYear, goal, sort])

  const filtersActive = Boolean(industry || gradYear || goal)

  // Saved connections — seeded with the top match so the list isn't empty.
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    matches[0] ? [matches[0].alumnusId] : [],
  )
  function toggleSave(alumnusId: string) {
    setSavedIds((ids) =>
      ids.includes(alumnusId)
        ? ids.filter((id) => id !== alumnusId)
        : [...ids, alumnusId],
    )
  }

  // Intro draft helper.
  const [draftFor, setDraftFor] = useState<string | null>(null)
  function openDraft(alumnusId: string) {
    setSavedIds((ids) => (ids.includes(alumnusId) ? ids : [...ids, alumnusId]))
    setDraftFor(alumnusId)
  }

  return (
    <AppShell>
      <Hero studentName={student.name} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MatchesSection
            total={matches.length}
            visible={visibleMatches}
            industry={industry}
            setIndustry={setIndustry}
            gradYear={gradYear}
            setGradYear={setGradYear}
            goal={goal}
            setGoal={setGoal}
            sort={sort}
            setSort={setSort}
            gradYears={gradYears}
            filtersActive={filtersActive}
            onClearFilters={() => {
              setIndustry('')
              setGradYear('')
              setGoal('')
            }}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onDraftIntro={openDraft}
          />
        </div>

        <aside className="space-y-6" aria-label="Your profile and events">
          <CompletenessCard completeness={student.surveyCompleteness} />
          <EventsSection studentId={student.id} events={myEvents} />
          <SavedSection
            savedIds={savedIds}
            onRemove={toggleSave}
            onDraftIntro={openDraft}
          />
        </aside>
      </div>

      {draftFor && (
        <IntroDraftDialog
          alumnusId={draftFor}
          student={student}
          onClose={() => setDraftFor(null)}
        />
      )}

      <footer className="mt-10 flex items-center justify-center gap-2 border-t border-stone-200 pt-6 text-xs text-stone-500">
        <Badge tone="amber">Demo data</Badge>
        <span>BeaverLink · OSU Alumni Association</span>
      </footer>
    </AppShell>
  )
}

function Hero({ studentName }: { studentName: string }) {
  const firstName = studentName.split(' ')[0]
  const cd = countdownTo(DEMO_TODAY, upcomingEvent.startsAt)

  return (
    <section
      aria-labelledby="welcome-heading"
      className="overflow-hidden rounded-3xl bg-osu text-white shadow-sm shadow-osu/30"
    >
      <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-white/90">
              Happening now
            </span>
          </div>
          <h1
            id="welcome-heading"
            className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/90">
            {liveEvent.name} is live at {liveEvent.venue}. Check in and meet your
            top matches.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-white/10 p-4 ring-1 ring-inset ring-white/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            Next: {upcomingEvent.name}
          </p>
          <div className="mt-2 flex items-end gap-3 tabular-nums">
            <CountUnit value={cd.days} label="days" />
            <CountUnit value={cd.hours} label="hrs" />
            <CountUnit value={cd.minutes} label="min" />
          </div>
          <p className="mt-2 text-xs text-white/80">
            {formatEventDate(upcomingEvent.startsAt)} ·{' '}
            {formatEventTime(upcomingEvent.startsAt)}
          </p>
        </div>
      </div>
    </section>
  )
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold leading-none">
        {String(value).padStart(2, '0')}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-white/70">
        {label}
      </div>
    </div>
  )
}

interface MatchesSectionProps {
  total: number
  visible: ReturnType<typeof matchesForStudent>
  industry: string
  setIndustry: (v: string) => void
  gradYear: string
  setGradYear: (v: string) => void
  goal: string
  setGoal: (v: string) => void
  sort: SortKey
  setSort: (v: SortKey) => void
  gradYears: number[]
  filtersActive: boolean
  onClearFilters: () => void
  savedIds: string[]
  onToggleSave: (id: string) => void
  onDraftIntro: (id: string) => void
}

function MatchesSection(props: MatchesSectionProps) {
  const {
    total,
    visible,
    industry,
    setIndustry,
    gradYear,
    setGradYear,
    goal,
    setGoal,
    sort,
    setSort,
    gradYears,
    filtersActive,
    onClearFilters,
    savedIds,
    onToggleSave,
    onDraftIntro,
  } = props

  return (
    <section aria-labelledby="matches-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="matches-heading" className="text-lg font-bold tracking-tight text-ink">
          Your top matches
        </h2>
        <p className="text-sm text-stone-500 tabular-nums">
          {visible.length} of {total}
        </p>
      </div>

      <Card className="mt-3" padded={false}>
        <div className="flex flex-wrap items-end gap-3 p-4">
          <Field label="Industry">
            <Select
              value={industry}
              onChange={setIndustry}
              aria-label="Filter by industry"
            >
              <option value="">All industries</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Grad year">
            <Select
              value={gradYear}
              onChange={setGradYear}
              aria-label="Filter by grad year"
            >
              <option value="">Any year</option>
              {gradYears.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Helps with">
            <Select value={goal} onChange={setGoal} aria-label="Filter by goal">
              <option value="">Any goal</option>
              {STUDENT_GOALS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sort by">
            <Select
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              aria-label="Sort matches"
            >
              <option value="score">Best match</option>
              <option value="name">Name (A–Z)</option>
            </Select>
          </Field>
          {filtersActive && (
            <button
              type="button"
              onClick={onClearFilters}
              className="ml-auto rounded-lg px-2 py-1 text-sm font-semibold text-osu-dark hover:bg-osu-tint focus:outline-none focus:ring-2 focus:ring-osu/40"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {visible.length === 0 ? (
          <EmptyState
            title="No matches fit these filters"
            description="Try widening your industry, year, or goal filters to see more alumni."
            action={
              <Button variant="secondary" onClick={onClearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          visible.map((match, index) => {
            const alumnus = getAlumnus(match.alumnusId)
            if (!alumnus) return null
            return (
              <MatchCard
                key={match.id}
                match={match}
                alumnus={alumnus}
                rank={index + 1}
                saved={savedIds.includes(alumnus.id)}
                onToggleSave={() => onToggleSave(alumnus.id)}
                onDraftIntro={() => onDraftIntro(alumnus.id)}
              />
            )
          })
        )}
      </div>
    </section>
  )
}

function CompletenessCard({ completeness }: { completeness: number }) {
  const complete = completeness >= 100
  return (
    <Card>
      <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
        Profile strength
      </h2>
      <div className="mt-3 flex items-center gap-4">
        <MatchScoreRing score={completeness} size="lg" />
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums text-ink">
            {completeness}%
          </p>
          <p className="text-sm text-stone-500">survey complete</p>
        </div>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100"
        role="progressbar"
        aria-valuenow={completeness}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Survey completeness"
      >
        <div
          className="h-full rounded-full bg-osu transition-[width] duration-500"
          style={{ width: `${completeness}%` }}
        />
      </div>

      {complete ? (
        <p className="mt-3 text-sm text-emerald-700">
          Your profile is complete — matches are as accurate as they get.
        </p>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-stone-600">
            Finish your survey to improve match quality.
          </p>
          <Button className="mt-3 w-full">Finish your survey</Button>
        </div>
      )}
    </Card>
  )
}

function EventsSection({
  studentId,
  events,
}: {
  studentId: string
  events: ReturnType<typeof eventsForPerson>
}) {
  return (
    <section aria-labelledby="events-heading">
      <h2
        id="events-heading"
        className="text-sm font-bold uppercase tracking-wide text-stone-500"
      >
        Your events
      </h2>
      <div className="mt-3 space-y-3">
        {events.length === 0 ? (
          <EmptyState title="No events yet" description="RSVP to an event to see it here." />
        ) : (
          events.map((event) =>
            event.status === 'live' ? (
              <LiveCheckInCard key={event.id} event={event} studentId={studentId} />
            ) : (
              <EventRow key={event.id} event={event} studentId={studentId} />
            ),
          )
        )}
      </div>
    </section>
  )
}

function LiveCheckInCard({
  event,
  studentId,
}: {
  event: ReturnType<typeof eventsForPerson>[number]
  studentId: string
}) {
  const attendee = attendeeFor(event.id, studentId)
  const already = attendee?.checkInStatus === 'checked-in'
  const [checkedIn, setCheckedIn] = useState(already)
  const live = useLiveCheckIns(event.id)

  return (
    <Card className="border-osu/30 bg-osu-tint/40">
      <div className="flex items-center justify-between gap-2">
        <Badge tone="osu">Live now</Badge>
        <span className="text-xs font-medium tabular-nums text-stone-600">
          {live.checkedInCount}/{live.registeredCount} here
        </span>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-ink">{event.name}</h3>
      <p className="mt-0.5 text-xs text-stone-500">{event.venue}</p>

      {checkedIn ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.79 6.8-6.79a1 1 0 011.4 0z"
              clipRule="evenodd"
            />
          </svg>
          You&rsquo;re checked in
        </p>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-ink">You&rsquo;re here — check in to start matching.</p>
          <Button className="mt-2 w-full" onClick={() => setCheckedIn(true)}>
            Check in now
          </Button>
        </div>
      )}
    </Card>
  )
}

function EventRow({
  event,
  studentId,
}: {
  event: ReturnType<typeof eventsForPerson>[number]
  studentId: string
}) {
  const attendee = attendeeFor(event.id, studentId)
  const past = event.status === 'past'
  const statusBadge = past ? (
    <Badge tone={attendee?.checkInStatus === 'no-show' ? 'red' : 'neutral'}>
      {attendee?.checkInStatus === 'no-show' ? 'Missed' : 'Attended'}
    </Badge>
  ) : (
    <Badge tone={attendee?.rsvp === 'going' ? 'green' : 'amber'}>
      {attendee?.rsvp === 'going' ? 'Going' : 'Maybe'}
    </Badge>
  )

  return (
    <Card className={past ? 'opacity-75' : ''}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{event.name}</h3>
          <p className="mt-0.5 text-xs text-stone-500">
            {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
          </p>
          <p className="mt-0.5 truncate text-xs text-stone-500">{event.venue}</p>
        </div>
        {statusBadge}
      </div>
      {event.status === 'upcoming' && (
        <StatTile
          label="Registered"
          value={event.registeredIds.length}
          hint="attendees so far"
        />
      )}
    </Card>
  )
}

function SavedSection({
  savedIds,
  onRemove,
  onDraftIntro,
}: {
  savedIds: string[]
  onRemove: (id: string) => void
  onDraftIntro: (id: string) => void
}) {
  const saved = savedIds
    .map((id) => getAlumnus(id))
    .filter((a): a is Alumnus => Boolean(a))

  return (
    <section aria-labelledby="saved-heading">
      <h2
        id="saved-heading"
        className="text-sm font-bold uppercase tracking-wide text-stone-500"
      >
        Saved connections
      </h2>
      <div className="mt-3">
        {saved.length === 0 ? (
          <EmptyState
            title="No saved connections yet"
            description="Save an alumnus from your matches to keep them handy."
          />
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-stone-100">
              {saved.map((a) => (
                <li key={a.id} className="flex items-center gap-3 p-3">
                  <Avatar initials={a.initials} role="alumnus" size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{a.name}</p>
                    <p className="truncate text-xs text-stone-500">
                      {a.jobTitle} · {a.company}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDraftIntro(a.id)}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-osu-dark hover:bg-osu-tint focus:outline-none focus:ring-2 focus:ring-osu/40"
                    >
                      Intro
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(a.id)}
                      aria-label={`Remove ${a.name} from saved`}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-osu/40"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </section>
  )
}

function IntroDraftDialog({
  alumnusId,
  student,
  onClose,
}: {
  alumnusId: string
  student: (typeof students)[number]
  onClose: () => void
}) {
  const alumnus = getAlumnus(alumnusId)
  const match = matchesForStudent(student.id).find((m) => m.alumnusId === alumnusId)
  const [text, setText] = useState(() =>
    alumnus ? draftIntro(student, alumnus, match?.sharedInterests ?? []) : '',
  )
  const [copied, setCopied] = useState(false)

  if (!alumnus) return null

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // Clipboard unavailable; the text stays selectable for manual copy.
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="intro-title" className="text-lg font-bold tracking-tight text-ink">
              Draft an intro to {alumnus.name.split(' ')[0]}
            </h2>
            <p className="mt-0.5 text-sm text-stone-500">
              A starting template — edit it to sound like you. No message is sent.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-osu/40"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <label htmlFor="intro-text" className="sr-only">
          Intro message
        </label>
        <textarea
          id="intro-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          className="mt-4 w-full resize-none rounded-xl border border-stone-300 bg-white p-3 text-sm text-ink shadow-sm focus:border-osu focus:outline-none focus:ring-2 focus:ring-osu/40"
        />

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={copy}>{copied ? 'Copied!' : 'Copy message'}</Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </span>
      {children}
    </label>
  )
}

function Select({
  value,
  onChange,
  children,
  ...rest
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-osu focus:outline-none focus:ring-2 focus:ring-osu/40"
      {...rest}
    >
      {children}
    </select>
  )
}
