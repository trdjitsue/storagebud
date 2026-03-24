export const HALLS = [
  // Numbered halls
  'Hall 1', 'Hall 2', 'Hall 3', 'Hall 4', 'Hall 5',
  'Hall 6', 'Hall 7', 'Hall 8', 'Hall 9', 'Hall 10',
  'Hall 11', 'Hall 12', 'Hall 13', 'Hall 14', 'Hall 15', 'Hall 16',
  // Named halls
  'Crescent Hall', 'Pioneer Hall', 'Binjai Hall', 'Tanjong Hall',
  'Banyan Hall', 'Saraca Hall', 'Tamarind Hall',
]

export const HALL_ROOM_TYPES = {
  'Hall 1': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 2': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 3': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 4': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 5': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 6': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 7': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 8': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 9': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 10': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 11': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 12': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 13': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 14': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 15': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Hall 16': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)'],
  'Crescent Hall': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)', 'Toilet (Common)'],
  'Pioneer Hall': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)', 'Toilet (Common)'],
  'Binjai Hall': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)', 'Toilet (Common)'],
  'Tanjong Hall': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)', 'Toilet (Common)'],
  'Banyan Hall': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)', 'Toilet (Common)'],
  'Saraca Hall': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)', 'Toilet (Attached)', 'Toilet (Common)'],
  'Tamarind Hall': ['Single Room (Air-con)', 'Single Room (Non air-con)', 'Double Room (Air-con)', 'Double Room (Non air-con)', 'Toilet (Attached)', 'Toilet (Common)'],
}

export const ITEM_TYPES = [
  'Luggage', 'Suitcase', 'Boxes', 'Clothes', 'Shoes', 'Books',
  'Electronics', 'Kitchen items', 'Fan', 'Bicycle', 'Furniture', 'Sports gear',
  'Refrigerator (small)', 'Refrigerator (large)',
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