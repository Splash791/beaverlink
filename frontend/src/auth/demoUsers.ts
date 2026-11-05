// DEMO ONLY: hardcoded accounts with a plaintext password for a front-end
// walking skeleton. Replace this entirely with real authentication (Supabase
// Auth or OSU SSO) before any real use. Never ship client-side credentials.
import type { User } from './types'

export const DEMO_PASSWORD = 'demo1234'

export interface DemoAccount extends User {
  label: string
}

export const demoUsers: DemoAccount[] = [
  {
    id: 'u-student',
    name: 'Sam Student',
    email: 'student@oregonstate.edu',
    role: 'student',
    label: 'Student',
  },
  {
    id: 'u-alumnus',
    name: 'Alex Alumni',
    email: 'alumni@oregonstate.edu',
    role: 'alumnus',
    label: 'Alumnus',
  },
  {
    id: 'u-organizer',
    name: 'Olivia Organizer',
    email: 'organizer@oregonstate.edu',
    role: 'admin',
    label: 'Event organizer',
  },
]
