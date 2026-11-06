// Slide-in detail panel for one attendee. Keyboard-accessible dialog:
// focuses the close button on open, closes on Escape, returns focus to the
// element that opened it.
import { useEffect, useId, useRef } from 'react'
import { Avatar, Badge, MatchScoreRing } from '../../components/shared'
import { Button } from '../../components/Button'
import { bestMatchScore } from '../../data'
import type { Attendee, Person } from '../../types'
import { CHECK_IN_LABELS, SURVEY_LABELS } from './helpers'

interface AttendeeDrawerProps {
  person: Person
  attendee: Attendee
  /** The element to restore focus to when the drawer closes. */
  returnFocusTo: HTMLElement | null
  onClose: () => void
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  )
}

export function AttendeeDrawer({ person, attendee, returnFocusTo, onClose }: AttendeeDrawerProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const score = bestMatchScore(person.id)

  // Focus the close button on open; restore focus on unmount.
  useEffect(() => {
    closeRef.current?.focus()
    return () => returnFocusTo?.focus()
  }, [returnFocusTo])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-stone-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar initials={person.initials} role={person.role} size="md" />
            <div>
              <h2 id={titleId} className="text-lg font-bold tracking-tight text-ink">
                {person.name}
              </h2>
              <p className="text-sm text-stone-500">{person.headline}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close attendee details"
            className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-ink focus:outline-none focus:ring-2 focus:ring-osu/40"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M6.2 6.2a1 1 0 011.4 0L10 8.6l2.4-2.4a1 1 0 111.4 1.4L11.4 10l2.4 2.4a1 1 0 01-1.4 1.4L10 11.4l-2.4 2.4a1 1 0 01-1.4-1.4L8.6 10 6.2 7.6a1 1 0 010-1.4z" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4">
            <MatchScoreRing score={score} size="lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Best match score
              </p>
              <p className="text-sm text-stone-600">
                {score >= 50
                  ? 'Has at least one strong recommended connection.'
                  : score > 0
                    ? 'Only weak matches so far — may need follow-up.'
                    : 'No matches generated yet.'}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone={person.role === 'student' ? 'osu' : 'green'}>
              {person.role === 'student' ? 'Student' : 'Alumnus'}
            </Badge>
            <Badge
              tone={
                attendee.checkInStatus === 'checked-in'
                  ? 'green'
                  : attendee.checkInStatus === 'no-show'
                    ? 'red'
                    : 'neutral'
              }
            >
              {CHECK_IN_LABELS[attendee.checkInStatus]}
            </Badge>
            <Badge
              tone={
                attendee.surveyStatus === 'complete'
                  ? 'green'
                  : attendee.surveyStatus === 'partial'
                    ? 'amber'
                    : 'neutral'
              }
            >
              Survey: {SURVEY_LABELS[attendee.surveyStatus]}
            </Badge>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4">
            <Field label="RSVP" value={attendee.rsvp} />
            <Field label="Location" value={person.location} />
            {person.role === 'student' ? (
              <>
                <Field label="Major" value={person.major} />
                <Field label="Class year" value={String(person.classYear)} />
                <Field label="Survey complete" value={`${person.surveyCompleteness}%`} />
              </>
            ) : (
              <>
                <Field label="Company" value={person.company} />
                <Field label="Job title" value={person.jobTitle} />
                <Field label="Industry" value={person.industry} />
                <Field label="Grad year" value={String(person.gradYear)} />
                <Field
                  label="Open to connect"
                  value={person.openToConnect ? 'Yes' : 'Not right now'}
                />
              </>
            )}
          </dl>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Interests</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {person.interests.map((i) => (
                <Badge key={i} tone="neutral">
                  {i}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {person.role === 'student' ? 'Goals' : 'Mentorship topics'}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(person.role === 'student' ? person.goals : person.mentorshipTopics).map((g) => (
                <Badge key={g} tone="osu">
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <p className="mt-5 text-sm text-stone-600">{person.bio}</p>
        </div>

        <footer className="border-t border-stone-200 bg-white px-5 py-3">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </div>
  )
}
