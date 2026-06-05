import Phaser from 'phaser'
import { GameStateManager } from '../systems/GameState'
import { RouteGraph } from '../systems/RouteGraph'
import { SaveManager } from '../systems/SaveManager'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    this.createPlaceholderGraphics()
  }

  create(): void {
    this.initializeGameState()
    this.scene.start('GameScene', { islandId: 'starter_forest' })
  }

  private initializeGameState(): void {
    const gsm = GameStateManager.getInstance()
    const routeGraph = RouteGraph.getInstance()

    // 尝试加载存档
    const savedGame = SaveManager.loadSlot(0)
    if (savedGame) {
      gsm.fromSaveData(savedGame)
    } else {
      // 新游戏，解锁起始岛屿的航线
      this.unlockStartingRoutes(gsm, routeGraph)
    }
  }

  private unlockStartingRoutes(gsm: GameStateManager, routeGraph: RouteGraph): void {
    // 解锁起始森林的所有航线
    const startingRoutes = routeGraph.getRoutesFrom('starter_forest')
    startingRoutes.forEach(route => {
      if (route.unlockConditions.length === 0) {
        gsm.unlockRoute(route.id)
      }
    })
  }

  private createPlaceholderGraphics(): void {
    // ==================== 玩家 ====================
    const pg = this.make.graphics()
    // 身体
    pg.fillStyle(0xd4a373)
    pg.fillRoundedRect(2, 6, 24, 18, 4)
    // 头部
    pg.fillStyle(0xf0d0a0)
    pg.fillCircle(14, 6, 8)
    // 眼睛
    pg.fillStyle(0x222222)
    pg.fillCircle(11, 4, 2)
    pg.fillCircle(17, 4, 2)
    // 方向指示（箭头朝下）
    pg.fillStyle(0x44ff44)
    pg.fillTriangle(14, 22, 10, 28, 18, 28)
    pg.generateTexture('player', 28, 28)
    pg.destroy()

    // ==================== 树木 ====================
    const tg = this.make.graphics()
    // 树干
    tg.fillStyle(0x5c3a1e)
    tg.fillRect(12, 24, 8, 24)
    // 树冠（多层次）
    tg.fillStyle(0x2d5a27)
    tg.fillCircle(16, 16, 16)
    tg.fillStyle(0x3a7a33)
    tg.fillCircle(10, 20, 10)
    tg.fillCircle(22, 20, 10)
    tg.fillStyle(0x4a8a44)
    tg.fillCircle(16, 10, 8)
    tg.generateTexture('tree', 32, 48)
    tg.destroy()

    // ==================== 岩石 ====================
    const rg = this.make.graphics()
    rg.fillStyle(0x6b6b6b)
    rg.fillRoundedRect(0, 4, 32, 20, 6)
    rg.fillStyle(0x808080)
    rg.fillRoundedRect(4, 2, 24, 14, 4)
    rg.fillStyle(0x555555)
    rg.fillRoundedRect(8, 6, 8, 6, 2)
    rg.fillRoundedRect(20, 8, 6, 4, 2)
    rg.generateTexture('rock', 32, 24)
    rg.destroy()

    // ==================== 浆果丛 ====================
    const bg = this.make.graphics()
    bg.fillStyle(0x3a6a2a)
    bg.fillCircle(12, 14, 10)
    bg.fillCircle(6, 16, 6)
    bg.fillCircle(18, 16, 6)
    bg.fillStyle(0xcc3333)
    bg.fillCircle(8, 10, 3)
    bg.fillCircle(16, 8, 3)
    bg.fillCircle(6, 18, 3)
    bg.fillCircle(18, 18, 3)
    bg.fillCircle(12, 16, 3)
    bg.fillStyle(0xff4444)
    bg.fillCircle(7, 9, 1)
    bg.fillCircle(15, 7, 1)
    bg.generateTexture('berry_bush', 24, 24)
    bg.destroy()

    // ==================== 铁矿 ====================
    const ig = this.make.graphics()
    ig.fillStyle(0x3a3a4a)
    ig.fillRoundedRect(0, 2, 24, 18, 4)
    ig.fillStyle(0x6666aa)
    ig.fillRect(4, 6, 6, 6)
    ig.fillRect(14, 10, 6, 6)
    ig.fillStyle(0x8888cc)
    ig.fillRect(5, 7, 4, 4)
    ig.fillRect(15, 11, 4, 4)
    ig.fillStyle(0xaaaaff)
    ig.fillRect(6, 8, 2, 2)
    ig.fillRect(16, 12, 2, 2)
    ig.generateTexture('iron_ore', 24, 20)
    ig.destroy()

    // ==================== 飞艇 ====================
    const ag = this.make.graphics()
    // 气囊
    ag.fillStyle(0x8B6914)
    ag.fillEllipse(24, 10, 44, 18)
    ag.fillStyle(0xa07924)
    ag.fillEllipse(24, 8, 36, 12)
    // 吊篮
    ag.fillStyle(0x654321)
    ag.fillRect(10, 18, 28, 8)
    ag.fillStyle(0x7a5533)
    ag.fillRect(12, 20, 24, 6)
    // 绳索（垂直线）
    ag.lineStyle(1, 0x444444)
    ag.lineBetween(12, 16, 12, 18)
    ag.lineBetween(36, 16, 36, 18)
    // 尾部旗帜
    ag.fillStyle(0xcc3333)
    ag.fillTriangle(2, 8, 0, 12, 4, 12)
    ag.generateTexture('airship', 48, 28)
    ag.destroy()

    // ==================== 雨滴粒子 ====================
    const rp = this.make.graphics()
    rp.fillStyle(0x88aadd)
    rp.fillRect(0, 0, 2, 8)
    rp.fillStyle(0xaaccff)
    rp.fillRect(0, 0, 1, 3)
    rp.generateTexture('rain_particle', 2, 8)
    rp.destroy()

    // ==================== 地面 ====================
    const gd = this.make.graphics()
    gd.fillStyle(0x3d3d5c)
    gd.fillRect(0, 0, 32, 32)
    gd.lineStyle(1, 0x2a2a4a, 0.5)
    gd.strokeRect(0, 0, 32, 32)
    // 噪点
    gd.fillStyle(0x4a4a6a, 0.3)
    gd.fillRect(4, 8, 3, 3)
    gd.fillRect(20, 4, 2, 2)
    gd.fillRect(10, 24, 3, 3)
    gd.fillRect(26, 18, 2, 2)
    gd.generateTexture('ground', 32, 32)
    gd.destroy()

    // ==================== 工作台 ====================
    const cg = this.make.graphics()
    // 台面
    cg.fillStyle(0x5a3a1a)
    cg.fillRect(0, 0, 32, 8)
    cg.fillStyle(0x8B6914)
    cg.fillRect(2, 2, 28, 6)
    // 桌腿
    cg.fillStyle(0x4a2a0a)
    cg.fillRect(2, 8, 6, 12)
    cg.fillRect(24, 8, 6, 12)
    // 物品放在上面
    cg.fillStyle(0x6666aa)
    cg.fillCircle(8, 4, 3)
    cg.fillStyle(0x44aa44)
    cg.fillCircle(24, 4, 3)
    cg.generateTexture('crafting_bench', 32, 20)
    cg.destroy()

    // ==================== 森林兔 ====================
    const rbg = this.make.graphics()
    // 身体
    rbg.fillStyle(0xc4a882)
    rbg.fillEllipse(10, 12, 16, 12)
    // 头部
    rbg.fillStyle(0xd4b892)
    rbg.fillCircle(18, 8, 6)
    // 耳朵
    rbg.fillStyle(0xc4a882)
    rbg.fillEllipse(16, 2, 4, 6)
    rbg.fillEllipse(20, 2, 4, 6)
    rbg.fillStyle(0xe8c8a8)
    rbg.fillEllipse(16, 2, 2, 4)
    rbg.fillEllipse(20, 2, 2, 4)
    // 眼睛
    rbg.fillStyle(0x222222)
    rbg.fillCircle(20, 7, 1)
    // 尾巴
    rbg.fillStyle(0xf0e0d0)
    rbg.fillCircle(2, 12, 3)
    rbg.generateTexture('creature_rabbit', 24, 20)
    rbg.destroy()

    // ==================== 森林蜘蛛 ====================
    const spg = this.make.graphics()
    // 身体
    spg.fillStyle(0x4a1a5a)
    spg.fillEllipse(12, 14, 16, 14)
    // 头部
    spg.fillStyle(0x3a0a4a)
    spg.fillCircle(12, 6, 6)
    // 眼睛
    spg.fillStyle(0xff4444)
    spg.fillCircle(8, 5, 2)
    spg.fillCircle(16, 5, 2)
    spg.fillStyle(0xff8888)
    spg.fillCircle(8, 5, 1)
    spg.fillCircle(16, 5, 1)
    // 腿
    spg.lineStyle(2, 0x3a0a4a)
    spg.lineBetween(4, 10, 0, 4)
    spg.lineBetween(4, 12, 0, 18)
    spg.lineBetween(8, 14, 2, 22)
    spg.lineBetween(20, 10, 24, 4)
    spg.lineBetween(20, 12, 24, 18)
    spg.lineBetween(16, 14, 22, 22)
    spg.generateTexture('creature_spider', 26, 26)
    spg.destroy()

    // ==================== 岩脊狼 ====================
    const wg = this.make.graphics()
    // 身体
    wg.fillStyle(0x7a7a7a)
    wg.fillRoundedRect(4, 6, 20, 10, 4)
    // 头部
    wg.fillStyle(0x8a8a8a)
    wg.fillRoundedRect(20, 2, 10, 8, 4)
    // 耳朵
    wg.fillStyle(0x6a6a6a)
    wg.fillTriangle(22, 2, 24, 0, 26, 2)
    wg.fillTriangle(26, 2, 28, 0, 30, 2)
    // 眼睛
    wg.fillStyle(0xffcc00)
    wg.fillCircle(24, 5, 1)
    wg.fillCircle(28, 5, 1)
    // 尾巴
    wg.fillStyle(0x6a6a6a)
    wg.fillTriangle(4, 8, 0, 4, 2, 12)
    // 腿
    wg.fillStyle(0x6a6a6a)
    wg.fillRect(8, 14, 3, 4)
    wg.fillRect(16, 14, 3, 4)
    wg.generateTexture('creature_wolf', 30, 18)
    wg.destroy()

    // ==================== 远古傀儡 ====================
    const gg = this.make.graphics()
    // 身体
    gg.fillStyle(0x3d4a5a)
    gg.fillRoundedRect(2, 8, 28, 24, 4)
    // 头部
    gg.fillStyle(0x4a5a6a)
    gg.fillRoundedRect(6, 0, 20, 14, 4)
    // 眼睛
    gg.fillStyle(0x6688aa)
    gg.fillCircle(12, 6, 3)
    gg.fillCircle(20, 6, 3)
    gg.fillStyle(0x88aadd)
    gg.fillCircle(12, 6, 1)
    gg.fillCircle(20, 6, 1)
    // 符文
    gg.lineStyle(1, 0x88aadd, 0.6)
    gg.lineBetween(16, 16, 16, 24)
    gg.lineBetween(12, 20, 20, 20)
    // 手臂
    gg.fillStyle(0x3d4a5a)
    gg.fillRect(0, 12, 4, 10)
    gg.fillRect(28, 12, 4, 10)
    // 腿
    gg.fillRect(8, 30, 6, 6)
    gg.fillRect(18, 30, 6, 6)
    gg.generateTexture('creature_golem', 32, 36)
    gg.destroy()

    // ==================== 弹弓弹道 ====================
    const prg = this.make.graphics()
    prg.fillStyle(0x999999)
    prg.fillCircle(4, 4, 4)
    prg.fillStyle(0xcccccc)
    prg.fillCircle(3, 3, 2)
    prg.fillStyle(0xffffff)
    prg.fillCircle(3, 2, 1)
    prg.generateTexture('projectile_stone', 8, 8)
    prg.destroy()

    // ==================== 收集粒子 ====================
    const ptg = this.make.graphics()
    ptg.fillStyle(0xffdd44)
    ptg.fillCircle(4, 4, 4)
    ptg.generateTexture('particle_star', 8, 8)
    ptg.destroy()

    // ==================== 商人 ====================
    const mg = this.make.graphics()
    mg.fillStyle(0x8B4513)
    mg.fillTriangle(16, 0, 4, 28, 28, 28)
    mg.fillStyle(0xa0652a)
    mg.fillTriangle(16, 4, 8, 24, 24, 24)
    mg.fillStyle(0xf0d0a0)
    mg.fillCircle(16, 8, 7)
    mg.fillStyle(0x654321)
    mg.fillTriangle(16, 0, 8, 10, 24, 10)
    mg.fillStyle(0x222222)
    mg.fillCircle(13, 7, 1)
    mg.fillCircle(19, 7, 1)
    mg.generateTexture('merchant', 32, 28)
    mg.destroy()
  }
}
