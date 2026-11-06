// Alumnus landing page. Composes the hero, ranked student matches, availability
// controls, impact summary, event RSVPs, and profile preview. Mock data only.
import { useAuth } from '../../auth/useAuth'
import { alumni, matchesForAlumnus, personByEmail } from '../../data'
import { AppShell, Badge, Card, EmptyState } from '../../components/shared'
import { Hero } from './Hero'
import { StudentMatchCard } from './StudentMatchCard'
import { AvailabilityPanel } from './AvailabilityPanel'
import { ImpactSummary } from './ImpactSummary'
import { EventRsvpList } from './EventRsvpList'
import { ProfileCard } from './ProfileCard'

export default function AlumniLanding() {
  const { user } = useAuth()
  const me = user ? personByEmail(user.email) : undefined
  const alumnus = me && me.role === 'alumnus' ? me : alumni[0]

  const matches = matchesForAlumnus(alumnus.id)

  return (
    <AppShell>
      <Hero alumnus={alumnus} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Primary column: the recommendation feed */}
        <section aria-labelledby="matches-heading" className="min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <h2
              id="matches-heading"
              className="text-xl font-bold tracking-tight"
            >
              Students who'd benefit from meeting you
            </h2>
            {matches.length > 0 && (
              <Badge tone="osu">{matches.length} matched</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Ranked by how well your experience fits their goals.
          </p>

          {matches.length === 0 ? (
            <Card className="mt-4">
              <EmptyState
                title="No matches yet"
                description="As students complete their event surveys, your best matches will appear here."
              />
            </Card>
          ) : (
            <ul className="mt-4 space-y-4">
              {matches.map((match, i) => (
                <li key={match.id}>
                  <StudentMatchCard match={match} rank={i + 1} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Secondary column: controls and context */}
        <aside className="min-w-0 space-y-6">
          <AvailabilityPanel alumnus={alumnus} />
          <ImpactSummary alumnus={alumnus} />
          <EventRsvpList alumnus={alumnus} />
          <ProfileCard alumnus={alumnus} />
        </aside>
      </div>

      <footer className="mt-10 border-t border-stone-200 pt-6 text-center">
        <Badge tone="amber">Demo data</Badge>
        <p className="mt-2 text-xs text-stone-400">
          BeaverLink demo — all people and matches are fabricated.
        </p>
      </footer>
    </AppShell>
  )
}
