import { IslandType, IslandDefinition, ResourceSpawn, CreatureSpawn } from '../world/IslandData'
import { SimpleRng } from '../utils/SimpleRng'

/** 简单线性同余随机数生成器（可复省） */
// SimpleRng 已移至 utils/SimpleRng.ts

/** 资源生成规则 */
interface ResourceRule {
  type: string
  min: number
  max: number
  probability: number
  clustering: number // 0-1 聚集程度
}

/** 生物生成规则 */
interface CreatureRule {
  type: string
  min: number
  max: number
  probability: number
}

/** POI 生成规则 */
interface POIRule {
  type: 'ruin' | 'landmark' | 'resource_deposit' | 'shrine'
  name: string
  description: string
  probability: number
}

/** 生物群系配置 */
interface BiomeConfig {
  id: string
  name: string
  description: string
  groundColor: { fill: number; stroke: number; strokeAlpha: number }
  skyColor: number
  weatherBias: IslandDefinition['weatherBias']
  islandType: IslandType
  dangerLevel: 1 | 2 | 3 | 4
  mapWidth: number
  mapHeight: number
  resources: ResourceRule[]
  creatures: CreatureRule[]
  pois: POIRule[]
  hasMerchant: boolean
}

/** 生物群系配置集 */
const BIOMES: BiomeConfig[] = [
  {
    id: 'moss_isle',
    name: '青苔小岛',
    description: '一座被翠绿苔藓覆盖的宁静小岛。',
    groundColor: { fill: 0x3a5a3a, stroke: 0x2a4a2a, strokeAlpha: 0.3 },
    skyColor: 0x1a1a2e,
    weatherBias: 'sunny',
    islandType: IslandType.FOREST,
    dangerLevel: 1,
    mapWidth: 640,
    mapHeight: 480,
    hasMerchant: false,
    resources: [
      { type: 'tree', min: 6, max: 10, probability: 1.0, clustering: 0.3 },
      { type: 'rock', min: 2, max: 5, probability: 0.8, clustering: 0.2 },
      { type: 'berry_bush', min: 2, max: 4, probability: 0.9, clustering: 0.4 },
      { type: 'iron_ore', min: 0, max: 2, probability: 0.3, clustering: 0.5 },
    ],
    creatures: [
      { type: 'forest_rabbit', min: 1, max: 3, probability: 0.8 },
      { type: 'forest_spider', min: 0, max: 2, probability: 0.4 },
    ],
    pois: [
      { type: 'shrine', name: '古老祭坛', description: '一座被藤蔓缠绕的神秘祭坛。', probability: 0.5 },
    ],
  },
  {
    id: 'sandstone_island',
    name: '砂石岛',
    description: '风化的岩石间闪烁着矿石的光芒。',
    groundColor: { fill: 0x5a4a3a, stroke: 0x4a3a2a, strokeAlpha: 0.4 },
    skyColor: 0x1a1a2e,
    weatherBias: 'foggy',
    islandType: IslandType.MINERAL_VEIN,
    dangerLevel: 2,
    mapWidth: 800,
    mapHeight: 600,
    hasMerchant: true,
    resources: [
      { type: 'rock', min: 8, max: 12, probability: 1.0, clustering: 0.5 },
      { type: 'iron_ore', min: 3, max: 6, probability: 0.9, clustering: 0.6 },
      { type: 'tree', min: 1, max: 3, probability: 0.5, clustering: 0.2 },
    ],
    creatures: [
      { type: 'ridge_wolf', min: 1, max: 3, probability: 0.7 },
    ],
    pois: [
      { type: 'resource_deposit', name: '矿脉入口', description: '深邃的洞穴中传来金属的敲击声。', probability: 0.6 },
    ],
  },
  {
    id: 'barren_reef',
    name: '荒芜岩礁',
    description: '除了岩石与风暴，这里一无所有。',
    groundColor: { fill: 0x4a4a4a, stroke: 0x3a3a3a, strokeAlpha: 0.4 },
    skyColor: 0x0a0a1e,
    weatherBias: 'stormy',
    islandType: IslandType.STORM,
    dangerLevel: 3,
    mapWidth: 768,
    mapHeight: 576,
    hasMerchant: false,
    resources: [
      { type: 'rock', min: 10, max: 15, probability: 1.0, clustering: 0.6 },
      { type: 'iron_ore', min: 2, max: 4, probability: 0.7, clustering: 0.4 },
    ],
    creatures: [
      { type: 'ridge_wolf', min: 2, max: 4, probability: 0.9 },
    ],
    pois: [
      { type: 'landmark', name: '雷击之岩', description: '高耸的岩石被闪电劈成奇异的形状。', probability: 0.7 },
    ],
  },
  {
    id: 'lush_isle',
    name: '茂盛浮岛',
    description: '奇异的植物在这里野蛮生长。',
    groundColor: { fill: 0x2d5a2d, stroke: 0x1a4a1a, strokeAlpha: 0.3 },
    skyColor: 0x1a1a2e,
    weatherBias: 'mixed',
    islandType: IslandType.FOREST,
    dangerLevel: 2,
    mapWidth: 960,
    mapHeight: 720,
    hasMerchant: true,
    resources: [
      { type: 'tree', min: 10, max: 16, probability: 1.0, clustering: 0.4 },
      { type: 'berry_bush', min: 4, max: 7, probability: 1.0, clustering: 0.5 },
      { type: 'rock', min: 2, max: 5, probability: 0.7, clustering: 0.3 },
    ],
    creatures: [
      { type: 'forest_rabbit', min: 2, max: 5, probability: 0.9 },
      { type: 'forest_spider', min: 1, max: 3, probability: 0.6 },
      { type: 'ancient_golem', min: 0, max: 1, probability: 0.2 },
    ],
    pois: [
      { type: 'shrine', name: '生命之泉', description: '清澈的泉水散发着奇异的光芒。', probability: 0.6 },
      { type: 'landmark', name: '花藤长廊', description: '古老的拱门被发光藤蔓覆盖。', probability: 0.5 },
    ],
  },
  {
    id: 'crystal_cave',
    name: '水晶洞窟',
    description: '巨大的水晶从洞顶垂下。',
    groundColor: { fill: 0x2a2a4a, stroke: 0x1a1a3a, strokeAlpha: 0.3 },
    skyColor: 0x1a1a2e,
    weatherBias: 'foggy',
    islandType: IslandType.MINERAL_VEIN,
    dangerLevel: 3,
    mapWidth: 800,
    mapHeight: 640,
    hasMerchant: false,
    resources: [
      { type: 'rock', min: 6, max: 10, probability: 1.0, clustering: 0.5 },
      { type: 'iron_ore', min: 4, max: 8, probability: 0.9, clustering: 0.6 },
    ],
    creatures: [
      { type: 'forest_spider', min: 2, max: 4, probability: 0.8 },
    ],
    pois: [
      { type: 'shrine', name: '水晶之心', description: '脉动的水晶散发着神秘的能量。', probability: 0.8 },
      { type: 'landmark', name: '荧光水池', description: '漂浮的水晶碎片映照梦幻色彩。', probability: 0.6 },
    ],
  },
  {
    id: 'void_fragment',
    name: '虚空碎片',
    description: '空间裂痕撕裂现实。',
    groundColor: { fill: 0x1a0a2a, stroke: 0x0a0020, strokeAlpha: 0.6 },
    skyColor: 0x050510,
    weatherBias: 'stormy',
    islandType: IslandType.VOID,
    dangerLevel: 4,
    mapWidth: 768,
    mapHeight: 576,
    hasMerchant: false,
    resources: [
      { type: 'rock', min: 4, max: 8, probability: 1.0, clustering: 0.4 },
    ],
    creatures: [
      { type: 'forest_spider', min: 2, max: 4, probability: 0.8 },
      { type: 'ancient_golem', min: 1, max: 2, probability: 0.5 },
    ],
    pois: [
      { type: 'ruin', name: '虚空裂隙', description: '不属于这个世界的气息从中透出。', probability: 0.9 },
    ],
  },
]

