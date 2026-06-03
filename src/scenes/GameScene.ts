import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { Player } from '../entities/Player'
import { Resource } from '../entities/Resource'
import { Hud } from '../ui/Hud'
import { InventoryUI } from '../ui/InventoryUI'
import { DayNightCycle } from '../systems/DayNightCycle'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private resources: Resource[] = []
  public hud!: Hud
  public inventoryUI!: InventoryUI
  private dayNightCycle!: DayNightCycle

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    // 创建地图
    this.createMap()
    
    // 创建玩家
    this.player = new Player(this, 400, 300)
    
    // 创建资源
    this.createResources()
    
    // 创建UI
    this.hud = new Hud(this)
    this.inventoryUI = new InventoryUI(this, this.player.inventory)
    
    // 设置摄像机跟随
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, 1280, 960)
    this.cameras.main.setZoom(1.5)
    
    // 底部操作提示
    const hintText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 30,
      '[WASD] 移动  [Shift] 奔跑  [E] 交互  [Tab] 背包',
      { fontSize: '14px', color: '#888888' }
    )
    hintText.setOrigin(0.5)
    hintText.setScrollFactor(0)
    hintText.setDepth(100)
  }

  private createMap(): void {
    // 创建调色板
    const graphics = this.add.graphics()
    graphics.fillStyle(GAME_CONFIG.colors.ground)
    graphics.fillRect(0, 0, 1280, 960)
    graphics.lineStyle(1, 0x2a2a4a, 0.3)
    
    // 绘制网格
    for (let x = 0; x < 1280; x += GAME_CONFIG.tileSize) {
      graphics.moveTo(x, 0)
      graphics.lineTo(x, 960)
    }
    for (let y = 0; y < 960; y += GAME_CONFIG.tileSize) {
      graphics.moveTo(0, y)
      graphics.lineTo(1280, y)
    }
    graphics.strokePath()
    
    graphics.setDepth(-1)
  }

  private createResources(): void {
    // 随机放置树木
    const treePositions = [
      { x: 200, y: 200 }, { x: 300, y: 150 }, { x: 500, y: 250 },
      { x: 600, y: 400 }, { x: 150, y: 400 }, { x: 700, y: 150 },
      { x: 800, y: 300 }, { x: 350, y: 500 }, { x: 550, y: 600 }
    ]
    
    treePositions.forEach(pos => {
      const tree = new Resource(this, pos.x, pos.y, 'tree', 'tree')
      this.resources.push(tree)
      this.physics.add.existing(tree, true)
    })
    
    // 随机放置岩石
    const rockPositions = [
      { x: 400, y: 200 }, { x: 450, y: 350 }, { x: 250, y: 300 },
      { x: 700, y: 500 }, { x: 500, y: 150 }
    ]
    
    rockPositions.forEach(pos => {
      const rock = new Resource(this, pos.x, pos.y, 'rock', 'rock')
      this.resources.push(rock)
      this.physics.add.existing(rock, true)
    })
  }

  update(): void {
    this.player?.update()
    
    // 检查交互
    if (this.player.getInteractKey().isDown) {
      this.checkInteraction()
    }
  }
  
  private checkInteraction(): void {
    const interactRange = 50
    
    for (const resource of this.resources) {
      if (resource.isDepleted) continue
      
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        resource.x, resource.y
      )
      
      if (dist < interactRange) {
        this.player.interact(resource)
        break
      }
    }
  }
}
