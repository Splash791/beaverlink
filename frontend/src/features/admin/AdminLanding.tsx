// Organizer dashboard for BeaverLink. Admin picks an event and sees live
// check-ins, matching health, and a sortable/filterable attendee table with a
// detail drawer. Mock data only — quick actions are demo stubs.
import { useState } from 'react'
import {
  AppShell,
  Badge,
  Card,
  StatTile,
  ToastProvider,
  useToast,
} from '../../components/shared'
import { Button } from '../../components/Button'
import { events, liveEvent, attendeeFor, getPersonById, surveyFunnel } from '../../data'
import type { EventItem } from '../../types'
import { useLiveCheckIns } from '../../hooks/useLiveCheckIns'
import { useAuth } from '../../auth/useAuth'
import { LiveCheckInPanel } from './LiveCheckInPanel'
import { MatchingHealth } from './MatchingHealth'
import { AttendeeTable } from './AttendeeTable'
import { AttendeeDrawer } from './AttendeeDrawer'
import { averageMatchScore, buildAttendeeCsv, downloadCsv } from './helpers'

const EVENT_STATUS_TONE = { live: 'osu', upcoming: 'indigo', past: 'neutral' } as const
const EVENT_STATUS_LABEL = { live: 'Live now', upcoming: 'Upcoming', past: 'Past' } as const

function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function AdminLanding() {
  return (
    <AppShell>
      <ToastProvider>
        <Dashboard />
      </ToastProvider>
    </AppShell>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const [selectedId, setSelectedId] = useState(liveEvent.id)
  const [drawer, setDrawer] = useState<{ personId: string; trigger: HTMLElement | null } | null>(null)

  const selectedEvent = events.find((e) => e.id === selectedId) ?? liveEvent
  const live = useLiveCheckIns(selectedEvent.id)
  const funnel = surveyFunnel(selectedEvent.id)
  const isLive = selectedEvent.status === 'live'

  function openDrawer(personId: string, trigger: HTMLElement | null) {
    setDrawer({ personId, trigger })
  }
  function closeDrawer() {
    setDrawer(null)
  }

  const drawerPerson = drawer ? getPersonById(drawer.personId) : undefined
  const drawerAttendee = drawer ? attendeeFor(selectedEvent.id, drawer.personId) : undefined

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Organizer dashboard</h1>
          <p className="mt-1 text-sm text-stone-500">
            Welcome back, {user?.name ?? 'organizer'} — manage check-ins and matching across your events.
          </p>
        </div>
        <Badge tone="amber">Demo data</Badge>
      </div>

      {/* Event selector */}
      <div
        className="mt-5 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Select an event"
      >
        {events.map((event) => {
          const active = event.id === selectedEvent.id
          return (
            <button
              key={event.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedId(event.id)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-osu/40 ${
                active
                  ? 'border-osu bg-osu-tint/60 text-osu-dark'
                  : 'border-stone-300 bg-white text-ink hover:bg-stone-50'
              }`}
            >
              <span className="font-semibold">{event.name}</span>
              <Badge tone={EVENT_STATUS_TONE[event.status]}>{EVENT_STATUS_LABEL[event.status]}</Badge>
            </button>
          )
        })}
      </div>

      {/* Live banner */}
      {isLive && <LiveBanner event={selectedEvent} checkedIn={live.checkedInCount} registered={live.registeredCount} />}

      {/* Stat tiles */}
      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Checked in"
          value={isLive ? `${live.checkedInCount}/${live.registeredCount}` : '—'}
          hint={isLive ? 'Updates live' : 'Not live'}
          accent
        />
        <StatTile label="Registered" value={selectedEvent.registeredIds.length} hint="RSVPs confirmed" />
        <StatTile
          label="Surveys complete"
          value={`${funnel.surveyComplete}/${funnel.registered}`}
          hint="Needed for matching"
        />
        <StatTile label="Avg match score" value={averageMatchScore(selectedEvent.id)} hint="Out of 100" />
      </dl>

      {/* Live check-in + quick actions */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveCheckInPanel event={selectedEvent} live={live} />
        </div>
        <QuickActions event={selectedEvent} />
      </div>

      {/* Matching health */}
      <div className="mt-4">
        <MatchingHealth event={selectedEvent} onSelectPerson={openDrawer} />
      </div>

      {/* Attendee table */}
      <Card className="mt-4">
        <AttendeeTable event={selectedEvent} onSelectPerson={openDrawer} />
      </Card>

      {drawer && drawerPerson && drawerAttendee && (
        <AttendeeDrawer
          person={drawerPerson}
          attendee={drawerAttendee}
          returnFocusTo={drawer.trigger}
          onClose={closeDrawer}
        />
      )}
    </div>
  )
}

function LiveBanner({
  event,
  checkedIn,
  registered,
}: {
  event: EventItem
  checkedIn: number
  registered: number
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-osu/30 bg-osu-tint/60 px-4 py-3">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-osu/70" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-osu" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-osu-dark">
          Live now — {event.name}
        </p>
        <p className="text-xs text-osu-dark/80">
          {event.venue} · {formatEventTime(event.startsAt)} · {checkedIn} of {registered} checked in
        </p>
      </div>
    </div>
  )
}

function QuickActions({ event }: { event: EventItem }) {
  const { show } = useToast()

  function handleExport() {
    const csv = buildAttendeeCsv(event.id)
    const safeName = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    downloadCsv(`${safeName || 'attendees'}.csv`, csv)
    show(`Exported ${event.registeredIds.length} attendees to CSV.`, { demo: true })
  }

  return (
    <Card className="flex flex-col">
      <h2 className="text-base font-bold tracking-tight text-ink">Quick actions</h2>
      <p className="mt-1 text-sm text-stone-500">Organizer tools for {event.name}.</p>
      <div className="mt-4 flex flex-col gap-2">
        <Button
          variant="primary"
          onClick={() => show('Reminder sent to registered attendees.', { demo: true })}
        >
          Send reminder
        </Button>
        <Button
          variant="secondary"
          onClick={() => show('Check-in kiosk opened in a new tab.', { demo: true })}
        >
          Open check-in
        </Button>
        <Button variant="secondary" onClick={handleExport}>
          Export attendee CSV
        </Button>
      </div>
    </Card>
  )
}
