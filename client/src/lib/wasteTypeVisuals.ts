type Visual = { emoji: string; bg: string; text: string }

const MAP: [string, Visual][] = [
  ['coffee grounds',           { emoji: '☕', bg: '#6b3a2a', text: '#fff' }],
  ['spent grain',              { emoji: '🍺', bg: '#b5813a', text: '#fff' }],
  ['vegetable trim',           { emoji: '🥬', bg: '#2d7a3a', text: '#fff' }],
  ['fruit scraps',             { emoji: '🍎', bg: '#c0392b', text: '#fff' }],
  ['bread',                    { emoji: '🥐', bg: '#c4922a', text: '#fff' }],
  ['bakery',                   { emoji: '🥐', bg: '#c4922a', text: '#fff' }],
  ['dairy',                    { emoji: '🧀', bg: '#5a8fba', text: '#fff' }],
  ['cardboard',                { emoji: '📦', bg: '#8a7055', text: '#fff' }],
  ['oil',                      { emoji: '🫒', bg: '#5a7a3a', text: '#fff' }],
  ['grease',                   { emoji: '🍳', bg: '#5a7a3a', text: '#fff' }],
  ['pre-consumer',             { emoji: '🥕', bg: '#d4601a', text: '#fff' }],
  ['post-consumer',            { emoji: '🍽️', bg: '#3a7a8a', text: '#fff' }],
  ['compostable',              { emoji: '🪣', bg: '#4a7a3a', text: '#fff' }],
]

const FALLBACK: Visual = { emoji: '🌱', bg: '#6b7a6a', text: '#fff' }

export function getWasteVisual(wasteType: string): Visual {
  const lower = wasteType.toLowerCase()
  for (const [key, visual] of MAP) {
    if (lower.includes(key)) return visual
  }
  return FALLBACK
}
