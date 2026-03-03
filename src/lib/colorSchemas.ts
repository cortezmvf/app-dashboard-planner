import type { ColorSchema } from '../types'

export const COLOR_SCHEMAS: ColorSchema[] = [
  { id: 1,  name: 'Ocean Blue',      colors: ['#1f77b4', '#4e9fd4', '#7ec3ee', '#aed8f4', '#3a6b8a', '#254d6e'] },
  { id: 2,  name: 'Forest Green',    colors: ['#2ca02c', '#55bb55', '#85d085', '#aee8ae', '#1a7a1a', '#0f5a0f'] },
  { id: 3,  name: 'Sunset',          colors: ['#ff7f0e', '#ffa94d', '#ffc88a', '#ffe0bc', '#cc5500', '#993d00'] },
  { id: 4,  name: 'Berry',           colors: ['#9467bd', '#b48fd4', '#d0b5ea', '#e8d8f7', '#6a4b99', '#4b3070'] },
  { id: 5,  name: 'Coral',           colors: ['#e3555a', '#ee8488', '#f5b0b3', '#fad4d5', '#b83a3e', '#8a2528'] },
  { id: 6,  name: 'Teal & Lime',     colors: ['#17becf', '#5dd2dc', '#3cb370', '#7dd6a0', '#0e8a99', '#267a48'] },
  { id: 7,  name: 'Corporate Blue',  colors: ['#005175', '#0077aa', '#3399cc', '#66bbee', '#003d58', '#00263a'] },
  { id: 8,  name: 'Warm Gray',       colors: ['#7f7f7f', '#a5a5a5', '#c8c8c8', '#e0e0e0', '#555555', '#333333'] },
  { id: 9,  name: 'High Contrast',   colors: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#000000'] },
  { id: 10, name: 'Pastel',          colors: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e8baff'] },
  { id: 11, name: 'Bold Primary',    colors: ['#e63946', '#457b9d', '#1d3557', '#f4a261', '#2a9d8f', '#e9c46a'] },
  { id: 12, name: 'Monochrome Blue', colors: ['#08306b', '#2171b5', '#4292c6', '#6baed6', '#9ecae1', '#c6dbef'] },
  { id: 13, name: 'Earthy',          colors: ['#8b4513', '#a0522d', '#cd853f', '#deb887', '#f5deb3', '#6b3a10'] },
  { id: 14, name: 'Neon',            colors: ['#ff00ff', '#00ffff', '#ffff00', '#ff8000', '#00ff80', '#8000ff'] },
  { id: 15, name: 'Midnight',        colors: ['#2e4057', '#048a81', '#54c6eb', '#8ee3ef', '#caf0f8', '#1a2744'] },
  { id: 16, name: 'Nature',          colors: ['#606c38', '#283618', '#dda15e', '#bc6c25', '#a3b18a', '#588157'] },
]

export function getSchema(id: number): ColorSchema {
  return COLOR_SCHEMAS.find(s => s.id === id) ?? COLOR_SCHEMAS[0]
}
