import { beforeEach, expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../auth/AuthProvider'
import StudentLanding from './StudentLanding'

beforeEach(() => {
  localStorage.setItem(
    'beaverlink.demo.user',
    JSON.stringify({
      id: 'u-student',
      name: 'Maya Thompson',
      email: 'student@oregonstate.edu',
      role: 'student',
    }),
  )
})

function setup() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <StudentLanding />
      </AuthProvider>
    </MemoryRouter>,
  )
}

test('greets the signed-in student and shows top matches', () => {
  setup()
  expect(
    screen.getByRole('heading', { name: /welcome back, maya/i }),
  ).toBeInTheDocument()
  // David Okafor is Maya's top match (score 100).
  expect(screen.getByRole('heading', { name: 'David Okafor' })).toBeInTheDocument()
  expect(screen.getByText('10 of 10')).toBeInTheDocument()
})

test('expanding a match reveals the WhyMatchPanel breakdown', async () => {
  const user = userEvent.setup()
  setup()
  const whyButtons = screen.getAllByRole('button', { name: /why this match/i })
  expect(screen.queryByText('Why this match', { selector: 'h4' })).not.toBeInTheDocument()

  await user.click(whyButtons[0])

  expect(whyButtons[0]).toHaveAttribute('aria-expanded', 'true')
  expect(await screen.findByText('Shared interests')).toBeInTheDocument()
  expect(screen.getByText('Major ↔ industry')).toBeInTheDocument()
})

test('filtering by industry changes the visible matches', async () => {
  const user = userEvent.setup()
  setup()
  expect(screen.getByText('10 of 10')).toBeInTheDocument()

  await user.selectOptions(
    screen.getByRole('combobox', { name: /filter by industry/i }),
    'Finance',
  )

  // Fewer matches remain and James Wright (Finance) survives the filter.
  expect(screen.queryByText('10 of 10')).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'James Wright' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'David Okafor' })).not.toBeInTheDocument()
})

test('sorting by name reorders matches alphabetically', async () => {
  const user = userEvent.setup()
  setup()
  await user.selectOptions(
    screen.getByRole('combobox', { name: /sort matches/i }),
    'name',
  )
  const region = screen.getByRole('region', { name: /your top matches/i })
  const names = within(region)
    .getAllByRole('heading', { level: 3 })
    .map((h) => h.textContent ?? '')
  const sorted = [...names].sort((a, b) => a.localeCompare(b))
  expect(names).toEqual(sorted)
})

test('survey nudge shows because Maya is below 100%', () => {
  setup()
  expect(screen.getByText(/finish your survey to improve match quality/i)).toBeInTheDocument()
  expect(
    screen.getByRole('progressbar', { name: /survey completeness/i }),
  ).toHaveAttribute('aria-valuenow', '70')
})

test('drafting an intro opens a dialog with a templated message', async () => {
  const user = userEvent.setup()
  setup()
  const draftButtons = screen.getAllByRole('button', { name: /^draft intro$/i })
  await user.click(draftButtons[0])

  const dialog = await screen.findByRole('dialog')
  const textarea = within(dialog).getByRole<HTMLTextAreaElement>('textbox')
  expect(textarea.value).toContain('Computer Science student at Oregon State')
})

test('saved connections list is seeded and supports removal', async () => {
  const user = userEvent.setup()
  setup()
  const region = screen.getByRole('region', { name: /saved connections/i })
  // Top match (David Okafor) is seeded into saved connections.
  expect(within(region).getByText('David Okafor')).toBeInTheDocument()

  await user.click(within(region).getByRole('button', { name: /remove david okafor/i }))
  expect(within(region).queryByText('David Okafor')).not.toBeInTheDocument()
  expect(within(region).getByText(/no saved connections yet/i)).toBeInTheDocument()
})
