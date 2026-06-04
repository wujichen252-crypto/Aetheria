import { IslandType, IslandDefinition, ResourceSpawn, CreatureSpawn } from '../world/IslandData'

/** 简单线性同余随机数生成器（可复现） */
class SimpleRng {
  private seed: number
  constructor(seed: number) { this.seed = seed % 2147483647 }
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }
  between(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }
}

const BIOMES: Array<{ name: string; fill: number; stroke: number; strokeAlpha: number; trees: number; rocks: number; berries: number }> = [
  { name: '青苔小岛', fill: 0x3a5a3a, stroke: 0x2a4a2a, strokeAlpha: 0.3, trees: 8, rocks: 4, berries: 3 },
  { name: '砂石岛', fill: 0x5a4a3a, stroke: 0x4a3a2a, strokeAlpha: 0.4, trees: 3, rocks: 8, berries: 1 },
  { name: '荒芜岩礁', fill: 0x4a4a4a, stroke: 0x3a3a3a, strokeAlpha: 0.4, trees: 1, rocks: 10, berries: 0 },
  { name: '茂盛浮岛', fill: 0x2d5a2d, stroke: 0x1a4a1a, strokeAlpha: 0.3, trees: 12, rocks: 3, berries: 5 },
]

export function generateProceduralIsland(seed: number): IslandDefinition {
  const rng = new SimpleRng(seed)
  const biome = BIOMES[rng.between(0, BIOMES.length - 1)]
  const w = 640, h = 480

  const resources: ResourceSpawn[] = []
  if (biome.trees > 0) {
    const positions: Array<{ x: number; y: number }> = []
    for (let i = 0; i < biome.trees; i++) {
      positions.push({ x: rng.between(60, w - 60), y: rng.between(60, h - 60) })
    }
    resources.push({ type: 'tree', positions })
  }
  if (biome.rocks > 0) {
    const positions: Array<{ x: number; y: number }> = []
    for (let i = 0; i < biome.rocks; i++) {
      positions.push({ x: rng.between(60, w - 60), y: rng.between(60, h - 60) })
    }
    resources.push({ type: 'rock', positions })
  }
  if (biome.berries > 0) {
    const positions: Array<{ x: number; y: number }> = []
    for (let i = 0; i < biome.berries; i++) {
      positions.push({ x: rng.between(60, w - 60), y: rng.between(60, h - 60) })
    }
    resources.push({ type: 'berry_bush', positions })
  }

  // 小概率出现铁矿
  if (rng.next() > 0.6) {
    const positions: Array<{ x: number; y: number }> = []
    for (let i = 0; i < rng.between(1, 3); i++) {
      positions.push({ x: rng.between(60, w - 60), y: rng.between(60, h - 60) })
    }
    resources.push({ type: 'iron_ore', positions })
  }

  // 小概率出现生物
  const creatures: CreatureSpawn[] = []
  if (rng.next() > 0.5) {
    const count = rng.between(1, 3)
    const positions: Array<{ x: number; y: number }> = []
    for (let i = 0; i < count; i++) {
      positions.push({ x: rng.between(60, w - 60), y: rng.between(60, h - 60) })
    }
    creatures.push({ type: 'forest_spider', positions })
  }
  if (rng.next() > 0.7) {
    creatures.push({
      type: 'forest_rabbit',
      positions: [{ x: rng.between(60, w - 60), y: rng.between(60, h - 60) }],
    })
  }

  return {
    id: `procedural_${seed}`,
    name: biome.name,
    description: '一座未经探索的无名小岛。',
    type: IslandType.FOREST,
    mapWidth: w,
    mapHeight: h,
    groundColor: { fill: biome.fill, stroke: biome.stroke, strokeAlpha: biome.strokeAlpha },
    skyColor: 0x1a1a2e,
    spawnPoint: { x: 100, y: 100 },
    airshipLanding: { x: w / 2, y: h - 60 },
    connections: [],
    resources,
    pois: [],
    creatures,
    dangerLevel: 1,
    weatherBias: 'sunny',
  }
}
