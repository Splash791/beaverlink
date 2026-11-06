import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Logo } from '../components/Logo'
import { useAuth } from '../auth/useAuth'
import { DEMO_PASSWORD, demoUsers } from '../auth/demoUsers'
import type { Role } from '../auth/types'
import osuCampus from '../assets/osu-campus.png'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Avatar tint per role, reused for the demo-account rows.
const roleAvatar: Record<Role, string> = {
  student: 'bg-osu-tint text-osu-dark',
  alumnus: 'bg-emerald-50 text-emerald-700',
  admin: 'bg-indigo-50 text-indigo-700',
}

export function LoginPage() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')

  function validate(): boolean {
    let ok = true
    if (!email.trim()) {
      setEmailError('Email is required.')
      ok = false
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError('Enter a valid email address.')
      ok = false
    } else {
      setEmailError('')
    }

    if (!password) {
      setPasswordError('Password is required.')
      ok = false
    } else {
      setPasswordError('')
    }
    return ok
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    try {
      await login(email, password)
      navigate('/home', { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  function fillDemoAccount(demoEmail: string) {
    setEmail(demoEmail)
    setPassword(DEMO_PASSWORD)
    setEmailError('')
    setPasswordError('')
    setFormError('')
  }

  return (
    <main className="flex min-h-screen flex-row-reverse bg-paper">
      {/* Campus hero — right 2/3 on large screens, hidden on mobile. */}
      <aside className="relative hidden w-2/3 overflow-hidden lg:block">
        <img
          src={osuCampus}
          alt="Oregon State University campus entrance with spring tulips"
          className="h-full w-full object-cover"
        />
        {/* Scrim for legibility: dark base plus a warm Beaver-Orange wash. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/5" />
        <div className="absolute inset-0 bg-gradient-to-tr from-osu/35 via-transparent to-transparent mix-blend-multiply" />

        <div className="absolute inset-0 flex flex-col justify-end p-10 xl:p-14">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-white xl:text-5xl">
              Meet the people worth
              <br />
              meeting — before the
              <br />
              room fills up.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
              BeaverLink recommends who OSU students and alumni should connect
              with at every networking event, and why.
            </p>
          </div>
        </div>
      </aside>

      {/* Sign-in panel — left 1/3 on large screens, full width on mobile. */}
      <section className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/3 xl:px-14">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-ink">
            <Logo />
          </div>

          <header className="mt-8">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Sign in
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Welcome back. Enter your credentials to continue.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@oregonstate.edu"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
            />

            {formError && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-600/15"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
                {formError}
              </p>
            )}

            <Button type="submit" disabled={isLoading} className="mt-1 w-full">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-stone-200" />
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                Demo accounts
              </span>
              <span className="h-px flex-1 bg-stone-200" />
            </div>
            <p className="mt-3 text-center text-xs text-stone-500">
              Click an account to autofill — password{' '}
              <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-stone-700">
                {DEMO_PASSWORD}
              </code>
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {demoUsers.map((account) => (
                <li key={account.id}>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount(account.email)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left transition-[border-color,box-shadow] hover:border-osu/50 hover:shadow-sm"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${roleAvatar[account.role]}`}
                      aria-hidden="true"
                    >
                      {account.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {account.email}
                      </span>
                      <span className="block text-xs text-stone-500">
                        {account.label}
                      </span>
                    </span>
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4 shrink-0 text-stone-300 transition-colors group-hover:text-osu"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 5l5 5-5 5"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-center text-xs text-stone-400">
            Demo build · no real authentication
          </p>
        </div>
      </section>
    </main>
  )
}
