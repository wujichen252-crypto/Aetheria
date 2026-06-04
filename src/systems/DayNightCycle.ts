import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

interface Star {
  x: number
  y: number
  size: number
  alpha: number
  baseAlpha: number
  phase: number
}

export class DayNightCycle {
  private scene: Phaser.Scene
  private overlay!: Phaser.GameObjects.Rectangle
  private currentTime: number = 0
  private isDay: boolean = true
  private cycleSpeed: number = 1

  private dawnColor = Phaser.Display.Color.ValueToColor(0xff8844)
  private duskColor = Phaser.Display.Color.ValueToColor(0x4444aa)
  private nightColor = Phaser.Display.Color.ValueToColor(0x111133)

  private stars: Star[] = []
  private starGraphics!: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createOverlay()
    this.createStarfield()
  }

  private createOverlay(): void {
    this.overlay = this.scene.add.rectangle(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      GAME_CONFIG.width * 3,
      GAME_CONFIG.height * 3,
      0x000000
    )
    this.overlay.setScrollFactor(0)
    this.overlay.setDepth(50)
    this.overlay.setAlpha(0)
  }

  private createStarfield(): void {
    this.starGraphics = this.scene.add.graphics()
    this.starGraphics.setScrollFactor(0)
    this.starGraphics.setDepth(51)

    // 生成星星位置（覆盖屏幕范围）
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * GAME_CONFIG.width * 3 - GAME_CONFIG.width,
        y: Math.random() * GAME_CONFIG.height * 3 - GAME_CONFIG.height,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0,
        baseAlpha: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
      })
    }
  }

  update(delta: number): void {
    const dayNight = GAME_CONFIG.dayNight
    const totalCycle = dayNight.dawnDuskDuration + dayNight.dayDuration + dayNight.dawnDuskDuration + dayNight.nightDuration

    this.currentTime += (delta / 1000) * this.cycleSpeed / totalCycle
    if (this.currentTime >= 1) this.currentTime -= 1

    let alpha = 0
    let color = 0x000000
    let nightStrength = 0 // 0=白天, 1=完全夜晚

    const dawnEnd = dayNight.dawnDuskDuration / totalCycle
    const dayEnd = (dayNight.dawnDuskDuration + dayNight.dayDuration) / totalCycle
    const duskEnd = (dayNight.dawnDuskDuration + dayNight.dayDuration + dayNight.dawnDuskDuration) / totalCycle

    if (this.currentTime < dawnEnd) {
      const progress = this.currentTime / dawnEnd
      alpha = (1 - progress) * 0.4
      nightStrength = 1 - progress
      const inter = Phaser.Display.Color.Interpolate.ColorWithColor(
        this.nightColor, this.dawnColor, 100, progress * 100
      )
      color = Phaser.Display.Color.GetColor(inter.r, inter.g, inter.b)
      this.isDay = false
    } else if (this.currentTime < dayEnd) {
      alpha = 0
      nightStrength = 0
      this.isDay = true
    } else if (this.currentTime < duskEnd) {
      const progress = (this.currentTime - dayEnd) / (duskEnd - dayEnd)
      alpha = progress * 0.35
      nightStrength = progress
      const inter = Phaser.Display.Color.Interpolate.ColorWithColor(
        this.dawnColor, this.duskColor, 100, progress * 100
      )
      color = Phaser.Display.Color.GetColor(inter.r, inter.g, inter.b)
      this.isDay = false
    } else {
      alpha = 0.35
      nightStrength = 1
      color = 0x111133
      this.isDay = false
    }

    this.overlay.setAlpha(alpha)
    this.overlay.setFillStyle(color)

    // 星空
    this.updateStarfield(delta, nightStrength)
  }

  private updateStarfield(delta: number, nightStrength: number): void {
    this.starGraphics.clear()

    for (const star of this.stars) {
      const twinkle = Math.sin(star.phase + this.currentTime * Math.PI * 8) * 0.3 + 0.7
      star.phase += delta * 0.001

      const targetAlpha = star.baseAlpha * twinkle * nightStrength
      star.alpha += (targetAlpha - star.alpha) * 0.05

      if (star.alpha > 0.01) {
        this.starGraphics.fillStyle(0xffffff, star.alpha)
        this.starGraphics.fillCircle(star.x, star.y, star.size)
      }
    }
  }

  isDaytime(): boolean {
    return this.isDay
  }

  getTimeProgress(): number {
    return this.currentTime
  }
}