/**
 * 生成一个程序化岛屿
 * @param seed 种子
 * @param targetBiomeId 可选的指定生物群系
 */
export function generateProceduralIsland(seed: number, targetBiomeId?: string): IslandDefinition {
  const rng = new SimpleRng(seed)
  
  let biome: BiomeConfig
  if (targetBiomeId) {
    biome = BIOMES.find(b => b.id === targetBiomeId) || BIOMES[0]
  } else {
    biome = rng.pick(BIOMES)
  }

  const w = biome.mapWidth
  const h = biome.mapHeight

  const resources: ResourceSpawn[] = []

  for (const rule of biome.resources) {
    if (!rng.chance(rule.probability)) continue

    const count = rng.between(rule.min, rule.max)
    if (count <= 0) continue

    const positions: Array<{ x: number; y: number }> = []
    let lastX = rng.between(80, w - 80)
    let lastY = rng.between(80, h - 80)

    for (let i = 0; i < count; i++) {
      let x: number, y: number

      if (i > 0 && rng.chance(rule.clustering)) {
        x = lastX + rng.between(-60, 60)
        y = lastY + rng.between(-60, 60)
      } else {
        x = rng.between(80, w - 80)
        y = rng.between(80, h - 80)
      }

      x = Math.max(60, Math.min(w - 60, x))
      y = Math.max(60, Math.min(h - 60, y))
      positions.push({ x, y })

      lastX = x
      lastY = y
    }
    resources.push({ type: rule.type, positions })
  }

  const creatures: CreatureSpawn[] = []
  for (const rule of biome.creatures) {
    if (!rng.chance(rule.probability)) continue

    const count = rng.between(rule.min, rule.max)
    if (count <= 0) continue

    const positions: Array<{ x: number; y: number }> = []
    for (let i = 0; i < count; i++) {
      positions.push({ x: rng.between(80, w - 80), y: rng.between(80, h - 80) })
    }
    creatures.push({ type: rule.type, positions })
  }

  const pois = []
  for (const rule of biome.pois) {
    if (!rng.chance(rule.probability)) continue

    pois.push({
      id: `${biome.id}_poi_${pois.length + 1}`,
      name: rule.name,
      description: rule.description,
      x: rng.between(120, w - 120),
      y: rng.between(120, h - 120),
      type: rule.type,
    })
  }

  let merchant: { x: number; y: number } | undefined
  if (biome.hasMerchant && rng.chance(0.7)) {
    merchant = { x: w / 2, y: h / 2 }
  }

  return {
    id: `procedural_${seed}`,
    name: biome.name,
    description: biome.description,
    type: biome.islandType,
    mapWidth: w,
    mapHeight: h,
    groundColor: biome.groundColor,
    skyColor: biome.skyColor,
    spawnPoint: { x: 100, y: 100 },
    airshipLanding: { x: w / 2, y: h - 80 },
    connections: [],
    resources,
    pois,
    creatures,
    merchant,
    dangerLevel: biome.dangerLevel,
    weatherBias: biome.weatherBias,
  }
}

/**
 * 获取所有可用生物群系 ID
 */
export function getBiomeIds(): string[] {
  return BIOMES.map(b => b.id)
}

/**
 * 获取生物群系名称
 */
export function getBiomeName(id: string): string | undefined {
  return BIOMES.find(b => b.id === id)?.name
}
