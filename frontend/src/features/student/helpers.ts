// Pure helpers for the student landing page. Countdown is computed from the
// frozen demo "now" (DEMO_TODAY) so 2026 events show stable values in the demo.
import type { Alumnus, Student } from '../../types'

export interface Countdown {
  days: number
  hours: number
  minutes: number
  totalMs: number
}

/** Time from `fromIso` to `toIso`, floored to zero when the target is past. */
export function countdownTo(fromIso: string, toIso: string): Countdown {
  const totalMs = Math.max(0, new Date(toIso).getTime() - new Date(fromIso).getTime())
  const minutes = Math.floor(totalMs / 60000)
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
    totalMs,
  }
}

const dateFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})
const timeFmt = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

export function formatEventDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function formatEventTime(iso: string): string {
  return timeFmt.format(new Date(iso))
}

// Alumni goals that complement each student goal (mirrors the match model so
// the goal filter works on the real dataset).
const GOAL_TO_ALUMNI_GOALS: Record<string, string[]> = {
  'Find a mentor': ['Mentor a student', 'Share career advice', 'Give back to OSU'],
  'Land an internship': ['Recruit interns'],
  'Explore careers': ['Share career advice', 'Give back to OSU', 'Grow my network'],
  'Get resume feedback': ['Share career advice', 'Mentor a student'],
  'Learn about grad school': ['Mentor a student', 'Share career advice'],
}

/** Whether an alumnus helps with the given student goal. */
export function alumnusServesGoal(alumnus: Alumnus, goal: string): boolean {
  const wanted = GOAL_TO_ALUMNI_GOALS[goal] ?? []
  return alumnus.goals.some((g) => wanted.includes(g))
}

/** A short, copyable intro message mentioning shared interests. No AI/network. */
export function draftIntro(
  student: Student,
  alumnus: Alumnus,
  shared: string[],
): string {
  const firstName = alumnus.name.split(' ')[0]
  const commonGround =
    shared.length > 0
      ? `we both care about ${listPhrase(shared)}`
      : `I'm exploring ${alumnus.industry.toLowerCase()}`
  return [
    `Hi ${firstName},`,
    '',
    `I'm ${student.name}, a ${student.major} student at Oregon State (Class of ${student.classYear}). ` +
      `I saw that ${commonGround}, and I'd love to hear how you got into your work as ${alumnus.jobTitle} at ${alumnus.company}.`,
    '',
    `Would you be open to a quick ${alumnus.conversationFormat === 'coffee' ? 'coffee chat' : 'chat'} at the mixer?`,
    '',
    'Thanks,',
    student.name.split(' ')[0],
  ].join('\n')
}

function listPhrase(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}
