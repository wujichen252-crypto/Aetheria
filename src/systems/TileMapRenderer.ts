/**
 * TileMap 渲染系统
 * 基于 Phaser Tilemap 的地形渲染
 */

import Phaser from 'phaser'
import { IslandDefinition } from '../world/IslandData'
import {
  TILE_SIZE,
  TerrainType,
  TERRAIN_CONFIGS,
  getBiomeTerrain,
} from '../world/TileMapConfig'
import { SimpleRng } from '../utils/SimpleRng'

/** 瓦片网格数据 */
interface TileGrid {
  width: number
  height: number
  tiles: TerrainType[][]
}

/** TileMap 渲染器 */
export class TileMapRenderer {
  private scene: Phaser.Scene
  private map?: Phaser.Tilemaps.Tilemap
  private layers: Map<string, Phaser.Tilemaps.TilemapLayer> = new Map()
  private graphics?: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * 从岛屿定义渲染地图
   */
  render(island: IslandDefinition): void {
    // 先清理旧地图
    this.destroy()

    // 生成瓦片网格
    const grid = this.generateTileGrid(island)

    // 创建图形化地图（兼容无外部瓦片资源的情况）
    this.renderGraphicsMap(grid, island)
  }

  /**
   * 生成瓦片网格
   */
  private generateTileGrid(island: IslandDefinition): TileGrid {
    const tileCountX = Math.floor(island.mapWidth / TILE_SIZE)
    const tileCountY = Math.floor(island.mapHeight / TILE_SIZE)
    const biomeConfig = getBiomeTerrain(island.type)
    const rng = new SimpleRng(island.id.charCodeAt(0) * 1000)

    const tiles: TerrainType[][] = []

    for (let y = 0; y < tileCountY; y++) {
      const row: TerrainType[] = []
      for (let x = 0; x < tileCountX; x++) {
        let terrain: TerrainType

        if (x === 0 || y === 0 || x === tileCountX - 1 || y === tileCountY - 1) {
          // 边界区域
          terrain = biomeConfig.primary
        } else if (biomeConfig.secondary && rng.chance(0.2)) {
          // 次要地形混合
          terrain = biomeConfig.secondary
        } else {
          terrain = biomeConfig.primary
        }

        row.push(terrain)
      }
      tiles.push(row)
    }

    return { width: tileCountX, height: tileCountY, tiles }
  }

  /**
   * 使用 Graphics 渲染地图（兼容方案）
   * 支持与现有代码完全兼容，未来可迁移到真实 TileMap
   */
  private renderGraphicsMap(grid: TileGrid, island: IslandDefinition): void {
    this.graphics = this.scene.add.graphics()
    this.graphics.setDepth(-1)

    // 绘制地表
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const terrain = grid.tiles[y][x]
        const config = TERRAIN_CONFIGS[terrain]
        const px = x * TILE_SIZE
        const py = y * TILE_SIZE

        // 填充
        this.graphics.fillStyle(config.color, 1)
        this.graphics.fillRect(px, py, TILE_SIZE, TILE_SIZE)

        // 边框（用于网格效果，可选）
        if (config.strokeColor !== undefined) {
          this.graphics.lineStyle(1, config.strokeColor, 0.3)
          this.graphics.strokeRect(px, py, TILE_SIZE, TILE_SIZE)
        }
      }
    }

    // 添加地形装饰
    this.renderDecorations(grid, island)
  }

  /**
   * 渲染地形装饰（草、花、石头等）
   */
  private renderDecorations(grid: TileGrid, island: IslandDefinition): void {
    const biomeConfig = getBiomeTerrain(island.type)
    const rng = new SimpleRng(island.id.charCodeAt(0) * 2000)

    // 装饰物颜色配置
    const decorationColors = [
      0x4a7a3a, // 深绿（草丛）
      0x5a8a4a, // 浅绿
      0x8b7355, // 棕色（树枝）
      0x9a9a7a, // 灰色（碎石）
      0x6a5a4a, // 深棕
    ]

    if (!this.graphics) return

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const px = x * TILE_SIZE + TILE_SIZE / 2
        const py = y * TILE_SIZE + TILE_SIZE / 2

        // 根据密度概率添加装饰
        if (rng.chance(biomeConfig.decorationDensity * 0.5)) {
          const color = rng.pick(decorationColors)
          const size = rng.between(2, 5)
          const offsetX = rng.between(-8, 8)
          const offsetY = rng.between(-8, 8)

          this.graphics.fillStyle(color, 0.6)
          this.graphics.fillCircle(px + offsetX, py + offsetY, size)
        }
      }
    }
  }

  /**
   * 获取指定位置的碰撞属性
   */
  getTileAt(worldX: number, worldY: number): { walkable: boolean; terrain: TerrainType } | null {
    const tileX = Math.floor(worldX / TILE_SIZE)
    const tileY = Math.floor(worldY / TILE_SIZE)

    // 边界检查
    if (!this.graphics || tileX < 0 || tileY < 0) {
      return null
    }

    // 默认返回可行走
    return {
      walkable: true,
      terrain: TerrainType.GRASS,
    }
  }

  /**
   * 清理地图资源
   */
  destroy(): void {
    if (this.map) {
      this.map.destroy()
      this.map = undefined
    }

    if (this.graphics) {
      this.graphics.destroy()
      this.graphics = undefined
    }

    this.layers.clear()
  }

  /**
   * 获取 Graphics 对象（用于调试）
   */
  getGraphics(): Phaser.GameObjects.Graphics | undefined {
    return this.graphics
  }
}

/**
 * 瓦片坐标工具
 */
export const TileUtils = {
  /** 世界坐标转瓦片坐标 */
  worldToTile(worldX: number, worldY: number): { tileX: number; tileY: number } {
    return {
      tileX: Math.floor(worldX / TILE_SIZE),
      tileY: Math.floor(worldY / TILE_SIZE),
    }
  },

  /** 瓦片坐标转世界坐标（中心点） */
  tileToWorld(tileX: number, tileY: number): { worldX: number; worldY: number } {
    return {
      worldX: tileX * TILE_SIZE + TILE_SIZE / 2,
      worldY: tileY * TILE_SIZE + TILE_SIZE / 2,
    }
  },

  /** 计算两点间的瓦片距离 */
  tileDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = Math.abs(x1 - x2)
    const dy = Math.abs(y1 - y2)
    return Math.max(dx, dy)
  },
}
