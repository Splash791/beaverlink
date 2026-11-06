// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ProfilePage from './ProfilePage.tsx'

function fillIn(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function toggle(label: string) {
  fireEvent.click(screen.getByLabelText(label))
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))
}

function fillStudent() {
  fillIn('I am a', 'student')
  fillIn('Year', 'Third year')
  fillIn('Major', 'Computer Science')
  toggle('Find a mentor')
}

function fillAlum() {
  fillIn('I am a', 'alum')
  fillIn('Graduation year', '2015')
  fillIn('Industry', 'Healthcare')
  toggle('Mentor students')
}

describe('ProfilePage', () => {
  afterEach(cleanup)

  it('asks for a role before showing other fields', () => {
    render(<ProfilePage />)
    expect(screen.queryByRole('group', { name: 'Goals' })).toBeNull()

    submit()
    expect(screen.getByText('Choose student or alum.')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('shows student fields only for students', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'student')

    expect(screen.getByLabelText('Year')).toBeTruthy()
    expect(screen.queryByLabelText('Graduation year')).toBeNull()
    expect(screen.queryByLabelText('Industry')).toBeNull()
  })

  it('shows alum fields only for alumni', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'alum')

    expect(screen.getByLabelText('Graduation year')).toBeTruthy()
    expect(screen.getByLabelText('Industry')).toBeTruthy()
    expect(screen.queryByLabelText('Year')).toBeNull()
  })

  it('requires the student fields', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'student')
    submit()

    expect(screen.getByText('Choose your year.')).toBeTruthy()
    expect(screen.getByText('Enter your major.')).toBeTruthy()
    expect(screen.getByText('Choose at least one goal.')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('requires the alum fields', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'alum')
    submit()

    expect(screen.getByText('Enter a valid four-digit year.')).toBeTruthy()
    expect(screen.getByText('Choose your industry.')).toBeTruthy()
    expect(screen.getByText('Choose at least one goal.')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('accepts a complete student profile', () => {
    render(<ProfilePage />)
    fillStudent()
    submit()

    expect(screen.queryAllByRole('alert')).toHaveLength(0)
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('accepts an alum profile without the optional fields', () => {
    render(<ProfilePage />)
    fillAlum()
    submit()

    expect(screen.queryAllByRole('alert')).toHaveLength(0)
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it.each(['abcd', '15', '1899', String(new Date().getFullYear() + 1)])(
    'rejects %s as a graduation year',
    (year) => {
      render(<ProfilePage />)
      fillAlum()
      fillIn('Graduation year', year)
      submit()

      expect(screen.getByText('Enter a valid four-digit year.')).toBeTruthy()
      expect(screen.queryByRole('status')).toBeNull()
    },
  )

  it('rejects required fields that only contain spaces', () => {
    render(<ProfilePage />)
    fillStudent()
    fillIn('Major', '   ')
    submit()

    expect(screen.getByText('Enter your major.')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('filters major suggestions as the user types', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'student')
    fillIn('Major', 'comp')

    expect(screen.getByRole('option', { name: 'Computer Science' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Accountancy' })).toBeNull()
  })

  it('fills in the major when a suggestion is clicked', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'student')
    fillIn('Major', 'comp')
    fireEvent.click(screen.getByRole('option', { name: 'Computer Science' }))

    const major = screen.getByLabelText('Major') as HTMLInputElement
    expect(major.value).toBe('Computer Science')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('picks a suggestion with the keyboard without submitting the form', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'student')
    fillIn('Major', 'computer science')

    const major = screen.getByLabelText('Major') as HTMLInputElement
    fireEvent.keyDown(major, { key: 'ArrowDown' })
    fireEvent.keyDown(major, { key: 'Enter' })

    expect(major.value).toBe('Computer Science')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('closes the suggestions on Escape and when focus leaves', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'student')
    const major = screen.getByLabelText('Major')

    fireEvent.focus(major)
    expect(screen.getByRole('listbox')).toBeTruthy()
    fireEvent.keyDown(major, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.focus(major)
    fireEvent.blur(major)
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('accepts a major that is not in the suggestions', () => {
    render(<ProfilePage />)
    fillStudent()
    fillIn('Major', 'Retired Program Name')
    submit()

    expect(screen.queryAllByRole('alert')).toHaveLength(0)
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('shows goal options for the selected role', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'student')
    expect(screen.getByLabelText('Find a mentor')).toBeTruthy()
    expect(screen.queryByLabelText('Recruit or hire')).toBeNull()

    fillIn('I am a', 'alum')
    expect(screen.getByLabelText('Recruit or hire')).toBeTruthy()
    expect(screen.queryByLabelText('Find a mentor')).toBeNull()
  })

  it('clears selected goals when the role changes', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'student')
    toggle('Grow my network')

    fillIn('I am a', 'alum')
    const shared = screen.getByLabelText('Grow my network') as HTMLInputElement
    expect(shared.checked).toBe(false)
  })

  it('requires a goal again after unchecking the only one', () => {
    render(<ProfilePage />)
    fillStudent()
    toggle('Find a mentor')
    submit()

    expect(screen.getByText('Choose at least one goal.')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('clears errors when the role changes', () => {
    render(<ProfilePage />)
    fillIn('I am a', 'student')
    submit()
    expect(screen.queryAllByRole('alert')).not.toHaveLength(0)

    fillIn('I am a', 'alum')
    expect(screen.queryAllByRole('alert')).toHaveLength(0)
  })

  it('clears the confirmation when a field changes after submitting', () => {
    render(<ProfilePage />)
    fillStudent()
    submit()
    expect(screen.getByRole('status')).toBeTruthy()

    toggle('Grow my network')
    expect(screen.queryByRole('status')).toBeNull()
  })
})
