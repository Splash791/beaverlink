import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** Adds the default inner padding. */
  padded?: boolean
}

/** Neutral surface used across every role page. */
export function Card({ children, className = '', padded = true }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${
        padded ? 'p-5 sm:p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
