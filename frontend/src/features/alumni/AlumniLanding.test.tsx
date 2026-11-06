import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../../auth/AuthProvider'
import AlumniLanding from './AlumniLanding'

beforeEach(() => {
  localStorage.setItem(
    'beaverlink.demo.user',
    JSON.stringify({
      id: 'u-alumnus',
      name: 'David Okafor',
      email: 'alumni@oregonstate.edu',
      role: 'alumnus',
    }),
  )
})

function setup() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AlumniLanding />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AlumniLanding', () => {
  it('welcomes the signed-in alumnus and renders ranked student match cards', () => {
    setup()
    expect(
      screen.getByRole('heading', { name: /welcome back, david/i }),
    ).toBeInTheDocument()
    // Maya Thompson (s1) is a registered student matched to David.
    expect(screen.getByText('Maya Thompson')).toBeInTheDocument()
    expect(screen.getByText(/matched/i)).toBeInTheDocument()
  })

  it('updates the UI when toggling "open to connect"', async () => {
    const user = userEvent.setup()
    setup()
    const toggle = screen.getByRole('checkbox', {
      name: /open to connect at the live event/i,
    })
    expect(toggle).toBeChecked()
    expect(
      screen.getByText(/students will see you in their match suggestions/i),
    ).toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).not.toBeChecked()
    expect(
      screen.getByText(/hidden from match suggestions/i),
    ).toBeInTheDocument()
  })

  it('expands a match card to reveal the WhyMatchPanel breakdown', async () => {
    const user = userEvent.setup()
    setup()
    expect(screen.queryByText('Why this match')).not.toBeInTheDocument()

    const expander = screen.getByRole('button', {
      name: /why maya thompson is a good match/i,
    })
    expect(expander).toHaveAttribute('aria-expanded', 'false')

    await user.click(expander)
    expect(expander).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Why this match')).toBeInTheDocument()
  })

  it('shows the live event with an initial checked-in count', () => {
    setup()
    expect(screen.getByText('Checked in')).toBeInTheDocument()
    // 8 people are pre-checked-in at the live event before any timer ticks.
    expect(screen.getByText(/\/ 20/)).toBeInTheDocument()
  })
})
