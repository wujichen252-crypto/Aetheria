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
    hungerDecrease: 1, // 每秒减少
    weightMax: 50
  },
  
  // 昼夜循环（20分钟 = 1200秒 = 1天）
  dayNight: {
    dayDuration: 600, // 10分钟白天
    nightDuration: 600, // 10分钟夜晚
    dawnDuskDuration: 60 // 1分钟黎明/黄昏
  },
  
  // 资源
  resources: {
    tree: { hp: 3, yield: ['wood', 'fiber'], respawnTime: 300 },
    rock: { hp: 5, yield: ['stone'], respawnTime: 600 }
  },
  
  // 颜色
  colors: {
    sky: 0x1a1a2e,
    ground: 0x3d3d5c,
    tree: 0x2d5a27,
    rock: 0x6b6b6b,
    player: 0xd4a373
  }
}
