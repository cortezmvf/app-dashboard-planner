import type { ChartItem } from '../types'

export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

export function hasCollision(
  item: { id: string; x: number; y: number; width: number; height: number },
  others: ChartItem[]
): boolean {
  return others.some(other => {
    if (other.id === item.id) return false
    return rectsOverlap(item.x, item.y, item.width, item.height, other.x, other.y, other.width, other.height)
  })
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}

export function clampToBounds(
  x: number, y: number, width: number, height: number,
  canvasWidth: number, canvasHeight: number
): { x: number; y: number; width: number; height: number } {
  const clampedWidth = Math.min(width, canvasWidth)
  const clampedHeight = Math.min(height, canvasHeight)
  return {
    x: Math.max(0, Math.min(x, canvasWidth - clampedWidth)),
    y: Math.max(0, Math.min(y, canvasHeight - clampedHeight)),
    width: clampedWidth,
    height: clampedHeight,
  }
}
