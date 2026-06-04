import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { InputManager } from '../systems/InputManager'
import { GameStateManager } from '../systems/GameState'
import { getItemWeight } from '../world/ItemDefinitions'
import { WeaponDefinition, WeaponType, WEAPON_DEFS, UNARMED } from './Weapon'

const DODGE_SPEED = 500
const DODGE_DURATION = 200
const DODGE_COOLDOWN = 800
const INVINCIBLE_DURATION = 500

export class Player extends Phaser.Physics.Arcade.Sprite {
  private inputManager!: InputManager

  public hp: number
  public stamina: number
  public hunger: number
  public inventory: Map<string, number>
  public dead: boolean = false

  private interactCooldown: boolean = false

  // 战斗
  public equippedWeapon: WeaponDefinition = UNARMED
  public facingX: number = 0
  public facingY: number = 1
  private attackTimer: number = 0
  private isInvincible: boolean = false
  private invincibleTimer: number = 0
  private isDodging: boolean = false
  private dodgeTimer: number = 0
  private dodgeCooldownTimer: number = 0
  private walkTimer: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    this.setDepth(10)

    const gsm = GameStateManager.getInstance()
    this.hp = gsm.data.hp
    this.stamina = gsm.data.stamina
    this.hunger = gsm.data.hunger
    this.inventory = new Map(gsm.data.inventory)

