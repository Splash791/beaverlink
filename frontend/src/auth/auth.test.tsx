import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from './AuthProvider'
import { demoUsers, DEMO_PASSWORD } from './demoUsers'

function renderApp(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function signIn(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('demo authentication', () => {
  for (const account of demoUsers) {
    it(`logs in the ${account.role} and shows the home page`, async () => {
      renderApp()
      await signIn(account.email, DEMO_PASSWORD)

      const heading = await screen.findByRole('heading', {
        name: `Welcome, ${account.name}`,
      })
      expect(heading).toBeInTheDocument()
      expect(screen.getByText(account.email)).toBeInTheDocument()
      // Role badge renders the account's human label.
      expect(
        within(heading.parentElement as HTMLElement).getByText(account.label),
      ).toBeInTheDocument()
    })
  }

  it('shows an error for a wrong password', async () => {
    renderApp()
    await signIn(demoUsers[0].email, 'wrong-password')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Incorrect email or password.')
    expect(
      screen.queryByRole('heading', { name: /Welcome/ }),
    ).not.toBeInTheDocument()
  })

  it('redirects a logged-out visit to /home back to /login', async () => {
    renderApp('/home')

    expect(
      await screen.findByRole('button', { name: 'Sign in' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Demo accounts' })).toBeInTheDocument()
  })
})
