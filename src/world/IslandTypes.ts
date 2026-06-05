/**
 * 岛屿数据类型定义
 * 与 src/data/islands/*.json 保持一致
 */

export enum IslandType {
  FOREST = 'forest',
  MINERAL_VEIN = 'mineral_vein',
  RUINS = 'ruins',
  STORM = 'storm',
  VOID = 'void',
}

export interface ResourceSpawn {
  type: string
  positions: Array<{ x: number; y: number }>
}

export interface POIDefinition {
  id: string
  name: string
  description: string
  x: number
  y: number
  type: 'ruin' | 'landmark' | 'resource_deposit' | 'shrine'
}

export interface CreatureSpawn {
  type: string
  positions: Array<{ x: number; y: number }>
}

export interface MerchantSpawn {
  x: number
  y: number
}

export interface IslandDefinition {
  id: string
  name: string
  description: string
  type: IslandType
  mapWidth: number
  mapHeight: number
  groundColor: { fill: number; stroke: number; strokeAlpha: number }
  skyColor: number
  spawnPoint: { x: number; y: number }
  airshipLanding: { x: number; y: number }
  connections: string[]
  resources: ResourceSpawn[]
  pois: POIDefinition[]
  creatures: CreatureSpawn[]
  merchant?: MerchantSpawn
  dangerLevel: 1 | 2 | 3 | 4
  weatherBias: 'sunny' | 'rainy' | 'foggy' | 'stormy' | 'mixed'
}

/**
 * 岛屿 JSON 数据格式（用于数据加载）
 */
export interface IslandJSON {
  id: string
  name: string
  description: string
  type: string
  mapWidth: number
  mapHeight: number
  groundColor: { fill: number; stroke: number; strokeAlpha: number }
  skyColor: number
  spawnPoint: { x: number; y: number }
  airshipLanding: { x: number; y: number }
  connections: string[]
  resources: Array<{
    type: string
    positions: Array<{ x: number; y: number }>
  }>
  pois: Array<{
    id: string
    name: string
    description: string
    x: number
    y: number
    type: string
  }>
  creatures: Array<{
    type: string
    positions: Array<{ x: number; y: number }>
  }>
  merchant?: { x: number; y: number }
  dangerLevel: number
  weatherBias: string
}
