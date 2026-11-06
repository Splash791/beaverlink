import { useState, type ReactNode, type SubmitEvent } from 'react'
import SuggestionInput from '../components/SuggestionInput.tsx'
import { majors } from '../data/majors.ts'

type Profile = {
  role: string
  studentYear: string
  graduationYear: string
  major: string
  industry: string
  jobTitle: string
  goals: string[]
  goalDetails: string
}

type ProfileErrors = Partial<Record<keyof Profile, string>>

const emptyProfile: Profile = {
  role: '',
  studentYear: '',
  graduationYear: '',
  major: '',
  industry: '',
  jobTitle: '',
  goals: [],
  goalDetails: '',
}

const studentYears = [
  'First year',
  'Second year',
  'Third year',
  'Fourth year',
  'Fifth year or later',
  'Graduate student',
]

const industries = [
  'Agriculture and Natural Resources',
  'Arts, Media, and Entertainment',
  'Business and Consulting',
  'Construction and Manufacturing',
  'Education',
  'Energy and Environment',
  'Engineering',
  'Finance and Insurance',
  'Government and Nonprofit',
  'Healthcare',
  'Hospitality and Tourism',
  'Marketing and Sales',
  'Science and Research',
  'Technology',
  'Other',
]

const goalOptions: Record<string, string[]> = {
  student: [
    'Find a mentor',
    'Find an internship or job',
    'Explore career paths',
    'Grow my network',
  ],
  alum: [
    'Mentor students',
    'Recruit or hire',
    'Give career advice',
    'Grow my network',
  ],
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:border-orange-600 focus:outline-none'

function isValidGraduationYear(value: string) {
  const year = Number(value)
  return /^\d{4}$/.test(value) && year >= 1900 && year <= new Date().getFullYear()
}

// Only checks the fields shown for the selected role.
function validate(profile: Profile): ProfileErrors {
  const errors: ProfileErrors = {}

  if (!profile.role) {
    errors.role = 'Choose student or alum.'
    return errors
  }

  if (profile.role === 'student') {
    if (!profile.studentYear) errors.studentYear = 'Choose your year.'
    if (!profile.major.trim()) errors.major = 'Enter your major.'
  } else {
    if (!isValidGraduationYear(profile.graduationYear.trim())) {
      errors.graduationYear = 'Enter a valid four-digit year.'
    }
    if (!profile.industry) errors.industry = 'Choose your industry.'
  }
  if (profile.goals.length === 0) errors.goals = 'Choose at least one goal.'

  return errors
}

type FieldProps = {
  id: string
  label: string
  error?: string
  children: ReactNode
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-medium text-gray-800">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

function ProfilePage() {
  const [profile, setProfile] = useState(emptyProfile)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [saved, setSaved] = useState(false)

  function update(field: Exclude<keyof Profile, 'goals'>, value: string) {
    setProfile({ ...profile, [field]: value })
    setSaved(false)
  }

  // Goal options differ by role, so switching roles clears the selection.
  function updateRole(role: string) {
    setProfile({ ...profile, role, goals: [] })
    setErrors({})
    setSaved(false)
  }

  function toggleGoal(goal: string) {
    const goals = profile.goals.includes(goal)
      ? profile.goals.filter((selected) => selected !== goal)
      : [...profile.goals, goal]
    setProfile({ ...profile, goals })
    setSaved(false)
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(profile)
    setErrors(nextErrors)
    // TODO: send to the profile API once it exists.
    setSaved(Object.keys(nextErrors).length === 0)
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-lg flex-col gap-4 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold text-orange-600">Your profile</h1>

        <Field id="role" label="I am a" error={errors.role}>
          <select
            id="role"
            className={inputClass}
            value={profile.role}
            onChange={(event) => updateRole(event.target.value)}
          >
            <option value="">Select one</option>
            <option value="student">Student</option>
            <option value="alum">Alum</option>
          </select>
        </Field>

        {profile.role === 'student' && (
          <>
            <Field id="studentYear" label="Year" error={errors.studentYear}>
              <select
                id="studentYear"
                className={inputClass}
                value={profile.studentYear}
                onChange={(event) => update('studentYear', event.target.value)}
              >
                <option value="">Select one</option>
                {studentYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="major" label="Major" error={errors.major}>
              <SuggestionInput
                id="major"
                className={inputClass}
                options={majors}
                value={profile.major}
                onChange={(value) => update('major', value)}
              />
            </Field>
          </>
        )}

        {profile.role === 'alum' && (
          <>
            <Field id="graduationYear" label="Graduation year" error={errors.graduationYear}>
              <input
                id="graduationYear"
                inputMode="numeric"
                maxLength={4}
                className={inputClass}
                value={profile.graduationYear}
                onChange={(event) => update('graduationYear', event.target.value)}
              />
            </Field>

            <Field id="major" label="Major (optional)">
              <SuggestionInput
                id="major"
                className={inputClass}
                options={majors}
                value={profile.major}
                onChange={(value) => update('major', value)}
              />
            </Field>

            <Field id="industry" label="Industry" error={errors.industry}>
              <select
                id="industry"
                className={inputClass}
                value={profile.industry}
                onChange={(event) => update('industry', event.target.value)}
              >
                <option value="">Select one</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="jobTitle" label="Job title (optional)">
              <input
                id="jobTitle"
                className={inputClass}
                value={profile.jobTitle}
                onChange={(event) => update('jobTitle', event.target.value)}
              />
            </Field>
          </>
        )}

        {profile.role && (
          <>
            <fieldset>
              <legend className="mb-1 font-medium text-gray-800">Goals</legend>
              {goalOptions[profile.role].map((goal) => (
                <label key={goal} className="flex items-center gap-2 py-1 text-gray-800">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-orange-600"
                    checked={profile.goals.includes(goal)}
                    onChange={() => toggleGoal(goal)}
                  />
                  {goal}
                </label>
              ))}
              {errors.goals && (
                <p role="alert" className="mt-1 text-sm text-red-700">
                  {errors.goals}
                </p>
              )}
            </fieldset>

            <Field id="goalDetails" label="Anything else? (optional)">
              <textarea
                id="goalDetails"
                rows={3}
                className={inputClass}
                value={profile.goalDetails}
                onChange={(event) => update('goalDetails', event.target.value)}
              />
            </Field>
          </>
        )}

        <button
          type="submit"
          className="rounded-md bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
        >
          Save profile
        </button>

        {saved && (
          <p role="status" className="text-sm text-gray-700">
            Looks good. Saving isn't connected yet, so this profile will clear when you refresh.
          </p>
        )}
      </form>
    </main>
  )
}

export default ProfilePage
