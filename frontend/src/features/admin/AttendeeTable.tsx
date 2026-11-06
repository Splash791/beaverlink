// Sortable, filterable attendee table. Rows join Attendee records with their
// Person; clicking a row opens the detail drawer. Scrolls horizontally on
// small screens so it stays usable on mobile.
import { useMemo, useState } from 'react'
import { Avatar, Badge, EmptyState } from '../../components/shared'
import { attendeesForEvent, getPersonById } from '../../data'
import type { Attendee, CheckInStatus, EventItem, Person, PersonRole, SurveyStatus } from '../../types'
import { CHECK_IN_LABELS, SURVEY_LABELS } from './helpers'

interface AttendeeTableProps {
  event: EventItem
  onSelectPerson: (personId: string, trigger: HTMLElement | null) => void
}

type SortKey = 'name' | 'role' | 'checkIn' | 'survey'
type SortDir = 'asc' | 'desc'
type RoleFilter = PersonRole | 'all'
type CheckInFilter = CheckInStatus | 'all'
type SurveyFilter = SurveyStatus | 'all'

interface Row {
  attendee: Attendee
  person: Person
}

const CHECK_IN_ORDER: Record<CheckInStatus, number> = {
  'checked-in': 0,
  registered: 1,
  'no-show': 2,
}
const SURVEY_ORDER: Record<SurveyStatus, number> = { complete: 0, partial: 1, none: 2 }

function checkInTone(status: CheckInStatus) {
  return status === 'checked-in' ? 'green' : status === 'no-show' ? 'red' : 'neutral'
}
function surveyTone(status: SurveyStatus) {
  return status === 'complete' ? 'green' : status === 'partial' ? 'amber' : 'neutral'
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-semibold uppercase tracking-wide text-stone-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-ink shadow-sm focus:border-osu focus:outline-none focus:ring-2 focus:ring-osu/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function SortHeader({
  label,
  columnKey,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string
  columnKey: SortKey
  sortKey: SortKey
  sortDir: SortDir
  onSort: (k: SortKey) => void
}) {
  const active = sortKey === columnKey
  return (
    <th scope="col" className="px-3 py-2 text-left">
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-stone-500 hover:text-ink focus:outline-none focus:ring-2 focus:ring-osu/40 rounded"
      >
        {label}
        <span aria-hidden="true" className={active ? 'text-osu' : 'text-stone-300'}>
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  )
}

export function AttendeeTable({ event, onSelectPerson }: AttendeeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [checkInFilter, setCheckInFilter] = useState<CheckInFilter>('all')
  const [surveyFilter, setSurveyFilter] = useState<SurveyFilter>('all')

  const allRows = useMemo<Row[]>(() => {
    return attendeesForEvent(event.id)
      .map((attendee) => {
        const person = getPersonById(attendee.personId)
        return person ? { attendee, person } : null
      })
      .filter((r): r is Row => r !== null)
  }, [event.id])

  const rows = useMemo(() => {
    const filtered = allRows.filter(
      ({ attendee, person }) =>
        (roleFilter === 'all' || person.role === roleFilter) &&
        (checkInFilter === 'all' || attendee.checkInStatus === checkInFilter) &&
        (surveyFilter === 'all' || attendee.surveyStatus === surveyFilter),
    )
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return a.person.name.localeCompare(b.person.name) * dir
        case 'role':
          return a.person.role.localeCompare(b.person.role) * dir
        case 'checkIn':
          return (CHECK_IN_ORDER[a.attendee.checkInStatus] - CHECK_IN_ORDER[b.attendee.checkInStatus]) * dir
        case 'survey':
          return (SURVEY_ORDER[a.attendee.surveyStatus] - SURVEY_ORDER[b.attendee.surveyStatus]) * dir
      }
    })
  }, [allRows, roleFilter, checkInFilter, surveyFilter, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <section aria-labelledby="attendees-h">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="attendees-h" className="text-base font-bold tracking-tight text-ink">
            Attendees
          </h2>
          <p className="text-sm text-stone-500 tabular-nums">
            Showing {rows.length} of {allRows.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select<RoleFilter>
            label="Role"
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: 'all', label: 'All roles' },
              { value: 'student', label: 'Students' },
              { value: 'alumnus', label: 'Alumni' },
            ]}
          />
          <Select<CheckInFilter>
            label="Check-in"
            value={checkInFilter}
            onChange={setCheckInFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'checked-in', label: 'Checked in' },
              { value: 'registered', label: 'Registered' },
              { value: 'no-show', label: 'No-show' },
            ]}
          />
          <Select<SurveyFilter>
            label="Survey"
            value={surveyFilter}
            onChange={setSurveyFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'complete', label: 'Complete' },
              { value: 'partial', label: 'Partial' },
              { value: 'none', label: 'Not started' },
            ]}
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No attendees match these filters"
              description="Try clearing a filter to see more people."
            />
          </div>
        ) : (
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead className="bg-stone-50">
              <tr>
                <SortHeader label="Name" columnKey="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Role" columnKey="role" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Check-in" columnKey="checkIn" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Survey" columnKey="survey" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ attendee, person }) => (
                <tr key={person.id} className="border-t border-stone-200 hover:bg-osu-tint/30">
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={(e) => onSelectPerson(person.id, e.currentTarget)}
                      className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-osu/40 rounded"
                      aria-label={`Open details for ${person.name}`}
                    >
                      <Avatar initials={person.initials} role={person.role} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{person.name}</span>
                        <span className="block truncate text-xs text-stone-500">{person.headline}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={person.role === 'student' ? 'osu' : 'green'}>
                      {person.role === 'student' ? 'Student' : 'Alumnus'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={checkInTone(attendee.checkInStatus)}>
                      {CHECK_IN_LABELS[attendee.checkInStatus]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={surveyTone(attendee.surveyStatus)}>
                      {SURVEY_LABELS[attendee.surveyStatus]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
