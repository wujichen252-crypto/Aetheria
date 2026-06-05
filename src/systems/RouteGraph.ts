/**
 * 岛屿连接图系统
 * 管理岛屿间的航线与解锁条件
 */

import { getAllIslandIds } from '../world/IslandData'
import { GameStateManager } from './GameState'

/** 航线解锁条件类型 */
export type UnlockConditionType =
  | 'visited'        // 访问过指定岛屿
  | 'has_item'       // 拥有指定物品
  | 'skill_level'    // 技能达到指定等级
  | 'danger_level'   // 完成过指定危险等级的岛屿

/** 航线解锁条件 */
export interface UnlockCondition {
  type: UnlockConditionType
  target: string      // 目标值（岛屿ID/物品ID/技能名）
  value?: number      // 数值要求
}

/** 航线定义 */
export interface RouteDefinition {
  id: string
  from: string        // 起始岛屿ID
  to: string          // 目标岛屿ID
  fuelCost: number    // 燃料消耗
  travelTime: number  // 旅行时间（毫秒）
  unlockConditions: UnlockCondition[]
  hidden: boolean     // 是否隐藏（未解锁时不显示）
}

/** 默认航线图（基于现有岛屿连接） */
function generateDefaultRoutes(): RouteDefinition[] {
  const routes: RouteDefinition[] = []
  
  // 从岛屿 JSON 的 connections 字段生成航线
  const islandConnections: Record<string, string[]> = {
    'starter_forest': ['mineral_ridge', 'ancient_ruins', 'sky_garden'],
    'mineral_ridge': ['starter_forest', 'ancient_ruins', 'forge_island', 'storm_peak'],
    'ancient_ruins': ['starter_forest', 'mineral_ridge', 'crystal_cave', 'void_fragment'],
    'forge_island': ['mineral_ridge'],
    'storm_peak': ['mineral_ridge'],
    'crystal_cave': ['ancient_ruins'],
    'void_fragment': ['ancient_ruins'],
    'sky_garden': ['starter_forest', 'world_tree'],
    'world_tree': ['sky_garden'],
  }

  const addedPairs = new Set<string>()

  for (const [from, targets] of Object.entries(islandConnections)) {
      for (const to of targets) {
        const pairKey = [from, to].sort().join('-')
        if (addedPairs.has(pairKey)) continue
        addedPairs.add(pairKey)

        // 根据目标岛屿危险等级设置解锁条件
        const dangerLevel = getDangerLevel(to)
        const conditions: UnlockCondition[] = []

        // 起始岛屿出发的低危险航线直接解锁
        const isStartingRoute = from === 'starter_forest' && dangerLevel <= 2

        if (!isStartingRoute && dangerLevel >= 3) {
          // 高危险岛屿需要先访问过危险等级 2 的岛屿
          conditions.push({
            type: 'danger_level',
            target: 'completed',
            value: 2,
          })
        }

        if (to === 'void_fragment') {
          // 虚空碎片需要特殊物品
          conditions.push({
            type: 'has_item',
            target: 'translator_fragment',
            value: 1,
          })
        }

        routes.push({
          id: `route_${from}_${to}`,
          from,
          to,
          fuelCost: 10 + dangerLevel * 5,
          travelTime: 2000 + dangerLevel * 500,
          unlockConditions: conditions,
          hidden: dangerLevel >= 4,
        })
      }
    }

  return routes
}

/** 获取岛屿危险等级 */
function getDangerLevel(islandId: string): number {
  const dangerMap: Record<string, number> = {
    'starter_forest': 1,
    'mineral_ridge': 2,
    'ancient_ruins': 2,
    'forge_island': 3,
    'storm_peak': 4,
    'crystal_cave': 3,
    'void_fragment': 4,
    'sky_garden': 1,
    'world_tree': 3,
  }
  return dangerMap[islandId] ?? 1
}

/**
 * 航线图管理器
 */
export class RouteGraph {
  private static instance: RouteGraph
  private routes: RouteDefinition[] = []

