// Controlled vocabularies for the demo dataset. Keeping interests, goals,
// majors, and industries as fixed lists mirrors the planned standardized
// matching features and lets the role pages build filters from them.

export const INTERESTS = [
  'Product Management',
  'UX Research',
  'Machine Learning',
  'Data Engineering',
  'Startups & Entrepreneurship',
  'Civil Infrastructure',
  'Renewable Energy',
  'Biotech',
  'Finance',
  'Marketing',
  'Game Development',
  'Cybersecurity',
  'Robotics',
  'Supply Chain',
  'Cloud Infrastructure',
  'Sustainability',
] as const

/** Networking goals skew by role; complementary pairs drive one match factor. */
export const STUDENT_GOALS = [
  'Find a mentor',
  'Land an internship',
  'Explore careers',
  'Get resume feedback',
  'Learn about grad school',
] as const

export const ALUMNI_GOALS = [
  'Mentor a student',
  'Recruit interns',
  'Give back to OSU',
  'Grow my network',
  'Share career advice',
] as const

export const MAJORS = [
  'Computer Science',
  'Electrical & Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Bioengineering',
  'Chemical Engineering',
  'Business Information Systems',
  'Data Science',
  'Finance',
  'Marketing',
  'Environmental Science',
  'Nuclear Engineering',
] as const

export const INDUSTRIES = [
  'Technology & Software',
  'Semiconductors',
  'Aerospace',
  'Renewable Energy',
  'Biotechnology',
  'Finance',
  'Consumer Products',
  'Healthcare',
  'Construction & Infrastructure',
  'Gaming',
  'Consulting',
] as const
