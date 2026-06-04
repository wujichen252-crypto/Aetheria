import Phaser from 'phaser'

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number
  public knockback: number
  private lifespan: number = 3000

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    dirX: number, dirY: number, speed: number,
    damage: number, knockback: number, texture: string,
  ) {
    super(scene, x, y, texture)
    this.damage = damage
    this.knockback = knockback

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setDepth(8)
    this.setVelocity(dirX * speed, dirY * speed)
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).allowGravity = false
    }

    // 飞出世界边界或超时后销毁
    scene.time.delayedCall(this.lifespan, () => {
      if (this.active) this.destroy()
    })
  }

  update(): void {
    if (!this.active) return
    const bounds = this.scene.physics.world.bounds
    if (
      this.x < bounds.x - 50 || this.x > bounds.x + bounds.width + 50 ||
      this.y < bounds.y - 50 || this.y > bounds.y + bounds.height + 50
    ) {
      this.destroy()
    }
  }
}
