/** Loading placeholder. Decorative; mark its container with aria-busy. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-stone-200/80 ${className}`}
    />
  )
}
