import type { PersonRole } from '../../types'

const sizes = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-11 w-11 text-base',
  lg: 'h-14 w-14 text-lg',
}

const roleTint: Record<PersonRole, string> = {
  student: 'bg-osu-tint text-osu-dark',
  alumnus: 'bg-emerald-50 text-emerald-700',
}

/** Initial-based avatar, tinted by role. Decorative — labelled by nearby name. */
export function Avatar({
  initials,
  role = 'student',
  size = 'md',
}: {
  initials: string
  role?: PersonRole
  size?: keyof typeof sizes
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${sizes[size]} ${roleTint[role]}`}
    >
      {initials}
    </span>
  )
}
