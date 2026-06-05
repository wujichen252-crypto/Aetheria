import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { Player } from '../entities/Player'
import { Resource } from '../entities/Resource'
import { Creature } from '../entities/Creature'
import { Projectile } from '../entities/Projectile'
import { Hud } from '../ui/Hud'
import { InventoryUI } from '../ui/InventoryUI'
import { DayNightCycle } from '../systems/DayNightCycle'
import { GameStateManager } from '../systems/GameState'
import { getIslandDefinition, registerIsland, IslandDefinition } from '../world/IslandData'
import { Airship } from '../entities/Airship'
import { AirshipMenu } from '../ui/AirshipMenu'
import { CraftingUI } from '../ui/CraftingUI'
import { WeatherSystem } from '../systems/WeatherSystem'
import { RecipeSystem } from '../systems/RecipeSystem'
import { SkillTreeSystem } from '../systems/SkillTreeSystem'
import { FogOfWar } from '../systems/FogOfWar'
import { POISystem } from '../systems/POISystem'
import { MapUI } from '../ui/MapUI'
import { ExplorationJournalUI } from '../ui/ExplorationJournalUI'
import { SkillTreeUI } from '../ui/SkillTreeUI'
import { getCreatureDef } from '../world/CreatureDefinitions'
import { WeaponType } from '../entities/Weapon'
import { AudioManager } from '../systems/AudioManager'
import { Merchant } from '../entities/Merchant'
import { TradeUI } from '../ui/TradeUI'
import { SaveManager } from '../systems/SaveManager'
import { generateProceduralIsland } from '../systems/ProceduralIslandGen'
import { IslandType } from '../world/IslandData'
import { HelpUI } from '../ui/HelpUI'
import { TileMapRenderer } from '../systems/TileMapRenderer'
import { RouteGraph } from '../systems/RouteGraph'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private resources: Resource[] = []
  private creatures: Creature[] = []
  private creaturesGroup!: Phaser.Physics.Arcade.Group
  private projectilesGroup!: Phaser.Physics.Arcade.Group
  public hud!: Hud
  public inventoryUI!: InventoryUI
  public airshipMenu!: AirshipMenu
  public craftingUI!: CraftingUI
  private dayNightCycle!: DayNightCycle
  private weatherSystem!: WeatherSystem
  private airship!: Airship
  private craftingBench!: Phaser.Physics.Arcade.Sprite
  private benchPrompt!: Phaser.GameObjects.Text
  private islandDef!: IslandDefinition
  private hintText!: Phaser.GameObjects.Text
  private fogOfWar!: FogOfWar
  private poiSystem!: POISystem
  private skillTreeSystem!: SkillTreeSystem
  private mapUI!: MapUI
  private journalUI!: ExplorationJournalUI
  private skillTreeUI!: SkillTreeUI
  public audioManager!: AudioManager
  private merchant!: Merchant | null
  private tradeUI!: TradeUI
  private usedTrades: string[] = []
  private stormTimer: number = 0
  private prevEKeyDown: boolean = false
  private helpUI!: HelpUI
  private tileMapRenderer!: TileMapRenderer

  constructor() {
    super({ key: 'GameScene' })
  }

  create(data: { islandId?: string }): void {
    const gsm = GameStateManager.getInstance()
    const routeGraph = RouteGraph.getInstance()

    const islandId = data?.islandId || gsm.data.currentIsland
    this.islandDef = getIslandDefinition(islandId)
    gsm.discoverIsland(islandId)

    // 记录完成的危险等级
    this.completeDangerLevelForIsland(islandId)

    // 检查并解锁满足条件的航线
    const newlyUnlockedRoutes = routeGraph.checkAndUnlockRoutes()
    if (newlyUnlockedRoutes.length > 0) {
      this.showNewRoutesUnlocked(newlyUnlockedRoutes)
    }

    this.resources = []
    this.creatures = []

    // 地形（TileMap 渲染）
    this.tileMapRenderer = new TileMapRenderer(this)
    this.tileMapRenderer.render(this.islandDef)

    // 昼夜
    this.dayNightCycle = new DayNightCycle(this)

    // 天气
    this.weatherSystem = new WeatherSystem(this, this.islandDef.weatherBias)

    // 玩家
    if (this.player) this.player.destroy()
    this.player = new Player(this, this.islandDef.spawnPoint.x, this.islandDef.spawnPoint.y)
    this.player.hp = gsm.data.hp
    this.player.stamina = gsm.data.stamina
    this.player.hunger = gsm.data.hunger
    this.player.inventory = new Map(gsm.data.inventory)

    // 资源
    this.createResources(this.islandDef)

    // 生物
    this.creaturesGroup = this.physics.add.group()
    this.projectilesGroup = this.physics.add.group()
    this.createCreatures(this.islandDef)

    // 弹道碰撞
    this.physics.add.overlap(this.projectilesGroup, this.creaturesGroup, this.onProjectileHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this)

    // 商人
    this.usedTrades = []
    this.createMerchant(this.islandDef)

    // 飞艇 + 工作台
    this.createAirship(this.islandDef)
    this.createCraftingBench()

    // 配方系统
    RecipeSystem.initDiscovered(Array.from(gsm.data.inventory.keys()))

    // 技能树
    this.skillTreeSystem = new SkillTreeSystem()
    this.skillTreeSystem.loadState({
      skills: gsm.data.skillLevels,
      points: gsm.data.skillPoints,
    })

    // 音频
    this.audioManager = new AudioManager(this)

    // 战争迷雾
    this.fogOfWar = new FogOfWar(this, this.islandDef.mapWidth, this.islandDef.mapHeight)

    // POI 系统
    this.poiSystem = new POISystem(this, this.islandDef.pois, (_poiId: string) => {
      this.skillTreeSystem.addSkillPoint()
    })

    // UI
    this.hud = new Hud(this, this.islandDef)
    this.hud.setWeightAccessors(() => this.player.getWeight(), () => this.player.getWeightMax())
    this.inventoryUI = new InventoryUI(this, this.player.inventory)
    this.airshipMenu = new AirshipMenu(this)
    this.craftingUI = new CraftingUI(this, this.player.inventory, () => {
      this.inventoryUI.updateDisplay()
      this.hud.updateStats(this.player.hp, this.player.stamina, this.player.hunger)
      this.checkRoutesAfterItemChange()
    })
    this.mapUI = new MapUI(this, this.fogOfWar, this.islandDef.mapWidth, this.islandDef.mapHeight, this.islandDef.pois)
    this.journalUI = new ExplorationJournalUI(this)
    this.skillTreeUI = new SkillTreeUI(this, this.skillTreeSystem)
    this.tradeUI = new TradeUI(this, (offerId: string) => this.handleTrade(offerId))
    this.helpUI = new HelpUI(this)

    // 摄像机
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, this.islandDef.mapWidth, this.islandDef.mapHeight)
    this.cameras.main.setZoom(1.5)

    // 底部提示
    if (this.hintText) this.hintText.destroy()
    this.hintText = this.add.text(
      GAME_CONFIG.width / 2, GAME_CONFIG.height - 30,
      '[左键] 攻击/交互 [右键] 闪避 [WASD] 移动 [E] 交互 [Q] 切武器 [Tab] 背包 [M] 地图 [H] 帮助',
      { fontSize: '14px', color: '#888888' }
    )
    this.hintText.setOrigin(0.5)
    this.hintText.setScrollFactor(0)
    this.hintText.setDepth(100)

    // 目标引导
    const guideText = this.add.text(
      GAME_CONFIG.width / 2, GAME_CONFIG.height - 55,
      islandId === 'starter_forest'
        ? '找到飞艇按 E 或左键点击前往其他岛屿，按 H 查看全部操作'
        : '探索岛屿 · 采集资源 · 按 M 查看地图',
      { fontSize: '12px', color: '#d4a373' }
    )
    guideText.setOrigin(0.5)
    guideText.setScrollFactor(0)
    guideText.setDepth(100)
    this.tweens.add({
      targets: guideText, alpha: 0, delay: 8000, duration: 1000,
      onComplete: () => guideText.destroy(),
    })

    this.showIslandName(this.islandDef.name)
  }

  /**
   * 记录完成的危险等级
   */
  private completeDangerLevelForIsland(islandId: string): void {
    const gsm = GameStateManager.getInstance()
    const dangerLevel = this.getIslandDangerLevel(islandId)
    gsm.completeDangerLevel(dangerLevel)
  }

  /**
   * 获取岛屿危险等级
   */
  private getIslandDangerLevel(islandId: string): number {
    const dangerMap: Record<string, number> = {
      'starter_forest': 1,
      'mineral_ridge': 2,
      'ancient_ruins': 2,
      'forge_island': 3,
      'storm_peak': 4,
      'crystal_cave': 3,
      'void_fragment': 4,
      'sky_garden': 1,
      'world_tree': 3,
    }
    return dangerMap[islandId] ?? 1
  }

  /**
   * 物品变化后检查航线解锁
   */
  private checkRoutesAfterItemChange(): void {
    const routeGraph = RouteGraph.getInstance()
    const newlyUnlockedRoutes = routeGraph.checkAndUnlockRoutes()
    if (newlyUnlockedRoutes.length > 0) {
      this.showNewRoutesUnlocked(newlyUnlockedRoutes)
    }
  }

  /**
   * 显示新航线解锁提示
   */
  private showNewRoutesUnlocked(_routeIds: string[]): void {
    const text = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 - 100,
      '发现新航线！',
      { fontSize: '28px', color: '#d4a373', fontStyle: 'bold' }
    )
    text.setOrigin(0.5)
    text.setScrollFactor(0)
    text.setDepth(300)
    this.tweens.add({
      targets: text, alpha: 0, delay: 2000, duration: 1000,
      onComplete: () => text.destroy(),
    })
  }

  update(): void {
    this.player?.update(this.game.loop.delta)
    this.dayNightCycle?.update(this.game.loop.delta)
    this.weatherSystem?.update(this.game.loop.delta)

    // 任何界面打开时暂停世界交互
    const anyUIOpen =
      this.airshipMenu?.isMenuOpen() ||
      this.craftingUI?.isOpenNow() ||
      this.mapUI?.isMapOpen() ||
      this.journalUI?.isOpenNow() ||
      this.skillTreeUI?.isOpenNow() ||
      this.tradeUI?.isOpenNow() ||
      this.helpUI?.isOpenNow()

    if (anyUIOpen) {
      this.airship?.hidePrompt()
      this.benchPrompt?.setVisible(false)
      return
    }

    // 生物更新
    if (!this.player.dead) {
      for (const c of this.creatures) {
        c.update(this.game.loop.delta, this.player)
      }
    }

    // 弹道更新
    const projs = this.projectilesGroup.getChildren() as Projectile[]
    for (const p of projs) {
      p.update()
    }

    // 探索系统
    this.fogOfWar?.update(this.player.x, this.player.y)
    this.poiSystem?.checkDiscovery(this.player.x, this.player.y)
    this.mapUI?.update(this.player.x, this.player.y)

    // 风暴/虚空特殊机制
    this.updateHazardMechanics()

    // 鼠标点击交互（左键点击世界物体）
    this.handleMouseClickInteraction()

    // 战斗输入
    if (!this.player.dead) {
      if (this.player.isAttackPressed()) {
        this.performPlayerAttack()
      }
      if (this.player.isWeaponSwitchPressed()) {
        this.player.cycleWeapon()
      }
    }

    // 玩家死亡处理
    if (this.player.dead) {
      this.handlePlayerDeath()
      return
    }

    // E 键单次触发
    const eDown = this.player.getInteractKey().isDown
    const ePressed = eDown && !this.prevEKeyDown
    this.prevEKeyDown = eDown

    // 飞艇交互
    this.checkAirshipInteraction(ePressed)

    // 工作台交互
    this.checkBenchInteraction(ePressed)

    // 商人交互
    if (ePressed) this.checkMerchantInteraction()

    // 资源交互
    if (ePressed) this.checkInteraction()
  }

  private handlePlayerDeath(): void {
    this.player.respawn()
    this.travelToIsland('starter_forest')
  }

  private performPlayerAttack(): void {
    const attackData = this.player.attack()
    if (!attackData) return

    const { dirX, dirY, weapon } = attackData

    if (weapon.type === WeaponType.SLINGSHOT) {
      // 远程：生成弹道
      this.spawnProjectile(dirX, dirY, weapon.damage, weapon.knockback)
    } else {
      // 近战：以攻击点为中心检测生物
      const centerX = this.player.x + dirX * (weapon.range / 2)
      const centerY = this.player.y + dirY * (weapon.range / 2)

      for (const creature of this.creatures) {
        if (creature.isDead) continue
        const dist = Phaser.Math.Distance.Between(centerX, centerY, creature.x, creature.y)
        if (dist < weapon.range + 20) {
          creature.takeDamage(weapon.damage)
          // 击退
          const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, creature.x, creature.y)
          creature.setVelocity(
            Math.cos(angle) * weapon.knockback,
            Math.sin(angle) * weapon.knockback,
          )
        }
      }
    }
  }

  private spawnProjectile(dirX: number, dirY: number, damage: number, knockback: number): void {
    const speed = 350
    const proj = new Projectile(
      this, this.player.x, this.player.y,
      dirX, dirY, speed, damage, knockback, 'projectile_stone',
    )
    proj.setDepth(8)
    this.projectilesGroup.add(proj)
  }

  private onProjectileHit(obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile): void {
    const projectile = obj1 as Projectile
    const creature = obj2 as unknown as Creature

    if (!projectile.active || creature.isDead) return

    creature.takeDamage(projectile.damage)

    const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, creature.x, creature.y)
    creature.setVelocity(
      Math.cos(angle) * projectile.knockback,
      Math.sin(angle) * projectile.knockback,
    )

    // 弹道击中后销毁
    if (projectile.active) {
      const gfx = this.add.graphics()
      gfx.fillStyle(0xffffff, 0.6)
      gfx.fillCircle(projectile.x, projectile.y, 4)
      gfx.setDepth(8)
      this.tweens.add({
        targets: gfx, alpha: 0, duration: 200,
        onComplete: () => gfx.destroy(),
      })
      projectile.destroy()
    }
  }

  private showIslandName(name: string): void {
    const text = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 60, name, {
      fontSize: '48px', color: '#d4a373', fontStyle: 'bold',
    })
    text.setOrigin(0.5)
    text.setScrollFactor(0)
    text.setDepth(300)
    this.tweens.add({
      targets: text, alpha: 0, y: text.y - 30, duration: 2000, delay: 500, ease: 'Power2',
      onComplete: () => text.destroy(),
    })
  }

  private createResources(island: IslandDefinition): void {
    island.resources.forEach(spawnGroup => {
      spawnGroup.positions.forEach(pos => {
        const resource = new Resource(this, pos.x, pos.y, spawnGroup.type, spawnGroup.type)
        this.resources.push(resource)
        this.physics.add.existing(resource, true)
      })
    })
  }

  private createCreatures(island: IslandDefinition): void {
    island.creatures.forEach(spawnGroup => {
      const def = getCreatureDef(spawnGroup.type)
      spawnGroup.positions.forEach(pos => {
        const creature = new Creature(this, pos.x, pos.y, def)
        this.creatures.push(creature)
        this.creaturesGroup.add(creature as unknown as Phaser.GameObjects.GameObject)
      })
    })
  }

  private createAirship(island: IslandDefinition): void {
    this.airship = new Airship(this, island.airshipLanding.x, island.airshipLanding.y)
  }

  private createCraftingBench(): void {
    const bx = this.islandDef.airshipLanding.x - 64
    const by = this.islandDef.airshipLanding.y
    this.craftingBench = this.physics.add.sprite(bx, by, 'crafting_bench')
    this.craftingBench.setImmovable(true)
    this.craftingBench.setDepth(3)
    this.benchPrompt = this.add.text(bx, by - 32, '[E] 制作', {
      fontSize: '14px', color: '#d4a373',
    })
    this.benchPrompt.setOrigin(0.5)
    this.benchPrompt.setDepth(61)
    this.benchPrompt.setVisible(false)
  }

  private checkAirshipInteraction(ePressed: boolean): void {
    if (!this.airship) return
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.airship.x, this.airship.y)
    if (dist < GAME_CONFIG.airship.interactRange) {
      this.airship.showPrompt()
      if (ePressed) {
        this.savePlayerState()
        this.airshipMenu.open()
      }
    } else {
      this.airship.hidePrompt()
    }
  }

  private checkBenchInteraction(ePressed: boolean): void {
    if (!this.craftingBench) return
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.craftingBench.x, this.craftingBench.y)
    if (dist < GAME_CONFIG.interact.range) {
      this.benchPrompt.setVisible(true)
      if (ePressed) {
        this.craftingUI.open()
      }
    } else {
      this.benchPrompt.setVisible(false)
    }
  }

  private savePlayerState(): void {
    const gsm = GameStateManager.getInstance()
    gsm.savePlayerState(this.player.hp, this.player.stamina, this.player.hunger)
    gsm.data.inventory = new Map(this.player.inventory)
    const skillState = this.skillTreeSystem?.saveState()
    if (skillState) {
      gsm.data.skillLevels = skillState.skills
      gsm.data.skillPoints = skillState.points
    }
  }

  private checkInteraction(): void {
    for (const resource of this.resources) {
      if (resource.isDepleted) continue
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, resource.x, resource.y)
      if (dist < GAME_CONFIG.interact.range) {
        this.player.interact(resource)
        break
      }
    }
  }

  /** 鼠标左键点击世界物体交互 */
  private handleMouseClickInteraction(): void {
    if (!this.player || this.player.dead) return

    if (!this.player.isLeftClickDown()) return

    const pointer = this.input.activePointer
    const worldX = pointer.worldX
    const worldY = pointer.worldY

    // 检查是否点击到可交互物体
    // 1. 资源
    for (const resource of this.resources) {
      if (resource.isDepleted) continue
      const distToObj = Phaser.Math.Distance.Between(worldX, worldY, resource.x, resource.y)
      if (distToObj < GAME_CONFIG.interact.range) {
        const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, resource.x, resource.y)
        if (distToPlayer < GAME_CONFIG.interact.range * 2) {
          this.player.interact(resource)
          this.player.consumeLeftClick()
          return
        }
      }
    }

    // 2. 飞艇
    if (this.airship) {
      const distToObj = Phaser.Math.Distance.Between(worldX, worldY, this.airship.x, this.airship.y)
      if (distToObj < GAME_CONFIG.airship.interactRange) {
        const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.airship.x, this.airship.y)
        if (distToPlayer < GAME_CONFIG.airship.interactRange) {
          this.savePlayerState()
          this.airshipMenu.open()
          this.player.consumeLeftClick()
          return
        }
      }
    }

    // 3. 工作台
    if (this.craftingBench) {
      const distToObj = Phaser.Math.Distance.Between(worldX, worldY, this.craftingBench.x, this.craftingBench.y)
      if (distToObj < GAME_CONFIG.interact.range) {
        const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.craftingBench.x, this.craftingBench.y)
        if (distToPlayer < GAME_CONFIG.interact.range * 2) {
          this.craftingUI.open()
          this.player.consumeLeftClick()
          return
        }
      }
    }

    // 4. 商人
    if (this.merchant) {
      const distToObj = Phaser.Math.Distance.Between(worldX, worldY, this.merchant.x, this.merchant.y)
      if (distToObj < GAME_CONFIG.interact.range) {
        const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.merchant.x, this.merchant.y)
        if (distToPlayer < GAME_CONFIG.interact.range * 2) {
          this.tradeUI.open(this.merchant.tradeOffers, this.usedTrades)
          this.player.consumeLeftClick()
          return
        }
      }
    }
  }

  // ==================== 商人 ====================

  private createMerchant(island: IslandDefinition): void {
    if (!island.merchant) { this.merchant = null; return }
    this.merchant = new Merchant(this, island.merchant.x, island.merchant.y, [
      { id: 'fiber_to_wood', name: '纤维换木材', description: '',
        requires: [{ item: 'fiber', count: 5 }], gives: [{ item: 'wood', count: 3 }] },
      { id: 'stone_to_iron', name: '石头换铁矿', description: '',
        requires: [{ item: 'stone', count: 8 }], gives: [{ item: 'iron_ore', count: 2 }] },
      { id: 'berry_to_biofuel', name: '浆果换生物燃料', description: '',
        requires: [{ item: 'berry', count: 10 }], gives: [{ item: 'biofuel', count: 3 }] },
      { id: 'bone_to_plank', name: '骨头换木板', description: '',
        requires: [{ item: 'bone', count: 3 }], gives: [{ item: 'plank', count: 5 }] },
      { id: 'translator_map', name: '碎片换古代地图', description: '一次性',
        requires: [{ item: 'translator_fragment', count: 3 }], gives: [{ item: 'translator_fragment', count: 5 }], oneTime: true },
    ])
  }

  private checkMerchantInteraction(): void {
    if (!this.merchant) return
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.merchant.x, this.merchant.y)
    if (dist < GAME_CONFIG.interact.range) {
      this.tradeUI.open(this.merchant.tradeOffers, this.usedTrades)
    }
  }

  private handleTrade(offerId: string): boolean {
    const m = this.merchant
    if (!m) return false

    const offer = m.tradeOffers.find(o => o.id === offerId)
    if (!offer) return false
    if (m.isOfferUsed(offerId, this.usedTrades)) return false

    // 检查材料
    for (const req of offer.requires) {
      if (!this.player.inventory.has(req.item) || (this.player.inventory.get(req.item) ?? 0) < req.count) {
        return false
      }
    }

    // 扣除材料
    for (const req of offer.requires) {
      const cur = this.player.inventory.get(req.item) ?? 0
      const remaining = cur - req.count
      if (remaining <= 0) this.player.inventory.delete(req.item)
      else this.player.inventory.set(req.item, remaining)
    }

    // 给予物品
    for (const give of offer.gives) {
      this.player.addItem(give.item, give.count)
    }

    if (offer.oneTime) this.usedTrades.push(offerId)
    return true
  }

  // ==================== 风暴/虚空机制 ====================

  private updateHazardMechanics(): void {
    if (!this.islandDef) return

    if (this.islandDef.type === IslandType.STORM) {
      this.stormTimer += this.game.loop.delta
      if (this.stormTimer > GAME_CONFIG.storm.lightningInterval + Math.random() * GAME_CONFIG.storm.lightningVariance) {
        this.stormTimer = 0
        this.triggerLightning()
      }
    } else if (this.islandDef.type === IslandType.VOID) {
      this.fogOfWar?.setRevealRadius(2)
    }
  }

  private triggerLightning(): void {
    if (!this.player) return

    // 闪电视觉效果
    const flash = this.add.rectangle(
      GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
      GAME_CONFIG.width, GAME_CONFIG.height,
      0xffffff, 0.6,
    )
    flash.setScrollFactor(0)
    flash.setDepth(60)
    this.tweens.add({
      targets: flash, alpha: 0, duration: 200,
      onComplete: () => flash.destroy(),
    })

    if (Math.random() < GAME_CONFIG.storm.hitChance) {
      this.player.takeDamage(GAME_CONFIG.storm.damage)
    }
  }

  // ==================== 旅行 ====================

  travelToIsland(islandId: string): void {
    this.savePlayerState()

    // 自动存档
    const gsm = GameStateManager.getInstance()
    try {
      SaveManager.saveSlot(0, gsm.toSaveData())
    } catch { /* localStorage 不可用时静默失败 */ }

    // 检测是否为程序化岛屿
    if (islandId.startsWith('procedural_')) {
      const seed = parseInt(islandId.replace('procedural_', ''), 10)
      const procDef = generateProceduralIsland(seed)
      registerIsland(procDef)
    }

    this.scene.start('LoadingScene', { toIsland: islandId })
  }
}
