/**
 * 岛屿数据加载器
 * 负责从 JSON 文件动态加载岛屿配置
 */

import { IslandDefinition, IslandType, IslandJSON } from '../world/IslandTypes'

// 类型映射表
const WEATHER_MAP: Record<string, IslandDefinition['weatherBias']> = {
  sunny: 'sunny',
  rainy: 'rainy',
  foggy: 'foggy',
  stormy: 'stormy',
  mixed: 'mixed',
}

const TYPE_MAP: Record<string, IslandType> = {
  forest: IslandType.FOREST,
  mineral_vein: IslandType.MINERAL_VEIN,
  ruins: IslandType.RUINS,
  storm: IslandType.STORM,
  void: IslandType.VOID,
}

const POI_TYPE_MAP: Record<string, 'ruin' | 'landmark' | 'resource_deposit' | 'shrine'> = {
  ruin: 'ruin',
  landmark: 'landmark',
  resource_deposit: 'resource_deposit',
  shrine: 'shrine',
}

/**
 * JSON 数据转换为 IslandDefinition
 */
function parseIslandJSON(json: IslandJSON): IslandDefinition {
  return {
    id: json.id,
    name: json.name,
    description: json.description,
    type: TYPE_MAP[json.type] ?? IslandType.FOREST,
    mapWidth: json.mapWidth,
    mapHeight: json.mapHeight,
    groundColor: json.groundColor,
    skyColor: json.skyColor,
    spawnPoint: json.spawnPoint,
    airshipLanding: json.airshipLanding,
    connections: json.connections,
    resources: json.resources,
    pois: json.pois.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      x: p.x,
      y: p.y,
      type: POI_TYPE_MAP[p.type] ?? 'landmark',
    })),
    creatures: json.creatures,
    merchant: json.merchant,
    dangerLevel: json.dangerLevel as 1 | 2 | 3 | 4,
    weatherBias: WEATHER_MAP[json.weatherBias] ?? 'mixed',
  }
}

// 预加载的岛屿模块
const ISLAND_MODULES = import.meta.glob('./islands/*.json', { eager: true }) as Record<string, { default: IslandJSON }>

/**
 * 岛屿数据加载器
 */
export class IslandDataLoader {
  private static instance: IslandDataLoader
  private islands: Map<string, IslandDefinition> = new Map()
  private loaded: boolean = false

  private constructor() {}

  static getInstance(): IslandDataLoader {
    if (!IslandDataLoader.instance) {
      IslandDataLoader.instance = new IslandDataLoader()
    }
    return IslandDataLoader.instance
  }

  /**
   * 加载所有岛屿数据
   */
  loadAll(): void {
    if (this.loaded) return

    for (const [path, module] of Object.entries(ISLAND_MODULES)) {
      const id = this.extractIdFromPath(path)
      if (id) {
        const island = parseIslandJSON(module.default)
        this.islands.set(id, island)
      }
    }

    this.loaded = true
  }

  /**
   * 加载单个岛屿
   */
  load(id: string): IslandDefinition | null {
    if (!this.loaded) {
      this.loadAll()
    }
    return this.islands.get(id) ?? null
  }

  /**
   * 获取所有已加载的岛屿 ID
   */
  getAllIds(): string[] {
    if (!this.loaded) {
      this.loadAll()
    }
    return Array.from(this.islands.keys())
  }

  /**
   * 获取所有岛屿定义
   */
  getAll(): IslandDefinition[] {
    if (!this.loaded) {
      this.loadAll()
    }
    return Array.from(this.islands.values())
  }

  /**
   * 检查岛屿是否存在
   */
  has(id: string): boolean {
    if (!this.loaded) {
      this.loadAll()
    }
    return this.islands.has(id)
  }

  /**
   * 动态注册岛屿（用于程序化岛屿）
   */
  register(island: IslandDefinition): void {
    this.islands.set(island.id, island)
  }

  /**
   * 从文件路径提取岛屿 ID
   * 例如: ./islands/starter_forest.json -> starter_forest
   */
  private extractIdFromPath(path: string): string | null {
    const match = path.match(/\/([^\/]+)\.json$/)
    return match ? match[1] : null
  }
}
