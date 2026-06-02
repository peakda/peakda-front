export type Stage = 'Before' | 'Start' | 'Peak'

export const STAGE_COLOR: Record<Stage, string> = {
  Before: '#a8b0bc',
  Start: '#ff7f92',
  Peak: '#f7576b',
}

export const STAGE_PRIORITY: Record<Stage, number> = { Before: 0, Start: 1, Peak: 2 }
