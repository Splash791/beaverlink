import type { Role } from '../auth/types'

const roleStyles: Record<Role, { label: string; className: string }> = {
  student: { label: 'Student', className: 'bg-[#D73F09]/10 text-[#D73F09]' },
  alumnus: { label: 'Alumnus', className: 'bg-emerald-100 text-emerald-700' },
  admin: { label: 'Event organizer', className: 'bg-indigo-100 text-indigo-700' },
}

export function RoleBadge({ role }: { role: Role }) {
  const { label, className } = roleStyles[role]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}