    this.inputManager = new InputManager(scene)
    this.refreshWeapons()
  }

  update(delta?: number): void {
    if (!this.inputManager) return

    const dDelta = delta || 16.67

    // 更新计时器
    this.attackTimer = Math.max(0, this.attackTimer - dDelta)
    this.invincibleTimer = Math.max(0, this.invincibleTimer - dDelta)
    this.dodgeTimer = Math.max(0, this.dodgeTimer - dDelta)
    this.dodgeCooldownTimer = Math.max(0, this.dodgeCooldownTimer - dDelta)

    if (this.isInvincible && this.invincibleTimer <= 0) {
      this.isInvincible = false
    }

    // 刷新可用武器列表
    this.refreshWeapons()

    const direction = this.inputManager.getDirection()

    // 闪避检测（Shift 按下瞬间 + 方向）
    const dodgePressed = this.inputManager.isDodgePressed()
    if (dodgePressed && (direction.x !== 0 || direction.y !== 0) && this.dodgeTimer <= 0 && this.dodgeCooldownTimer <= 0) {
      this.performDodge(direction.x, direction.y)
    }

    // 闪避中，覆盖正常移动
    if (this.dodgeTimer > 0) {
      this.updateHud()
      return
    }
    if (this.isDodging) {
      this.isDodging = false
      this.setAlpha(1)
    }

    // 更新面朝方向
    if (direction.x !== 0 || direction.y !== 0) {
      this.facingX = Math.sign(direction.x)
      this.facingY = Math.sign(direction.y)
    }

    const speed = this.inputManager.getSpeed()

    // 归一化对角线移动
    if (direction.x !== 0 && direction.y !== 0) {
      direction.x *= 0.707
      direction.y *= 0.707
    }

    // 负重影响速度
    const weightRatio = this.getWeightRatio()
    const speedMultiplier = weightRatio > 0.8 ? 0.7 : weightRatio > 0.4 ? 0.85 : 1.0

    // 奔跑消耗体力
    if (this.inputManager.isMoving() && this.inputManager.isRunning && this.stamina > 0) {
      this.stamina -= GAME_CONFIG.player.staminaCost * (1 / 60)
    } else {
      if (this.stamina < GAME_CONFIG.player.staminaMax) {
        this.stamina += GAME_CONFIG.player.staminaRegen * (1 / 60)
      }
    }

    // 饥饿自然减少
    this.hunger -= GAME_CONFIG.player.hungerDecrease * (1 / 60)
    this.hunger = Math.max(0, this.hunger)

    // 应用移动
    this.setVelocity(direction.x * speed * speedMultiplier, direction.y * speed * speedMultiplier)

    // 行走动画（呼吸式缩放）
    if (direction.x !== 0 || direction.y !== 0) {
      this.walkTimer += dDelta * 0.008
      const bob = Math.sin(this.walkTimer) * 0.025
      this.setScale(1 + bob, 1 - bob)
    } else {
      this.walkTimer = 0
      this.setScale(1)
    }

    // 更新HUD
    this.updateHud()
  }

  private getWeightRatio(): number {
    return this.getWeight() / GAME_CONFIG.player.weightMax
  }

  getWeight(): number {
    let total = 0
    this.inventory.forEach((count, item) => {
      total += getItemWeight(item) * count
    })
    return total
  }

  getWeightMax(): number {
    return GAME_CONFIG.player.weightMax
  }

  private updateHud(): void {
    const gameScene = this.scene.scene.get('GameScene') as any
    if (gameScene?.hud) {
      gameScene.hud.updateStats(this.hp, this.stamina, this.hunger)
      gameScene.hud.updateWeapon(this.equippedWeapon.name)
    }
  }

  addItem(item: string, count: number = 1): void {
    const current = this.inventory.get(item) || 0
    this.inventory.set(item, current + count)
    this.refreshWeapons()

    const gameScene = this.scene.scene.get('GameScene') as any
    if (gameScene?.hud) {
      gameScene.hud.showCollectMessage(item, count)
    }
    if (gameScene?.inventoryUI) {
      gameScene.inventoryUI.updateDisplay()
    }
  }

  interact(resource: any): void {
    if (resource && !this.interactCooldown) {
      resource.damage(1, this)
      this.interactCooldown = true
      this.scene.time.delayedCall(GAME_CONFIG.interact.cooldown, () => {
        this.interactCooldown = false
      })
    }
  }

  getInteractKey(): Phaser.Input.Keyboard.Key {
    return this.inputManager.getKey('interact')
  }

  isAttackPressed(): boolean {
    return this.inputManager.isAttackPressed()
  }

  isWeaponSwitchPressed(): boolean {
    return this.inputManager.isWeaponSwitchPressed()
  }

  /** 鼠标左键是否刚刚按下 */
  isLeftClickDown(): boolean {
    return this.inputManager.isLeftClickDown()
  }

  /** 消费当前左键点击（防止同时触发攻击） */
  consumeLeftClick(): void {
    this.inputManager.consumeLeftClick()
  }

  /** 攻击：返回面朝方向与武器信息，供 GameScene 处理碰撞/弹道 */
  attack(): { dirX: number; dirY: number; weapon: WeaponDefinition } | null {
    if (this.attackTimer > 0) return null
    if (this.isDodging || this.dodgeTimer > 0) return null

    // 检查体力
    if (this.stamina < this.equippedWeapon.staminaCost) return null
    this.stamina -= this.equippedWeapon.staminaCost

    this.attackTimer = this.equippedWeapon.attackSpeed

    // 攻击动画——淡白闪光
    this.setTint(0xffffff)
    this.scene.time.delayedCall(60, () => {
      if (this.active) this.clearTint()
    })

    return {
      dirX: this.facingX || 0,
      dirY: this.facingY || 1,
      weapon: this.equippedWeapon,
    }
  }

  takeDamage(amount: number): void {
    if (this.isInvincible || this.isDodging || this.dodgeTimer > 0) return

    this.hp -= amount
    this.isInvincible = true
    this.invincibleTimer = INVINCIBLE_DURATION

    // 受击闪红
    this.setTint(0xff4444)
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint()
    })

    // 击退（远离伤害来源方向——简化为屏幕震动）
    this.scene.cameras.main.shake(100, 0.005)

    if (this.hp <= 0) {
      this.die()
    }
  }

  private die(): void {
    this.dead = true
    this.setVelocity(0, 0)

    // 死亡视觉效果
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 400,
      ease: 'Power2',
    })
  }

  /** 重置为初始岛屿重生状态（由 GameScene 调用） */
  respawn(): void {
    const gsm = GameStateManager.getInstance()

    // 死亡惩罚：保留武器/工具，失去 50% 其他物品
    const kept = new Map<string, number>()
    this.inventory.forEach((count, item) => {
      if (item === 'dagger' || item === 'spear' || item === 'slingshot') {
        kept.set(item, count)
      } else {
        const half = Math.floor(count * 0.5)
        if (half > 0) kept.set(item, half)
      }
    })
    gsm.data.inventory = kept
    gsm.data.hp = gsm.data.maxHp
    gsm.data.stamina = gsm.data.maxStamina
    gsm.data.hunger = gsm.data.maxHunger
    gsm.data.currentIsland = 'starter_forest'

    this.dead = false
    this.hp = gsm.data.hp
    this.stamina = gsm.data.stamina
    this.hunger = gsm.data.hunger
    this.inventory = new Map(kept)
    this.refreshWeapons()
    this.setAlpha(1)
    this.setScale(1)
  }

  private performDodge(dirX: number, dirY: number): void {
    this.isDodging = true
    this.dodgeTimer = DODGE_DURATION
    this.dodgeCooldownTimer = DODGE_COOLDOWN
    this.attackTimer = Math.max(this.attackTimer, 100) // 闪避后短暂不能攻击

    // 面向闪避方向
    if (dirX !== 0) this.facingX = Math.sign(dirX)
    if (dirY !== 0) this.facingY = Math.sign(dirY)

    this.setVelocity(dirX * DODGE_SPEED, dirY * DODGE_SPEED)
    this.setAlpha(0.5)
  }

  cycleWeapon(): void {
    // 根据 inventory 重建可用武器列表
    const weapons = this.getOwnedWeaponTypes()
    if (weapons.length === 0) {
      this.equippedWeapon = UNARMED
      return
    }

    // 找当前武器在列表中的位置，切换到下一个
    const currentIdx = weapons.indexOf(this.equippedWeapon.type)
    if (currentIdx < weapons.length - 1) {
      const next = weapons[currentIdx + 1]
      this.equippedWeapon = WEAPON_DEFS[next]
    } else {
      // 循环到第一个
      const next = weapons[0]
      this.equippedWeapon = WEAPON_DEFS[next]
    }
  }

  private getOwnedWeaponTypes(): WeaponType[] {
    const list: WeaponType[] = []
    if (this.inventory.has('dagger')) list.push(WeaponType.DAGGER)
    if (this.inventory.has('spear')) list.push(WeaponType.SPEAR)
    if (this.inventory.has('slingshot')) list.push(WeaponType.SLINGSHOT)
    return list
  }

  private refreshWeapons(): void {
    const owned = this.getOwnedWeaponTypes()
    if (owned.length === 0) {
      if (this.equippedWeapon.type !== WeaponType.DAGGER || this.equippedWeapon !== UNARMED) {
        this.equippedWeapon = UNARMED
      }
      return
    }
    // 如果当前武器不再拥有，切换到第一个可用
    if (!owned.includes(this.equippedWeapon.type)) {
      this.equippedWeapon = WEAPON_DEFS[owned[0]]
    }
  }
}
