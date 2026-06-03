import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { InputManager } from '../systems/InputManager'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private input!: InputManager
  
  // 属性
  public hp: number
  public stamina: number
  public hunger: number
  public inventory: Map<string, number>
  
  // 状态
  private isRunning: boolean = false
  private interactCooldown: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')
    this.scene = scene
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    this.setCollideWorldBounds(true)
    this.setDepth(10)
    
    // 初始化属性
    this.hp = GAME_CONFIG.player.hpMax
    this.stamina = GAME_CONFIG.player.staminaMax
    this.hunger = GAME_CONFIG.player.hungerMax
    this.inventory = new Map()
    
    // 输入管理器
    this.input = new InputManager(scene)
  }

  update(): void {
    if (!this.input) return
    
    const direction = this.input.getDirection()
    const speed = this.input.getSpeed()
    
    // 归一化对角线移动
    if (direction.x !== 0 && direction.y !== 0) {
      direction.x *= 0.707
      direction.y *= 0.707
    }
    
    // 奔跑消耗体力
    if (this.input.isMoving() && this.input.isRunning && this.stamina > 0) {
      this.stamina -= GAME_CONFIG.player.staminaCost * (1/60)
      this.isRunning = true
    } else {
      this.isRunning = false
      // 体力恢复
      if (this.stamina < GAME_CONFIG.player.staminaMax) {
        this.stamina += GAME_CONFIG.player.staminaRegen * (1/60)
      }
    }
    
    // 饥饿自然减少
    this.hunger -= GAME_CONFIG.player.hungerDecrease * (1/60)
    this.hunger = Math.max(0, this.hunger)
    
    // 应用移动
    this.setVelocity(direction.x * speed, direction.y * speed)
    
    // 更新状态UI
    this.updateHud()
  }

  private updateHud(): void {
    const gameScene = this.scene.scene.get('GameScene') as any
    if (gameScene?.hud) {
      gameScene.hud.updateStats(this.hp, this.stamina, this.hunger)
    }
  }

  addItem(item: string, count: number = 1): void {
    const current = this.inventory.get(item) || 0
    this.inventory.set(item, current + count)
    
    // 显示收集提示
    const gameScene = this.scene.scene.get('GameScene') as any
    if (gameScene?.hud) {
      gameScene.hud.showCollectMessage(item, count)
    }
    
    // 更新背包UI
    if (gameScene?.inventoryUI) {
      gameScene.inventoryUI.updateDisplay()
    }
  }

  interact(resource: any): void {
    if (resource && !this.interactCooldown) {
      resource.damage(1, this)
      this.interactCooldown = true
      this.scene.time.delayedCall(300, () => {
        this.interactCooldown = false
      })
    }
  }

  getInteractKey(): Phaser.Input.Keyboard.Key {
    return this.input.keys.interact
  }
}
