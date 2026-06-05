import { getIslandDefinition } from '../world/IslandData'
import type { SaveSlot } from './SaveManager'

export interface PlayerData {
  hp: number
  stamina: number
  hunger: number
  inventory: Map<string, number>
  currentIsland: string
  discoveredIslands: string[]
  discoveredPois: string[]
  unlockedRoutes: string[]  // 已解锁的航线ID
  completedDangerLevels: number[]  // 已完成的危险等级
  airshipFuel: number
  maxHp: number
  maxStamina: number
  maxHunger: number
  skillPoints: number
  skillLevels: Array<[string, number]>
}

export class GameStateManager {
  private static instance: GameStateManager

  public data: PlayerData

  private constructor() {
    this.data = this.defaultData()
  }

  private defaultData(): PlayerData {
    return {
      hp: 100,
      stamina: 100,
      hunger: 100,
      inventory: new Map(),
      currentIsland: 'starter_forest',
      discoveredIslands: ['starter_forest'],
      discoveredPois: [],
      unlockedRoutes: [],
      completedDangerLevels: [],
      airshipFuel: 50,
      maxHp: 100,
      maxStamina: 100,
      maxHunger: 100,
      skillPoints: 0,
      skillLevels: [],
    }
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager()
    }
    return GameStateManager.instance
  }

  addItem(item: string, count: number = 1): void {
    const current = this.data.inventory.get(item) ?? 0
    this.data.inventory.set(item, current + count)
  }

  removeItem(item: string, count: number = 1): boolean {
    const current = this.data.inventory.get(item) ?? 0
    if (current < count) return false
    if (current === count) {
      this.data.inventory.delete(item)
    } else {
      this.data.inventory.set(item, current - count)
    }
    return true
  }

  hasItem(item: string, count: number = 1): boolean {
    return (this.data.inventory.get(item) ?? 0) >= count
  }

  getItemCount(item: string): number {
    return this.data.inventory.get(item) ?? 0
  }

  getTotalWeight(itemWeights: Record<string, number>): number {
    let total = 0
    this.data.inventory.forEach((count, item) => {
      total += (itemWeights[item] ?? 1) * count
    })
    return total
  }

  discoverIsland(id: string): void {
    if (!this.data.discoveredIslands.includes(id)) {
      this.data.discoveredIslands.push(id)
    }
    this.data.currentIsland = id
  }

  discoverPoi(poiId: string): void {
    if (!this.data.discoveredPois.includes(poiId)) {
      this.data.discoveredPois.push(poiId)
    }
  }

  // ---------- 航线解锁 ----------

  /** 解锁航线 */
  unlockRoute(routeId: string): void {
    if (!this.data.unlockedRoutes.includes(routeId)) {
      this.data.unlockedRoutes.push(routeId)
    }
  }

  /** 检查航线是否已解锁 */
  isRouteUnlocked(routeId: string): boolean {
    return this.data.unlockedRoutes.includes(routeId)
  }

  /** 记录完成的危险等级 */
  completeDangerLevel(level: number): void {
    if (!this.data.completedDangerLevels.includes(level)) {
      this.data.completedDangerLevels.push(level)
    }
  }

  /** 检查是否完成过指定危险等级 */
  hasCompletedDangerLevel(level: number): boolean {
    return this.data.completedDangerLevels.some(l => l >= level)
  }

  savePlayerState(hp: number, stamina: number, hunger: number): void {
    this.data.hp = hp
    this.data.stamina = stamina
    this.data.hunger = hunger
  }

  // ---------- 存档序列化 ----------

  /** 将当前数据序列化为 SaveSlot（不含索引/时间戳） */
  toSaveData(): Omit<SaveSlot, 'slotIndex' | 'timestamp'> {
    const d = this.data
    return {
      islandName: getIslandDefinition(d.currentIsland).name,
      playTime: 0,
      hp: d.hp,
      stamina: d.stamina,
      hunger: d.hunger,
      inventory: Array.from(d.inventory.entries()),
      currentIsland: d.currentIsland,
      discoveredIslands: [...d.discoveredIslands],
      discoveredPois: [...d.discoveredPois],
      unlockedRoutes: [...d.unlockedRoutes],
      completedDangerLevels: [...d.completedDangerLevels],
      airshipFuel: d.airshipFuel,
      maxHp: d.maxHp,
      maxStamina: d.maxStamina,
      maxHunger: d.maxHunger,
      skillPoints: d.skillPoints,
      skillLevels: [...d.skillLevels],
    }
  }

  /** 从 SaveSlot 恢复数据 */
  fromSaveData(slot: SaveSlot): void {
    this.data = {
      hp: slot.hp,
      stamina: slot.stamina,
      hunger: slot.hunger,
      inventory: new Map(slot.inventory),
      currentIsland: slot.currentIsland,
      discoveredIslands: [...slot.discoveredIslands],
      discoveredPois: [...slot.discoveredPois],
      unlockedRoutes: slot.unlockedRoutes ? [...slot.unlockedRoutes] : [],
      completedDangerLevels: slot.completedDangerLevels ? [...slot.completedDangerLevels] : [],
      airshipFuel: slot.airshipFuel,
      maxHp: slot.maxHp,
      maxStamina: slot.maxStamina,
      maxHunger: slot.maxHunger,
      skillPoints: slot.skillPoints,
      skillLevels: [...slot.skillLevels],
    }
  }

  reset(): void {
    this.data = this.defaultData()
  }
}
