import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class Resource extends Phaser.Physics.Arcade.Sprite {
  public type: string
  public hp: number
  private maxHp: number
  private yieldItems: string[]
  private respawnTime: number
  public isDepleted: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number, type: string, texture: string) {
    super(scene, x, y, texture)
    this.type = type

    scene.add.existing(this)
    scene.physics.add.existing(this, true)

    const config = GAME_CONFIG.resources[type as keyof typeof GAME_CONFIG.resources]
    this.maxHp = config?.hp || 3
    this.hp = this.maxHp
    this.yieldItems = config?.yield || ['wood']
    this.respawnTime = config?.respawnTime || 300

    this.setDepth(5)
  }

  damage(amount: number, player: any): void {
    if (this.isDepleted) return

    this.hp -= amount

    // 视觉反馈 - 闪烁
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    })

    if (this.hp <= 0) {
      this.destroyResource(player)
    }
  }

  private destroyResource(player: any): void {
    this.isDepleted = true

    // 掉落物品
    this.yieldItems.forEach(item => {
      player.addItem(item, 1)
    })

    // 采集粒子特效
    this.spawnCollectParticles()

    // 隐藏资源
    this.setVisible(false)
    this.disableBody(true, true)

    // 定时重生
    this.scene.time.delayedCall(this.respawnTime * 1000, () => {
      this.respawn()
    })
  }

  private spawnCollectParticles(): void {
    const colors = [0xffdd44, 0xffaa44, 0xffffff]
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const dist = 30 + Math.random() * 20
      const p = this.scene.add.circle(this.x, this.y, 3, colors[i % colors.length])
      p.setDepth(15)
      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 350 + Math.random() * 150,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      })
    }
  }

  private respawn(): void {
    this.isDepleted = false
    this.hp = this.maxHp
    this.setVisible(true)
    this.enableBody(true, this.x, this.y, true, true)
  }
}
