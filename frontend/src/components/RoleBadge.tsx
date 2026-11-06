import type { Role } from '../auth/types'

const roleStyles: Record<Role, { label: string; className: string }> = {
  student: { label: 'Student', className: 'bg-osu-tint text-osu-dark ring-osu/15' },
  alumnus: {
    label: 'Alumnus',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  admin: {
    label: 'Event organizer',
    className: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  },
}

export function RoleBadge({ role }: { role: Role }) {
  const { label, className } = roleStyles[role]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  )
}
