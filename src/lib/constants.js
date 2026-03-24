export const HALLS = [
  'Hall 1', 'Hall 2', 'Hall 3', 'Hall 4', 'Hall 5',
  'Hall 6', 'Hall 7', 'Hall 8', 'Hall 9', 'Hall 10',
  'Hall 11', 'Hall 12', 'Hall 13', 'Hall 14', 'Hall 15',
  'Hall 16', 'Crescent Hall', 'Nanyang Hall', 'Pioneer Hall',
  'Tamarind Hall', 'Saraca Hall'
]

export const ITEM_TYPES = [
  'Luggage', 'Suitcase', 'Boxes', 'Clothes', 'Shoes', 'Books',
  'Electronics', 'Kitchen items', 'Fan', 'Bicycle', 'Furniture', 'Sports gear'
]

export const SIZE_OPTIONS = [
  { id: 'small',  icon: '🎒', label: 'Small',    desc: '1 bag / backpack',   units: 1 },
  { id: 'medium', icon: '📦', label: '1 box',    desc: 'Up to 60L box',      units: 2 },
  { id: 'large',  icon: '🧳', label: 'Suitcase', desc: 'Large luggage',      units: 3 },
  { id: 'xlarge', icon: '📦', label: '2+ boxes', desc: 'Multiple large items', units: 4 },
]

export const VOL_PER_PERSON = 4 // max units one person can bring

export function getVolColor(ratio) {
  if (ratio >= 0.9) return 'danger'
  if (ratio >= 0.65) return 'warn'
  return ''
}

export function calcVolume(members) {
  return members.reduce((sum, m) => {
    const opt = SIZE_OPTIONS.find(s => s.id === m.size)
    return sum + (opt?.units || 0)
  }, 0)
}