  private constructor() {
    this.routes = generateDefaultRoutes()
  }

  static getInstance(): RouteGraph {
    if (!RouteGraph.instance) {
      RouteGraph.instance = new RouteGraph()
    }
    return RouteGraph.instance
  }

  /**
   * 获取从指定岛屿出发的所有航线
   */
  getRoutesFrom(islandId: string): RouteDefinition[] {
    return this.routes.filter(r => r.from === islandId || r.to === islandId)
  }

  /**
   * 获取两个岛屿之间的航线
   */
  getRouteBetween(from: string, to: string): RouteDefinition | undefined {
    return this.routes.find(r =>
      (r.from === from && r.to === to) || (r.from === to && r.to === from)
    )
  }

  /**
   * 检查航线是否已解锁
   */
  isRouteUnlocked(routeId: string): boolean {
    const gsm = GameStateManager.getInstance()
    return gsm.isRouteUnlocked(routeId)
  }

  /**
   * 检查单个解锁条件是否满足
   */
  private checkCondition(condition: UnlockCondition): boolean {
    const gsm = GameStateManager.getInstance()
    
    switch (condition.type) {
      case 'visited':
        return gsm.data.discoveredIslands.includes(condition.target)
      case 'has_item':
        return gsm.hasItem(condition.target, condition.value ?? 1)
      case 'danger_level':
        return gsm.hasCompletedDangerLevel(condition.value ?? 1)
      case 'skill_level':
        // 技能等级检查（后续完善技能系统时实现）
        return true
      default:
        return true
    }
  }

  /**
   * 检查航线的所有解锁条件是否都满足
   */
  private canUnlockRoute(route: RouteDefinition): boolean {
    if (this.isRouteUnlocked(route.id)) return false // 已解锁则不检查
    
    return route.unlockConditions.every(cond => this.checkCondition(cond))
  }

  /**
   * 检查并自动解锁满足条件的航线
   * 返回新解锁的航线ID列表
   */
  checkAndUnlockRoutes(): string[] {
    const newlyUnlocked: string[] = []
    const gsm = GameStateManager.getInstance()
    
    for (const route of this.routes) {
      if (!this.isRouteUnlocked(route.id) && this.canUnlockRoute(route)) {
        gsm.unlockRoute(route.id)
        newlyUnlocked.push(route.id)
      }
    }
    
    return newlyUnlocked
  }

  /**
   * 获取所有航线
   */
  getAllRoutes(): RouteDefinition[] {
    return [...this.routes]
  }

  /**
   * 动态添加航线（用于程序化岛屿）
   */
  addRoute(route: RouteDefinition): void {
    // 检查是否已存在
    const existing = this.getRouteBetween(route.from, route.to)
    if (existing) return

    this.routes.push(route)
  }

  /**
   * 为程序化岛屿自动创建航线
   */
  createProceduralRoute(proceduralIslandId: string, seed: number): void {
    // 随机连接到 1-2 个已存在的岛屿
    const allIslands = getAllIslandIds()
    const existingIslands = allIslands.filter(id => !id.startsWith('procedural_'))
    
    if (existingIslands.length === 0) return

    // 使用 seed 决定连接数量
    const connectionCount = 1 + (seed % 2)
    const connectedIslands: string[] = []

    for (let i = 0; i < connectionCount && existingIslands.length > 0; i++) {
      const idx = (seed + i * 7) % existingIslands.length
      connectedIslands.push(existingIslands[idx])
    }

    const gsm = GameStateManager.getInstance()
    for (const targetIsland of connectedIslands) {
      const routeId = `route_${proceduralIslandId}_${targetIsland}`
      this.addRoute({
        id: routeId,
        from: proceduralIslandId,
        to: targetIsland,
        fuelCost: 15,
        travelTime: 3000,
        unlockConditions: [],
        hidden: false,
      })
      // 程序化岛屿直接解锁
      gsm.unlockRoute(routeId)
    }
  }
}
