// Shared domain types for the BeaverLink demo. These mirror the planned
// recommendation data model (see docs/rfcs recommendation RFC and FR-5):
// standardized interests, networking goals, and per-factor match scores that
// sum to a total. Demo only — no backend, no real personal data.

export type PersonRole = 'student' | 'alumnus'

export type ConversationFormat = 'chat' | 'coffee' | 'walk-around'

/** Controlled interest + goal vocabularies keep matching features consistent. */
export type Interest = string
export type Goal = string

interface PersonBase {
  id: string
  /** Set only for the two demo personas so a login maps to a Person. */
  email?: string
  name: string
  initials: string
  headline: string
  bio: string
  location: string
  interests: Interest[]
  goals: Goal[]
}

export interface Student extends PersonBase {
  role: 'student'
  major: string
  /** Expected graduation year. */
  classYear: number
  /** Profile + survey completeness, 0–100. */
  surveyCompleteness: number
}

export interface Alumnus extends PersonBase {
  role: 'alumnus'
  industry: string
  company: string
  jobTitle: string
  gradYear: number
  openToConnect: boolean
  mentorshipTopics: string[]
  conversationFormat: ConversationFormat
}

export type Person = Student | Alumnus

export type EventStatus = 'live' | 'upcoming' | 'past'

export interface EventItem {
  id: string
  name: string
  description: string
  venue: string
  /** ISO 8601 timestamps. */
  startsAt: string
  endsAt: string
  status: EventStatus
  registeredIds: string[]
}

export type CheckInStatus = 'checked-in' | 'registered' | 'no-show'
export type SurveyStatus = 'complete' | 'partial' | 'none'
export type RsvpStatus = 'going' | 'maybe' | 'declined'

export interface Attendee {
  eventId: string
  personId: string
  rsvp: RsvpStatus
  checkInStatus: CheckInStatus
  surveyStatus: SurveyStatus
  /** ISO timestamp of check-in, when checked in. */
  checkInAt?: string
}

/** One scoring feature. Per FR-5, factor scores sum to the match total. */
export type MatchFactorKey =
  | 'shared-interests'
  | 'career-goals'
  | 'major-industry'
  | 'complementary-goals'

export interface MatchFactor {
  key: MatchFactorKey
  label: string
  /** Maximum points this factor can contribute; weights sum to 100. */
  weight: number
  /** Points actually awarded, 0..weight. */
  score: number
  explanation: string
}

export interface Match {
  id: string
  studentId: string
  alumnusId: string
  eventId: string
  /** 0–100, equal to the sum of factor scores (FR-5). */
  score: number
  factors: MatchFactor[]
  sharedInterests: Interest[]
  headline: string
  mentorshipFit: string
}

/** Aggregate survey/match funnel for one event (admin view). */
export interface SurveyFunnel {
  registered: number
  surveyComplete: number
  matched: number
}
