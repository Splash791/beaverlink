// Local-only availability controls: an open-to-connect switch, topic
// checkboxes, and a preferred conversation-format radio group. Nothing persists.
import { useId, useState } from 'react'
import type { Alumnus, ConversationFormat } from '../../types'
import { liveEvent } from '../../data'
import { Badge, Card } from '../../components/shared'
import { formatLabel } from './format'

const FORMATS: ConversationFormat[] = ['chat', 'coffee', 'walk-around']

export function AvailabilityPanel({ alumnus }: { alumnus: Alumnus }) {
  const [open, setOpen] = useState(alumnus.openToConnect)
  const [topics, setTopics] = useState<string[]>(alumnus.mentorshipTopics)
  const [format, setFormat] = useState<ConversationFormat>(
    alumnus.conversationFormat,
  )
  const groupId = useId()

  function toggleTopic(topic: string) {
    setTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic],
    )
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Your availability tonight
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Controls for {liveEvent.name}. Changes stay on this device.
          </p>
        </div>
        <Badge tone={open ? 'green' : 'neutral'}>
          {open ? 'Open to connect' : 'Not connecting'}
        </Badge>
      </div>

      {/* Open-to-connect switch */}
      <label className="mt-5 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={open}
          onChange={(e) => setOpen(e.target.checked)}
        />
        <span className="relative h-6 w-11 shrink-0 rounded-full bg-stone-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-osu peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-osu/40 peer-focus-visible:ring-offset-2" />
        <span className="text-sm font-medium text-ink">
          Open to connect at the live event
        </span>
      </label>
      <p className="mt-2 text-sm text-stone-500">
        {open
          ? 'Students will see you in their match suggestions and can say hi.'
          : "You're hidden from match suggestions until you turn this back on."}
      </p>

      {/* Topics willing to discuss */}
      <fieldset className="mt-6" disabled={!open}>
        <legend className="text-sm font-semibold text-ink">
          Topics you'll discuss
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {alumnus.mentorshipTopics.map((topic) => {
            const checked = topics.includes(topic)
            return (
              <label
                key={topic}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 px-3 py-2.5 text-sm transition-colors hover:bg-stone-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-osu/40"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTopic(topic)}
                  className="h-4 w-4 rounded border-stone-300 text-osu accent-osu focus:outline-none"
                />
                <span
                  className={checked ? 'text-ink' : 'text-stone-500'}
                >
                  {topic}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* Preferred conversation format */}
      <fieldset className="mt-6" disabled={!open}>
        <legend className="text-sm font-semibold text-ink">
          Preferred format
        </legend>
        <div
          role="radiogroup"
          aria-label="Preferred conversation format"
          className="mt-3 flex flex-wrap gap-2"
        >
          {FORMATS.map((f) => {
            const id = `${groupId}-${f}`
            const selected = format === f
            return (
              <label
                key={f}
                htmlFor={id}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-osu/40 ${
                  selected
                    ? 'border-osu bg-osu-tint text-osu-dark'
                    : 'border-stone-300 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name={`${groupId}-format`}
                  value={f}
                  checked={selected}
                  onChange={() => setFormat(f)}
                  className="sr-only"
                />
                {formatLabel(f)}
              </label>
            )
          })}
        </div>
      </fieldset>
    </Card>
  )
}
