import { describe, it, expect } from 'vitest'

// Test utility functions used in the app
const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const stageColor = (stage) => {
  const colors = {
    Planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Building: 'bg-green-500/10 text-green-400 border-green-500/20',
    Testing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Completed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }
  return colors[stage] || colors.Planning
}

const validateProject = (project) => {
  if (!project.title || project.title.trim() === '') return false
  if (!project.user_id) return false
  return true
}

describe('Initials utility', () => {
  it('returns correct initials for full name', () => {
    expect(initials('Skhumbuzo Mkize')).toBe('SM')
  })

  it('returns single initial for single name', () => {
    expect(initials('Skhumbuzo')).toBe('S')
  })

  it('returns ? for empty name', () => {
    expect(initials('')).toBe('?')
  })

  it('returns ? for null name', () => {
    expect(initials(null)).toBe('?')
  })
})

describe('TimeAgo utility', () => {
  it('returns just now for recent time', () => {
    const now = new Date()
    expect(timeAgo(now)).toBe('just now')
  })

  it('returns minutes ago for time within an hour', () => {
    const time = new Date(Date.now() - 5 * 60 * 1000)
    expect(timeAgo(time)).toBe('5m ago')
  })

  it('returns hours ago for time within a day', () => {
    const time = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(timeAgo(time)).toBe('3h ago')
  })

  it('returns days ago for older time', () => {
    const time = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    expect(timeAgo(time)).toBe('2d ago')
  })
})

describe('StageColor utility', () => {
  it('returns green for Building stage', () => {
    expect(stageColor('Building')).toContain('green')
  })

  it('returns blue for Planning stage', () => {
    expect(stageColor('Planning')).toContain('blue')
  })

  it('returns yellow for Testing stage', () => {
    expect(stageColor('Testing')).toContain('yellow')
  })

  it('returns purple for Completed stage', () => {
    expect(stageColor('Completed')).toContain('purple')
  })

  it('defaults to Planning color for unknown stage', () => {
    expect(stageColor('Unknown')).toBe(stageColor('Planning'))
  })
})

describe('Project validation', () => {
  it('validates a correct project', () => {
    expect(validateProject({ title: 'My App', user_id: '123' })).toBe(true)
  })

  it('rejects project without title', () => {
    expect(validateProject({ title: '', user_id: '123' })).toBe(false)
  })

  it('rejects project without user_id', () => {
    expect(validateProject({ title: 'My App', user_id: null })).toBe(false)
  })

  it('rejects project with whitespace title', () => {
    expect(validateProject({ title: '   ', user_id: '123' })).toBe(false)
  })
})