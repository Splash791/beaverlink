// Mentoring impact: three stat tiles plus a hand-built SVG bar chart of
// connections made per recent event (no chart library).
import type { Alumnus } from '../../types'
import { attendeeFor, eventsForPerson } from '../../data'
import { Card, StatTile } from '../../components/shared'

// Fixed-but-consistent history; the total feeds the "connections made" tile.
const CONNECTION_HISTORY = [
  { label: 'May', value: 5 },
  { label: 'Jun', value: 7 },
  { label: 'Aug', value: 6 },
  { label: 'Oct', value: 9 },
  { label: 'Nov', value: 7 },
]

const STUDENTS_MENTORED = 12

function BarChart() {
  const max = Math.max(...CONNECTION_HISTORY.map((d) => d.value))
  const barW = 36
  const gap = 20
  const chartH = 120
  const width = CONNECTION_HISTORY.length * (barW + gap) - gap
  const total = CONNECTION_HISTORY.reduce((s, d) => s + d.value, 0)

  return (
    <figure className="mt-5">
      <figcaption className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Connections per event
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${chartH + 24}`}
        className="mt-3 h-40 w-full"
        role="img"
        aria-label={`Connections made over the last ${CONNECTION_HISTORY.length} events, ${total} total: ${CONNECTION_HISTORY.map(
          (d) => `${d.label} ${d.value}`,
        ).join(', ')}`}
      >
        {CONNECTION_HISTORY.map((d, i) => {
          const h = (d.value / max) * chartH
          const x = i * (barW + gap)
          const y = chartH - h
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={6}
                className="fill-osu"
                opacity={0.3 + 0.7 * (d.value / max)}
              />
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-ink text-[11px] font-semibold"
                style={{ fontSize: 11 }}
              >
                {d.value}
              </text>
              <text
                x={x + barW / 2}
                y={chartH + 16}
                textAnchor="middle"
                className="fill-stone-500"
                style={{ fontSize: 11 }}
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

export function ImpactSummary({ alumnus }: { alumnus: Alumnus }) {
  const myEvents = eventsForPerson(alumnus.id)
  const attended = myEvents.filter(
    (e) => attendeeFor(e.id, alumnus.id)?.checkInStatus === 'checked-in',
  ).length
  const upcoming = myEvents.filter((e) => e.status === 'upcoming').length
  const connectionsMade = CONNECTION_HISTORY.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <h2 className="text-lg font-semibold text-ink">Your impact</h2>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          label="Connections made"
          value={connectionsMade}
          hint="Across OSU events"
          accent
        />
        <StatTile
          label="Events attended"
          value={attended}
          hint={upcoming ? `+${upcoming} upcoming` : 'All caught up'}
        />
        <StatTile
          label="Students mentored"
          value={STUDENTS_MENTORED}
          hint="Since 2023"
        />
      </dl>
      <BarChart />
    </Card>
  )
}
