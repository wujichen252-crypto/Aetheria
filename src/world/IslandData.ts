/**
 * 岛屿数据注册表
 * 提供统一的岛屿定义访问接口
 */

import { IslandType } from './IslandTypes'
export { IslandType }

import type {
  IslandDefinition,
  ResourceSpawn,
  POIDefinition,
  CreatureSpawn,
  MerchantSpawn,
} from './IslandTypes'

export type {
  IslandDefinition,
  ResourceSpawn,
  POIDefinition,
  CreatureSpawn,
  MerchantSpawn,
}

// ===================== 岛屿注册表 =====================

import { IslandDataLoader } from '../data/IslandDataLoader'

// 岛屿注册表（支持运行时扩展）
let ISLAND_DEFINITIONS: Record<string, IslandDefinition> = {}

/**
 * 初始化岛屿数据（从 JSON 加载）
 */
function initIslands(): void {
  const loader = IslandDataLoader.getInstance()
  const islands = loader.getAll()
  for (const island of islands) {
    ISLAND_DEFINITIONS[island.id] = island
  }
}

/**
 * 获取岛屿定义
 */
export function getIslandDefinition(id: string): IslandDefinition {
  if (Object.keys(ISLAND_DEFINITIONS).length === 0) {
    initIslands()
  }

  const island = ISLAND_DEFINITIONS[id]
  if (!island) {
    throw new Error(`Island definition not found: ${id}`)
  }
  return island
}

/**
 * 获取初始岛屿
 */
export function getInitialIsland(): IslandDefinition {
  return getIslandDefinition('starter_forest')
}

/**
 * 检查岛屿是否存在
 */
export function hasIsland(id: string): boolean {
  if (Object.keys(ISLAND_DEFINITIONS).length === 0) {
    initIslands()
  }
  return id in ISLAND_DEFINITIONS
}

/**
 * 获取所有岛屿 ID
 */
export function getAllIslandIds(): string[] {
  if (Object.keys(ISLAND_DEFINITIONS).length === 0) {
    initIslands()
  }
  return Object.keys(ISLAND_DEFINITIONS)
}

/**
 * 动态注册岛屿（用于程序化生成岛屿）
 */
export function registerIsland(island: IslandDefinition): void {
  ISLAND_DEFINITIONS[island.id] = island
}

/**
 * 导出岛屿定义集合（仅用于调试/工具）
 */
export function getAllIslandDefinitions(): Record<string, IslandDefinition> {
  if (Object.keys(ISLAND_DEFINITIONS).length === 0) {
    initIslands()
  }
  return { ...ISLAND_DEFINITIONS }
}
