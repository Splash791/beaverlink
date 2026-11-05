import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useAuth } from '../auth/useAuth'
import { DEMO_PASSWORD, demoUsers } from '../auth/demoUsers'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
      setFormError(
        error instanceof Error ? error.message : 'Unable to sign in.',
      )
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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Beaver<span className="text-[#D73F09]">Link</span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Meet the right people at OSU Alumni events.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
            />

            {formError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {formError}
              </p>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700">Demo accounts</h2>
          <p className="mt-1 text-xs text-gray-500">
            Password for all accounts: <code className="font-mono">{DEMO_PASSWORD}</code>
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {demoUsers.map((account) => (
              <li key={account.id}>
                <button
                  type="button"
                  onClick={() => fillDemoAccount(account.email)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-sm transition-colors hover:border-[#D73F09] hover:bg-[#D73F09]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D73F09]"
                >
                  <span className="font-medium text-gray-800">{account.email}</span>
                  <span className="text-xs text-gray-500">{account.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
