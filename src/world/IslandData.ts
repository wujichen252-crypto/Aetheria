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

export const ISLAND_DEFINITIONS: Record<string, IslandDefinition> = {
  // ======================================================
  // 初始岛屿
  // ======================================================
  starter_forest: {
    id: 'starter_forest',
    name: '翠风林地',
    description: '温和的森林岛屿，资源丰富，适合初航者。',
    type: IslandType.FOREST,
    mapWidth: 1280,
    mapHeight: 960,
    groundColor: { fill: 0x2d4a1e, stroke: 0x1a3a0e, strokeAlpha: 0.3 },
    skyColor: 0x1a1a2e,
    spawnPoint: { x: 400, y: 300 },
    airshipLanding: { x: 1100, y: 800 },
    connections: ['mineral_ridge', 'ancient_ruins', 'sky_garden'],
    resources: [
      { type: 'tree', positions: [
        { x: 200, y: 200 }, { x: 300, y: 150 }, { x: 500, y: 250 },
        { x: 600, y: 400 }, { x: 150, y: 400 }, { x: 700, y: 150 },
        { x: 800, y: 300 }, { x: 350, y: 500 }, { x: 550, y: 600 },
        { x: 250, y: 700 }, { x: 650, y: 750 }, { x: 400, y: 850 },
      ]},
      { type: 'berry_bush', positions: [
        { x: 350, y: 200 }, { x: 500, y: 450 }, { x: 200, y: 600 },
        { x: 700, y: 550 }, { x: 450, y: 750 },
      ]},
      { type: 'rock', positions: [
        { x: 400, y: 200 }, { x: 450, y: 350 }, { x: 250, y: 300 },
        { x: 700, y: 500 }, { x: 500, y: 150 },
      ]},
    ],
    pois: [
      { id: 'forest_shrine', name: '翠风祭坛', description: '被藤蔓覆盖的古老祭坛，散发着微弱的魔法波动。', x: 600, y: 200, type: 'shrine' },
      { id: 'forest_ruin', name: '林间遗迹', description: '倒塌的石柱间刻满符文，诉说着远古的故事。', x: 300, y: 650, type: 'ruin' },
    ],
    creatures: [
      { type: 'forest_rabbit', positions: [{ x: 500, y: 200 }, { x: 300, y: 500 }] },
      { type: 'forest_spider', positions: [{ x: 800, y: 400 }, { x: 600, y: 700 }] },
    ],
    dangerLevel: 1,
    weatherBias: 'sunny',
  },

  // ======================================================
  mineral_ridge: {
    id: 'mineral_ridge',
    name: '矿脉之脊',
    description: '裸露的岩层中蕴藏着丰富的矿物，但陡峭的地形充满危险。',
    type: IslandType.MINERAL_VEIN,
    mapWidth: 1280,
    mapHeight: 960,
    groundColor: { fill: 0x4a3d3d, stroke: 0x3a2d2d, strokeAlpha: 0.4 },
    skyColor: 0x1a1a2e,
    spawnPoint: { x: 400, y: 300 },
    airshipLanding: { x: 200, y: 800 },
    connections: ['starter_forest', 'ancient_ruins', 'forge_island', 'storm_peak'],
    resources: [
      { type: 'rock', positions: [
        { x: 200, y: 200 }, { x: 500, y: 150 }, { x: 700, y: 250 },
        { x: 300, y: 400 }, { x: 600, y: 350 }, { x: 800, y: 450 },
        { x: 250, y: 550 }, { x: 650, y: 600 }, { x: 400, y: 700 },
        { x: 750, y: 750 }, { x: 350, y: 850 }, { x: 550, y: 800 },
      ]},
      { type: 'iron_ore', positions: [
        { x: 500, y: 200 }, { x: 700, y: 300 }, { x: 300, y: 500 },
        { x: 600, y: 650 }, { x: 800, y: 700 },
      ]},
      { type: 'tree', positions: [
        { x: 200, y: 300 }, { x: 450, y: 450 }, { x: 700, y: 550 },
      ]},
    ],
    pois: [
      { id: 'mineral_cave', name: '矿洞入口', description: '深邃的矿洞中隐约传来敲击声。', x: 650, y: 350, type: 'resource_deposit' },
    ],
    creatures: [
      { type: 'ridge_wolf', positions: [{ x: 500, y: 300 }, { x: 700, y: 600 }] },
    ],
    dangerLevel: 2,
    weatherBias: 'rainy',
  },

  // ======================================================
  ancient_ruins: {
    id: 'ancient_ruins',
    name: '遗迹回廊',
    description: '古代文明的残骸散布在紫灰色的土地上，隐藏着失落的知识。',
    type: IslandType.RUINS,
    mapWidth: 1280,
    mapHeight: 960,
    groundColor: { fill: 0x3d2d4a, stroke: 0x2d1d3a, strokeAlpha: 0.4 },
    skyColor: 0x1a1a2e,
    spawnPoint: { x: 400, y: 300 },
    airshipLanding: { x: 1000, y: 700 },
    connections: ['starter_forest', 'mineral_ridge', 'crystal_cave', 'void_fragment'],
    resources: [
      { type: 'rock', positions: [
        { x: 300, y: 200 }, { x: 600, y: 250 }, { x: 500, y: 400 },
        { x: 200, y: 500 }, { x: 700, y: 600 }, { x: 400, y: 700 },
      ]},
      { type: 'tree', positions: [
        { x: 200, y: 150 }, { x: 500, y: 300 }, { x: 300, y: 450 },
        { x: 600, y: 550 }, { x: 350, y: 650 },
      ]},
    ],
    pois: [
      { id: 'ruins_gate', name: '古城大门', description: '巨大的石门上刻着复杂的星图。', x: 600, y: 200, type: 'landmark' },
      { id: 'ruins_library', name: '知识神殿', description: '残破的书架上散落着古代文献的碎片。', x: 350, y: 550, type: 'ruin' },
    ],
    creatures: [
      { type: 'forest_spider', positions: [{ x: 400, y: 350 }, { x: 550, y: 500 }] },
      { type: 'ancient_golem', positions: [{ x: 700, y: 300 }] },
    ],
    dangerLevel: 2,
    weatherBias: 'foggy',
  },

  // ======================================================
  // 新增岛屿
  // ======================================================

  forge_island: {
    id: 'forge_island',
    name: '锻造之岛',
    description: '地火从裂缝中涌出，铁砧与熔炉的废墟诉说着曾经的工艺。',
    type: IslandType.MINERAL_VEIN,
    mapWidth: 1024,
    mapHeight: 768,
    groundColor: { fill: 0x5a2a1a, stroke: 0x3a1a0a, strokeAlpha: 0.5 },
    skyColor: 0x1a1a2e,
    spawnPoint: { x: 300, y: 200 },
    airshipLanding: { x: 800, y: 600 },
    connections: ['mineral_ridge'],
    resources: [
      { type: 'iron_ore', positions: [
        { x: 350, y: 250 }, { x: 500, y: 180 }, { x: 650, y: 300 },
        { x: 400, y: 400 }, { x: 700, y: 500 }, { x: 300, y: 550 },
      ]},
      { type: 'rock', positions: [
        { x: 250, y: 200 }, { x: 450, y: 350 }, { x: 600, y: 450 },
        { x: 350, y: 600 }, { x: 550, y: 650 },
      ]},
    ],
    pois: [
      { id: 'forge_anvil', name: '远古铁砧', description: '刻满符文的巨大铁砧，依然散发着余温。', x: 500, y: 350, type: 'landmark' },
      { id: 'forge_furnace', name: '熔炉遗迹', description: '残破的熔炉中仍有余火闪烁。', x: 300, y: 450, type: 'ruin' },
    ],
    creatures: [
      { type: 'ridge_wolf', positions: [{ x: 600, y: 200 }, { x: 350, y: 500 }] },
      { type: 'ancient_golem', positions: [{ x: 700, y: 400 }] },
    ],
    merchant: { x: 250, y: 300 },
    dangerLevel: 3,
    weatherBias: 'sunny',
  },

  storm_peak: {
    id: 'storm_peak',
    name: '风暴之巅',
    description: '狂风呼啸，雷电不断击打在山巅之上。只有最勇敢的探险者才敢踏足。',
    type: IslandType.STORM,
    mapWidth: 1024,
    mapHeight: 768,
    groundColor: { fill: 0x3a3a4a, stroke: 0x2a2a3a, strokeAlpha: 0.5 },
    skyColor: 0x0a0a1e,
    spawnPoint: { x: 300, y: 200 },
    airshipLanding: { x: 500, y: 650 },
    connections: ['mineral_ridge'],
    resources: [
      { type: 'rock', positions: [
        { x: 300, y: 250 }, { x: 600, y: 200 }, { x: 450, y: 350 },
        { x: 700, y: 400 }, { x: 350, y: 500 }, { x: 550, y: 550 },
      ]},
      { type: 'iron_ore', positions: [
        { x: 500, y: 300 }, { x: 650, y: 350 }, { x: 400, y: 500 },
      ]},
    ],
    pois: [
      { id: 'storm_pinnacle', name: '雷击之巅', description: '山顶的岩石被雷电劈成奇异的形状，空气中弥漫着臭氧的味道。', x: 600, y: 200, type: 'landmark' },
    ],
    creatures: [
      { type: 'ridge_wolf', positions: [{ x: 450, y: 300 }, { x: 550, y: 500 }] },
    ],
    dangerLevel: 4,
    weatherBias: 'stormy',
  },

  crystal_cave: {
    id: 'crystal_cave',
    name: '水晶洞穴',
    description: '巨大的水晶从洞穴顶端垂下，散发着柔和的七彩光芒。',
    type: IslandType.MINERAL_VEIN,
    mapWidth: 1024,
    mapHeight: 768,
    groundColor: { fill: 0x2a2a4a, stroke: 0x1a1a3a, strokeAlpha: 0.3 },
    skyColor: 0x1a1a2e,
    spawnPoint: { x: 300, y: 200 },
    airshipLanding: { x: 700, y: 600 },
    connections: ['ancient_ruins'],
    resources: [
      { type: 'rock', positions: [
        { x: 250, y: 250 }, { x: 500, y: 200 }, { x: 650, y: 300 },
        { x: 350, y: 400 }, { x: 600, y: 500 }, { x: 400, y: 600 },
      ]},
      { type: 'iron_ore', positions: [
        { x: 400, y: 250 }, { x: 600, y: 350 }, { x: 350, y: 550 },
      ]},
      { type: 'tree', positions: [
        { x: 500, y: 400 }, { x: 300, y: 350 }, { x: 650, y: 450 },
      ]},
    ],
    pois: [
      { id: 'crystal_heart', name: '水晶之心', description: '一颗巨大无比的紫色水晶，脉动着古老的能量。', x: 500, y: 250, type: 'shrine' },
      { id: 'crystal_pool', name: '荧光水池', description: '水面上漂浮着发光的晶体碎片，映出梦幻的色彩。', x: 350, y: 500, type: 'landmark' },
    ],
    creatures: [
      { type: 'forest_spider', positions: [{ x: 600, y: 250 }, { x: 400, y: 450 }] },
    ],
    dangerLevel: 3,
    weatherBias: 'foggy',
  },

  void_fragment: {
    id: 'void_fragment',
    name: '虚空碎片',
    description: '空间的裂痕在此地撕裂了现实，重力异常，迷雾中潜藏着不可名状的存在。',
    type: IslandType.VOID,
    mapWidth: 1024,
    mapHeight: 768,
    groundColor: { fill: 0x1a0a2a, stroke: 0x0a0020, strokeAlpha: 0.6 },
    skyColor: 0x050510,
    spawnPoint: { x: 300, y: 200 },
    airshipLanding: { x: 500, y: 600 },
    connections: ['ancient_ruins'],
    resources: [
      { type: 'rock', positions: [
        { x: 350, y: 250 }, { x: 550, y: 300 }, { x: 450, y: 400 },
        { x: 600, y: 500 }, { x: 300, y: 500 },
      ]},
    ],
    pois: [
      { id: 'void_tear', name: '虚空裂隙', description: '一道撕裂空间的黑色裂隙，从中透出不属于这个世界的气息。', x: 500, y: 300, type: 'ruin' },
    ],
    creatures: [
      { type: 'forest_spider', positions: [{ x: 400, y: 350 }, { x: 550, y: 450 }] },
      { type: 'ancient_golem', positions: [{ x: 600, y: 250 }] },
    ],
    dangerLevel: 4,
    weatherBias: 'stormy',
  },

  sky_garden: {
    id: 'sky_garden',
    name: '天空花园',
    description: '漂浮在云海之上的梦幻花园，奇异的植物在这里繁茂生长。',
    type: IslandType.FOREST,
    mapWidth: 1280,
    mapHeight: 960,
    groundColor: { fill: 0x3a5a4a, stroke: 0x2a4a3a, strokeAlpha: 0.3 },
    skyColor: 0x1a1a2e,
    spawnPoint: { x: 400, y: 300 },
    airshipLanding: { x: 900, y: 700 },
    connections: ['starter_forest', 'world_tree'],
    resources: [
      { type: 'tree', positions: [
        { x: 300, y: 200 }, { x: 600, y: 180 }, { x: 800, y: 250 },
        { x: 400, y: 350 }, { x: 700, y: 400 }, { x: 250, y: 500 },
        { x: 550, y: 550 }, { x: 850, y: 450 }, { x: 350, y: 650 },
        { x: 650, y: 700 }, { x: 500, y: 800 },
      ]},
      { type: 'berry_bush', positions: [
        { x: 500, y: 250 }, { x: 300, y: 400 }, { x: 700, y: 500 },
        { x: 450, y: 600 }, { x: 600, y: 750 },
      ]},
      { type: 'rock', positions: [
        { x: 500, y: 300 }, { x: 350, y: 450 }, { x: 750, y: 350 },
      ]},
    ],
    pois: [
      { id: 'garden_fountain', name: '生命之泉', description: '清澈的泉水从雕花石像中涌出，蕴含着勃勃生机。', x: 600, y: 350, type: 'shrine' },
      { id: 'garden_arbor', name: '花藤长廊', description: '古老的石质拱门上爬满了发光的藤蔓植物。', x: 350, y: 550, type: 'landmark' },
    ],
    creatures: [
      { type: 'forest_rabbit', positions: [{ x: 500, y: 200 }, { x: 700, y: 600 }, { x: 300, y: 700 }] },
      { type: 'forest_spider', positions: [{ x: 800, y: 500 }] },
    ],
    merchant: { x: 700, y: 300 },
    dangerLevel: 1,
    weatherBias: 'sunny',
  },

  world_tree: {
    id: 'world_tree',
    name: '世界之树',
    description: '支撑整个浮岛世界的巨树，树干粗逾百尺，枝叶遮蔽天空。据说树心藏着世界的秘密。',
    type: IslandType.FOREST,
    mapWidth: 1280,
    mapHeight: 960,
    groundColor: { fill: 0x2d5a2d, stroke: 0x1a3a1a, strokeAlpha: 0.3 },
    skyColor: 0x1a1a2e,
    spawnPoint: { x: 400, y: 700 },
    airshipLanding: { x: 600, y: 800 },
    connections: ['sky_garden'],
    resources: [
      { type: 'tree', positions: [
        { x: 200, y: 150 }, { x: 350, y: 180 }, { x: 500, y: 140 },
        { x: 650, y: 170 }, { x: 800, y: 150 }, { x: 300, y: 300 },
        { x: 600, y: 280 }, { x: 450, y: 350 }, { x: 250, y: 450 },
        { x: 550, y: 420 }, { x: 700, y: 380 }, { x: 350, y: 550 },
        { x: 600, y: 520 }, { x: 450, y: 650 }, { x: 700, y: 600 },
      ]},
      { type: 'rock', positions: [
        { x: 400, y: 250 }, { x: 700, y: 300 }, { x: 300, y: 500 },
        { x: 550, y: 600 }, { x: 200, y: 350 },
      ]},
    ],
    pois: [
      { id: 'world_tree_trunk', name: '树心圣殿', description: '巨树的中心是一个天然的穹顶大厅，跳动着翠绿色的光芒。', x: 600, y: 300, type: 'shrine' },
      { id: 'world_tree_canopy', name: '树冠观景台', description: '站在世界之巅，俯瞰云海中的浮岛群。', x: 300, y: 200, type: 'landmark' },
    ],
    creatures: [
      { type: 'forest_rabbit', positions: [{ x: 400, y: 400 }, { x: 200, y: 500 }, { x: 700, y: 450 }] },
      { type: 'ridge_wolf', positions: [{ x: 500, y: 250 }, { x: 650, y: 500 }] },
      { type: 'ancient_golem', positions: [{ x: 800, y: 350 }] },
    ],
    dangerLevel: 3,
    weatherBias: 'mixed',
  },
}

export function getIslandDefinition(id: string): IslandDefinition {
  const island = ISLAND_DEFINITIONS[id]
  if (!island) {
    throw new Error(`Island definition not found: ${id}`)
  }
  return island
}

export function getInitialIsland(): IslandDefinition {
  return ISLAND_DEFINITIONS['starter_forest']
}
