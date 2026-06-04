export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  tileSize: 32,

  // 玩家属性
  player: {
    speed: 200,
    runSpeed: 320,
    staminaMax: 100,
    staminaRegen: 10,
    staminaCost: 15,
    hpMax: 100,
    hungerMax: 100,
    hungerDecrease: 1,
    weightMax: 50,
    itemWeights: {} as Record<string, number>, // 由 ItemDefinitions 提供
  },

  // 飞艇
  airship: {
    interactRange: 60,
    fuelMax: 100,
    fuelCost: 10,
    travelTime: 2000,
  },

  // 昼夜循环（20分钟 = 1200秒 = 1天）
  dayNight: {
    dayDuration: 600,
    nightDuration: 600,
    dawnDuskDuration: 60,
  },

  // 闪避
  dodge: {
    speed: 500,
    duration: 200,
    cooldown: 800,
  },

  // 风暴
  storm: {
    lightningInterval: 5000,
    lightningVariance: 3000,
    damage: 8,
    hitChance: 0.3,
  },

  // 天气
  weather: {
    transitionSpeed: 0.002,
    rainParticleCount: 80,
    fogMaxAlpha: 0.25,
  },

  // 资源
  resources: {
    tree: { hp: 3, yield: ['wood', 'fiber'], respawnTime: 300 },
    rock: { hp: 5, yield: ['stone'], respawnTime: 600 },
    berry_bush: { hp: 2, yield: ['berry'], respawnTime: 180 },
    iron_ore: { hp: 8, yield: ['iron_ore'], respawnTime: 900 },
  } as Record<string, { hp: number; yield: string[]; respawnTime: number }>,

  // 交互
  interact: {
    range: 50,
    cooldown: 300,
  },

  // 颜色
  colors: {
    sky: 0x1a1a2e,
    ground: 0x3d3d5c,
    tree: 0x2d5a27,
    rock: 0x6b6b6b,
    player: 0xd4a373,
    airship: 0x8B4513,
    berry_bush: 0x8B2252,
    iron_ore: 0x4a4a5a,
    rain: 0x6688cc,
  },
}
