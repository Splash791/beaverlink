// How the alumnus appears to students, with a local edit-preview toggle.
// Edits live in component state only — nothing persists in the demo.
import { useId, useState } from 'react'
import type { Alumnus } from '../../types'
import { Avatar, Badge, Card } from '../../components/shared'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'

interface Draft {
  headline: string
  jobTitle: string
  company: string
  bio: string
}

export function ProfileCard({ alumnus }: { alumnus: Alumnus }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>({
    headline: alumnus.headline,
    jobTitle: alumnus.jobTitle,
    company: alumnus.company,
    bio: alumnus.bio,
  })
  const bioId = useId()

  function update<K extends keyof Draft>(key: K, value: string) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">
          Your profile
          <span className="ml-2 align-middle text-sm font-normal text-stone-500">
            {editing ? 'editing' : 'as students see it'}
          </span>
        </h2>
        <Button
          variant="secondary"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 px-3 py-1.5"
        >
          {editing ? 'Done' : 'Edit'}
        </Button>
      </div>

      {editing ? (
        <div className="mt-5 space-y-4">
          <Input
            label="Headline"
            value={draft.headline}
            onChange={(e) => update('headline', e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Job title"
              value={draft.jobTitle}
              onChange={(e) => update('jobTitle', e.target.value)}
            />
            <Input
              label="Company"
              value={draft.company}
              onChange={(e) => update('company', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={bioId}
              className="text-xs font-semibold uppercase tracking-wide text-stone-500"
            >
              Bio
            </label>
            <textarea
              id={bioId}
              rows={3}
              value={draft.bio}
              onChange={(e) => update('bio', e.target.value)}
              className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm transition-[border-color,box-shadow] placeholder:text-stone-500 focus:border-osu focus:outline-none focus:ring-2 focus:ring-osu/40"
            />
          </div>
          <p className="text-xs text-stone-400">
            Demo only — changes aren't saved.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <div className="flex items-center gap-3">
            <Avatar initials={alumnus.initials} role="alumnus" size="lg" />
            <div>
              <p className="font-semibold text-ink">{alumnus.name}</p>
              <p className="text-sm text-stone-500">
                {draft.jobTitle} at {draft.company}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-ink">{draft.headline}</p>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            {draft.bio}
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Interests
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {alumnus.interests.map((interest) => (
                <li key={interest}>
                  <Badge tone="osu">{interest}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Mentorship topics
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {alumnus.mentorshipTopics.map((topic) => (
                <li key={topic}>
                  <Badge tone="neutral">{topic}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  )
}
