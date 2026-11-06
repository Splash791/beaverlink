// Circular match-score indicator, hand-built SVG (no chart library).
const sizes = {
  sm: { box: 44, stroke: 5, font: 'text-xs' },
  md: { box: 60, stroke: 6, font: 'text-sm' },
  lg: { box: 84, stroke: 7, font: 'text-lg' },
}

function colorFor(score: number): string {
  if (score >= 75) return 'var(--color-osu)'
  if (score >= 55) return '#ea7a3c'
  return '#a8a29e' // stone-400 for weak matches
}

export function MatchScoreRing({
  score,
  size = 'md',
}: {
  score: number
  size?: keyof typeof sizes
}) {
  const { box, stroke, font } = sizes[size]
  const r = (box - stroke) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference * (1 - clamped / 100)

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={`Match score ${clamped} out of 100`}
      style={{ width: box, height: box }}
    >
      <svg width={box} height={box} className="-rotate-90">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={r}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={stroke}
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={r}
          fill="none"
          stroke={colorFor(clamped)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className={`absolute font-bold tabular-nums text-ink ${font}`}
        aria-hidden="true"
      >
        {clamped}
      </span>
    </div>
  )
}
