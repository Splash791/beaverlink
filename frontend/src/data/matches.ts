// Deterministic match scoring. Each match's factor scores sum to its total
// (FR-5: "per-feature scores that sum to its total score"). Computed once from
// the people so every role view shows the same person the same score.
import type { Alumnus, Match, MatchFactor, Student } from '../types'
import { liveEvent } from './events'
import { alumni, students } from './people'

// Which industries a major plausibly feeds into.
const MAJOR_INDUSTRY: Record<string, string[]> = {
  'Computer Science': ['Technology & Software', 'Gaming', 'Semiconductors', 'Consulting'],
  'Electrical & Computer Engineering': ['Semiconductors', 'Technology & Software', 'Aerospace'],
  'Mechanical Engineering': ['Aerospace', 'Renewable Energy', 'Construction & Infrastructure', 'Consumer Products'],
  'Civil Engineering': ['Construction & Infrastructure', 'Renewable Energy'],
  Bioengineering: ['Biotechnology', 'Healthcare'],
  'Chemical Engineering': ['Biotechnology', 'Renewable Energy', 'Consumer Products'],
  'Business Information Systems': ['Technology & Software', 'Consulting', 'Finance'],
  'Data Science': ['Technology & Software', 'Finance', 'Healthcare'],
  Finance: ['Finance', 'Consulting'],
  Marketing: ['Consumer Products', 'Technology & Software'],
  'Environmental Science': ['Renewable Energy', 'Construction & Infrastructure'],
  'Nuclear Engineering': ['Renewable Energy', 'Aerospace'],
}

// The interests that define each industry's career field.
const INDUSTRY_FIELD: Record<string, string[]> = {
  'Technology & Software': ['Product Management', 'Cloud Infrastructure', 'Machine Learning', 'Cybersecurity'],
  Semiconductors: ['Robotics', 'Cloud Infrastructure', 'Cybersecurity'],
  Aerospace: ['Robotics', 'Supply Chain', 'Renewable Energy'],
  'Renewable Energy': ['Renewable Energy', 'Sustainability', 'Civil Infrastructure'],
  Biotechnology: ['Biotech', 'Machine Learning', 'Data Engineering'],
  Finance: ['Finance', 'Data Engineering', 'Product Management'],
  'Consumer Products': ['Marketing', 'Product Management', 'Supply Chain'],
  Healthcare: ['Data Engineering', 'Biotech', 'Machine Learning'],
  'Construction & Infrastructure': ['Civil Infrastructure', 'Supply Chain', 'Sustainability'],
  Gaming: ['Game Development', 'Machine Learning', 'Cloud Infrastructure'],
  Consulting: ['Product Management', 'Finance', 'Supply Chain'],
}

// Which alumni goals complement each student goal.
const COMPLEMENTARY: Record<string, string[]> = {
  'Find a mentor': ['Mentor a student', 'Share career advice', 'Give back to OSU'],
  'Land an internship': ['Recruit interns'],
  'Get resume feedback': ['Share career advice', 'Mentor a student'],
  'Explore careers': ['Share career advice', 'Give back to OSU', 'Grow my network'],
  'Learn about grad school': ['Mentor a student', 'Share career advice'],
}

function overlap(a: string[], b: string[]): string[] {
  const set = new Set(b)
  return a.filter((x) => set.has(x))
}

function scoreMatch(student: Student, alumnus: Alumnus): Match {
  const shared = overlap(student.interests, alumnus.interests)
  const sharedScore = Math.min(35, shared.length * 15)

  const field = INDUSTRY_FIELD[alumnus.industry] ?? []
  const fieldOverlap = overlap(student.interests, field)
  const careerScore = Math.min(25, fieldOverlap.length * 13)

  const industries = MAJOR_INDUSTRY[student.major] ?? []
  const majorScore = industries.includes(alumnus.industry) ? 20 : industries.length ? 0 : 0
  // Give partial credit if the major feeds a related (not exact) industry.
  const majorPartial =
    majorScore === 0 && fieldOverlap.length > 0 ? 8 : majorScore

  const complementary = student.goals.filter((g) =>
    (COMPLEMENTARY[g] ?? []).some((ag) => alumnus.goals.includes(ag)),
  )
  const compScore = complementary.length >= 2 ? 20 : complementary.length === 1 ? 14 : 0

  const factors: MatchFactor[] = [
    {
      key: 'shared-interests',
      label: 'Shared interests',
      weight: 35,
      score: sharedScore,
      explanation: shared.length
        ? `You both care about ${shared.join(', ')}.`
        : 'No overlapping interests yet.',
    },
    {
      key: 'career-goals',
      label: 'Career direction',
      weight: 25,
      score: careerScore,
      explanation: fieldOverlap.length
        ? `${alumnus.jobTitle} work at ${alumnus.company} lines up with your interest in ${fieldOverlap.join(', ')}.`
        : `A look into ${alumnus.industry} from the inside.`,
    },
    {
      key: 'major-industry',
      label: 'Major ↔ industry',
      weight: 20,
      score: majorPartial,
      explanation:
        majorPartial === 20
          ? `${student.major} maps directly to ${alumnus.industry}.`
          : majorPartial > 0
            ? `${student.major} connects to ${alumnus.industry} through shared skills.`
            : `${alumnus.industry} is a different path to explore.`,
    },
    {
      key: 'complementary-goals',
      label: 'Complementary goals',
      weight: 20,
      score: compScore,
      explanation: complementary.length
        ? `You want to ${complementary[0].toLowerCase()} and ${alumnus.name.split(' ')[0]} is here to help.`
        : 'Your event goals differ, which can still make for a fresh conversation.',
    },
  ]

  const score = factors.reduce((sum, f) => sum + f.score, 0)
  const mentorshipFit =
    score >= 80
      ? 'Strong mentor fit'
      : score >= 60
        ? 'Good mentor fit'
        : score >= 40
          ? 'Worth a conversation'
          : 'Light fit'

  const topFactor = [...factors].sort((a, b) => b.score - a.score)[0]

  return {
    id: `m-${student.id}-${alumnus.id}`,
    studentId: student.id,
    alumnusId: alumnus.id,
    eventId: liveEvent.id,
    score,
    factors,
    sharedInterests: shared,
    headline: topFactor.explanation,
    mentorshipFit,
  }
}

const registered = new Set(liveEvent.registeredIds)
const liveStudents = students.filter((s) => registered.has(s.id))
const liveAlumni = alumni.filter((a) => registered.has(a.id))

export const matches: Match[] = liveStudents.flatMap((student) =>
  liveAlumni.map((alumnus) => scoreMatch(student, alumnus)),
)
