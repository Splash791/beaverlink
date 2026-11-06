// BeaverLink wordmark with a drawn "connection" mark (two linked nodes).
// The mark is always Beaver Orange; the wordmark inherits the current color.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 28 28"
        className="h-7 w-7 text-osu"
        fill="none"
        aria-hidden="true"
      >
        <line
          x1="9.5"
          y1="9.5"
          x2="18.5"
          y2="18.5"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
        <circle cx="9.5" cy="9.5" r="4" fill="currentColor" />
        <circle
          cx="18.5"
          cy="18.5"
          r="4"
          fill="var(--color-paper)"
          stroke="currentColor"
          strokeWidth="2.75"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight">BeaverLink</span>
    </span>
  )
}
