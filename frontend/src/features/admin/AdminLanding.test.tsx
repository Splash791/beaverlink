import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../auth/AuthProvider'
import AdminLanding from './AdminLanding'

beforeEach(() => {
  localStorage.setItem(
    'beaverlink.demo.user',
    JSON.stringify({
      id: 'u-organizer',
      name: 'Olivia Chen',
      email: 'organizer@oregonstate.edu',
      role: 'admin',
    }),
  )
})

function setup() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminLanding />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AdminLanding', () => {
  it('defaults to the live event and shows the live banner', () => {
    setup()
    expect(screen.getByRole('heading', { name: /organizer dashboard/i })).toBeInTheDocument()
    expect(screen.getByText(/live now — fall alumni & student mixer/i)).toBeInTheDocument()
  })

  it('switching the selected event updates metrics and hides the live banner', async () => {
    const user = userEvent.setup()
    setup()
    // Upcoming event registers 12 people; live registers 20.
    expect(screen.getByText(/showing 20 of 20/i)).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /tech & engineering career night/i }))
    expect(screen.queryByText(/live now —/i)).not.toBeInTheDocument()
    expect(screen.getByText(/showing 12 of 12/i)).toBeInTheDocument()
  })

  it('filtering by role changes the visible attendee rows', async () => {
    const user = userEvent.setup()
    setup()
    const roleSelect = screen.getByLabelText('Role')
    // All 20 live attendees present initially.
    expect(screen.getByText(/showing 20 of 20/i)).toBeInTheDocument()
    await user.selectOptions(roleSelect, 'student')
    expect(screen.getByText(/showing 10 of 20/i)).toBeInTheDocument()
  })

  it('opening a row shows the detail drawer and Escape closes it', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /open details for maya thompson/i }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Maya Thompson' })).toBeInTheDocument()
    expect(within(dialog).getByText(/best match score/i)).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('a quick action shows a demo toast', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /send reminder/i }))
    expect(screen.getByText(/reminder sent to registered attendees/i)).toBeInTheDocument()
    expect(screen.getByText(/demo only/i)).toBeInTheDocument()
  })

  it('export CSV triggers a toast without throwing', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /export attendee csv/i }))
    expect(screen.getByText(/exported 20 attendees to csv/i)).toBeInTheDocument()
  })
})
