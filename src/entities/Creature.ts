import Phaser from 'phaser'
import { CreatureDefinition, CreatureType } from '../world/CreatureDefinitions'
import { Player } from './Player'

enum CreatureState {
  IDLE, PATROL, ALERT, CHASE, ATTACK, FLEE, RETURN,
}

export class Creature extends Phaser.Physics.Arcade.Sprite {
  public def: CreatureDefinition
  private aiState: CreatureState = CreatureState.IDLE
  private patrolTarget: { x: number; y: number } | null = null
  private spawnX: number
  private spawnY: number
  private attackTimer: number = 0
  private stateTimer: number = 0
  private hp: number
  public isDead: boolean = false
  private flashTween: Phaser.Tweens.Tween | null = null

  constructor(scene: Phaser.Scene, x: number, y: number, def: CreatureDefinition) {
    super(scene, x, y, def.texture)
    this.def = def
    this.hp = def.hp
    this.spawnX = x
    this.spawnY = y

    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject)
    scene.physics.add.existing(this as unknown as Phaser.GameObjects.GameObject)
    this.setDepth(5)
    this.setCollideWorldBounds(true)

    if (def.type === CreatureType.PASSIVE) {
      this.aiState = CreatureState.PATROL
    }
  }

  setSpawn(x: number, y: number): void {
    this.spawnX = x
    this.spawnY = y
  }

  update(_delta: number, _player: Player): void {
    if (this.isDead) return

    const dist = Phaser.Math.Distance.Between(this.x, this.y, _player.x, _player.y)

    this.stateTimer += _delta / 1000
    if (this.attackTimer > 0) this.attackTimer -= _delta

    this.updateAI(dist, _player)
  }

  private updateAI(dist: number, player: Player): void {
    switch (this.aiState) {
      case CreatureState.IDLE:
        this.setVelocity(0, 0)
        if (dist < this.def.detectRange) {
          this.aiState = CreatureState.ALERT
          this.stateTimer = 0
        } else if (this.stateTimer > 3) {
          this.aiState = CreatureState.PATROL
          this.stateTimer = 0
        }
        break

      case CreatureState.PATROL:
        this.doPatrol()
        if (dist < this.def.detectRange) {
          this.aiState = CreatureState.ALERT
          this.stateTimer = 0
        }
        break

      case CreatureState.ALERT:
        this.setVelocity(0, 0)
        if (this.def.type === CreatureType.PASSIVE) {
          this.aiState = CreatureState.FLEE
        } else if (dist < this.def.attackRange) {
          this.aiState = CreatureState.ATTACK
        } else {
          this.aiState = CreatureState.CHASE
        }
        break

      case CreatureState.CHASE:
        this.chasePlayer(player)
        if (dist < this.def.attackRange) {
          this.aiState = CreatureState.ATTACK
        } else if (dist > this.def.chaseRange) {
          this.aiState = CreatureState.RETURN
          this.stateTimer = 0
        }
        break

      case CreatureState.ATTACK:
        this.setVelocity(0, 0)
        if (this.attackTimer <= 0) {
          // 攻击玩家
          if (dist < this.def.attackRange + 20) {
            player.takeDamage(this.def.damage)
          }
          this.attackTimer = this.def.attackCooldown
        }
        if (dist > this.def.attackRange * 1.5) {
          this.aiState = CreatureState.CHASE
        }
        break

      case CreatureState.FLEE:
        this.fleeFromPlayer(player)
        if (dist > this.def.fleeRange) {
          this.aiState = CreatureState.RETURN
          this.stateTimer = 0
        }
        break

      case CreatureState.RETURN:
        this.returnToSpawn()
        if (dist < this.def.detectRange && this.def.type === CreatureType.HOSTILE) {
          this.aiState = CreatureState.CHASE
        }
        break
    }
  }

  private doPatrol(): void {
    if (!this.patrolTarget || Phaser.Math.Distance.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y) < 10) {
      // 随机新目标
      this.patrolTarget = {
        x: this.spawnX + Phaser.Math.Between(-80, 80),
        y: this.spawnY + Phaser.Math.Between(-80, 80),
      }
    }
    this.moveToward(this.patrolTarget.x, this.patrolTarget.y, this.def.speed * 0.5)
  }

  private chasePlayer(player: Player): void {
    this.moveToward(player.x, player.y, this.def.speed)
  }

  private fleeFromPlayer(player: Player): void {
    const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y)
    this.setVelocity(
      Math.cos(angle) * this.def.speed * 1.2,
      Math.sin(angle) * this.def.speed * 1.2,
    )
  }

  private returnToSpawn(): void {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.spawnX, this.spawnY)
    if (dist < 10) {
      this.setVelocity(0, 0)
      this.aiState = CreatureState.PATROL
      this.stateTimer = 0
    } else {
      this.moveToward(this.spawnX, this.spawnY, this.def.speed * 0.6)
    }
  }

  private moveToward(tx: number, ty: number, speed: number): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, tx, ty)
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
  }

  takeDamage(amount: number): boolean {
    if (this.isDead) return false

    this.hp -= amount

    // 视觉反馈
    if (this.flashTween) this.flashTween.stop()
    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 2,
    })

    // 中立单位被激怒
    if (this.def.type === CreatureType.NEUTRAL) {
      this.aiState = CreatureState.ALERT
    }

    if (this.hp <= 0) {
      this.die()
      return true
    }

    return false
  }

  private die(): void {
    this.isDead = true
    this.setVelocity(0, 0)
    this.body?.enable && this.disableBody(true, false)

    // 掉落（暂不实现拾取）
    this.def.drops.forEach(drop => {
      if (Math.random() < drop.chance) {
        void this.scene.children
      }
    })

    // 死亡动画
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      onComplete: () => this.destroy(),
    })
  }

  getAiState(): CreatureState {
    return this.aiState
  }
}
