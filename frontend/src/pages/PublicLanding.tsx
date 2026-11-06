// Public marketing landing (Persuade). Shown at "/" to logged-out visitors.
// "Get started" / "Sign in" / "Join now" all route to /login in this demo.
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import osuCampus from '../assets/osu-campus.png'

function NodeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <circle cx="8" cy="8" r="3.25" fill="currentColor" />
      <circle cx="16" cy="16" r="3.25" fill="currentColor" />
    </svg>
  )
}

function WhyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .8-1.5 1.3-1.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  )
}

function EventIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const features = [
  {
    icon: <NodeIcon />,
    title: 'Get matched',
    body: 'We recommend exactly who to meet, ranked by your profile, goals, and the event you are attending.',
  },
  {
    icon: <WhyIcon />,
    title: 'Know why',
    body: 'Every recommendation explains the shared interests and complementary goals behind the match — no black box.',
  },
  {
    icon: <EventIcon />,
    title: 'Make it count',
    body: 'Connect in person at OSU Alumni Association events, check in on arrival, and keep the conversation going after.',
  },
]

export function PublicLanding() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Hero with overlaid navigation */}
      <section className="relative isolate overflow-hidden">
        <img
          src={osuCampus}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-osu/25 via-transparent to-transparent mix-blend-multiply" />

        <div className="relative mx-auto flex min-h-[32rem] max-w-6xl flex-col px-5 pb-20 pt-5 sm:min-h-[36rem] sm:px-8 lg:min-h-[42rem]">
          <header className="flex items-center justify-between gap-4">
            <Logo className="text-white" />
            <nav className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="rounded-xl bg-osu px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-osu/30 transition-colors hover:bg-osu-dark"
              >
                Join now
              </Link>
            </nav>
          </header>

          <div className="mt-auto max-w-2xl pt-20">
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Welcome to BeaverLink
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
              The OSU Alumni Association's smarter way to meet the right people
              at every networking event — and understand why each connection
              matters.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-osu-dark shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Get started
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h11M11 5l5 5-5 5" />
                </svg>
              </Link>
              <span className="text-sm text-white/70">Free for OSU students &amp; alumni</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value propositions */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="value-heading">
        <div className="max-w-2xl">
          <h2 id="value-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Networking, minus the guesswork.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            At a packed alumni event, the right conversation is usually luck.
            BeaverLink turns profiles, goals, and event surveys into a ranked,
            explained list of who to meet.
          </p>
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {features.map((feature) => (
            <div key={feature.title}>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-osu-tint text-osu-dark">
                {feature.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{feature.title}</h3>
              <p className="mt-2 leading-relaxed text-stone-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-osu px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to meet your next connection?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/85">
              Sign in with a demo account and see who BeaverLink would introduce
              you to.
            </p>
            <Link
              to="/login"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-osu-dark shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Get started
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h11M11 5l5 5-5 5" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-stone-500 sm:flex-row sm:px-8">
          <Logo className="text-ink" />
          <p>Demo build · BeaverLink · OSU Alumni Association</p>
        </div>
      </footer>
    </div>
  )
}
