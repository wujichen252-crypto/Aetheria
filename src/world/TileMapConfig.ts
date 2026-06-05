/**
 * TileMap 配置系统
 * 定义瓦片地图的结构、图层和渲染规则
 */

import { IslandType } from './IslandData'

/** 瓦片大小 */
export const TILE_SIZE = 32

/** 地形类型 */
export enum TerrainType {
  GRASS = 'grass',
  DIRT = 'dirt',
  STONE = 'stone',
  SAND = 'sand',
  WATER = 'water',
  LAVA = 'lava',
  VOID = 'void',
}

/** 图层类型 */
export enum MapLayer {
  BASE = 'base',           // 基础地表
  DETAILS = 'details',     // 细节（草地、花朵等）
  OBJECTS = 'objects',     // 树木、岩石等可交互对象
  COLLISION = 'collision',  // 碰撞层
  DECORATION = 'decoration', // 装饰物（不参与碰撞）
}

/** 地形配置 */
export interface TerrainConfig {
  id: TerrainType
  name: string
  color: number           // 填充颜色
  strokeColor?: number    // 边框颜色
  walkable: boolean       // 是否可行走
  resourceType?: string   // 关联的资源类型
}

/** 瓦片配置 */
export interface TileConfig {
  x: number
  y: number
  terrain: TerrainType
  variation?: number      // 变体索引
}

/** 生物群系地形配置 */
export interface BiomeTerrainConfig {
  primary: TerrainType    // 主地形
  secondary?: TerrainType // 次要地形（用于混合）
  details: TerrainType[]  // 细节地形类型
  decorationDensity: number // 装饰物密度 0-1
}

/** 生物群系到地形的映射 */
export const BIOME_TERRAIN: Record<string, BiomeTerrainConfig> = {
  forest: {
    primary: TerrainType.GRASS,
    secondary: TerrainType.DIRT,
    details: [TerrainType.GRASS],
    decorationDensity: 0.3,
  },
  mineral_vein: {
    primary: TerrainType.STONE,
    secondary: TerrainType.DIRT,
    details: [TerrainType.STONE],
    decorationDensity: 0.2,
  },
  ruins: {
    primary: TerrainType.STONE,
    secondary: TerrainType.DIRT,
    details: [TerrainType.STONE],
    decorationDensity: 0.1,
  },
  storm: {
    primary: TerrainType.STONE,
    secondary: TerrainType.DIRT,
    details: [TerrainType.STONE],
    decorationDensity: 0.15,
  },
  void: {
    primary: TerrainType.VOID,
    secondary: TerrainType.STONE,
    details: [TerrainType.VOID],
    decorationDensity: 0.05,
  },
}

/** 地形配置表 */
export const TERRAIN_CONFIGS: Record<TerrainType, TerrainConfig> = {
  [TerrainType.GRASS]: {
    id: TerrainType.GRASS,
    name: '草地',
    color: 0x3a6a2a,
    walkable: true,
  },
  [TerrainType.DIRT]: {
    id: TerrainType.DIRT,
    name: '泥土',
    color: 0x5a4a3a,
    walkable: true,
  },
  [TerrainType.STONE]: {
    id: TerrainType.STONE,
    name: '岩石',
    color: 0x5a5a5a,
    walkable: true,
  },
  [TerrainType.SAND]: {
    id: TerrainType.SAND,
    name: '沙地',
    color: 0xc2b280,
    walkable: true,
  },
  [TerrainType.WATER]: {
    id: TerrainType.WATER,
    name: '水域',
    color: 0x2a5a8a,
    walkable: false,
  },
  [TerrainType.LAVA]: {
    id: TerrainType.LAVA,
    name: '熔岩',
    color: 0xff4500,
    walkable: false,
  },
  [TerrainType.VOID]: {
    id: TerrainType.VOID,
    name: '虚空',
    color: 0x1a0a2a,
    walkable: true,
  },
}

/** 岛屿类型到地形的映射 */
export function getBiomeTerrain(islandType: IslandType): BiomeTerrainConfig {
  const typeMap: Record<IslandType, string> = {
    [IslandType.FOREST]: 'forest',
    [IslandType.MINERAL_VEIN]: 'mineral_vein',
    [IslandType.RUINS]: 'ruins',
    [IslandType.STORM]: 'storm',
    [IslandType.VOID]: 'void',
  }
  return BIOME_TERRAIN[typeMap[islandType]] ?? BIOME_TERRAIN.forest
}
