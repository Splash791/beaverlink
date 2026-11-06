import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'osu' | 'green' | 'indigo' | 'amber' | 'red'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-stone-100 text-stone-700 ring-stone-600/15',
  osu: 'bg-osu-tint text-osu-dark ring-osu/20',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
}

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
