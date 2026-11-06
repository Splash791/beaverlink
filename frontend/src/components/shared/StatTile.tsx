import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: ReactNode
  hint?: string
  /** Optional accent on the value, e.g. for the primary metric. */
  accent?: boolean
}

export function StatTile({ label, value, hint, accent = false }: StatTileProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </dt>
      <dd
        className={`mt-1 text-2xl font-bold tracking-tight tabular-nums ${
          accent ? 'text-osu' : 'text-ink'
        }`}
      >
        {value}
      </dd>
      {hint && <p className="mt-0.5 text-xs text-stone-500">{hint}</p>}
    </div>
  )
}
