import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class DayNightCycle {
  private scene: Phaser.Scene
  private overlay!: Phaser.GameObjects.Rectangle
  private currentTime: number = 0 // 0-1 代表一天
  private isDay: boolean = true
  private cycleSpeed: number = 1 // 每秒时间流逝比例

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createOverlay()
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

  update(delta: number): void {
    const dayNight = GAME_CONFIG.dayNight
    
    // 一个完整周期是 1320 秒 (dawn + day + dusk + night)
    const totalCycle = dayNight.dawnDuskDuration + dayNight.dayDuration + dayNight.dawnDuskDuration + dayNight.nightDuration
    
    // 时间流逝
    this.currentTime += (delta / 1000) * this.cycleSpeed / totalCycle
    if (this.currentTime >= 1) this.currentTime -= 1
    
    // 计算光照强度和颜色
    let alpha = 0
    let color = 0x000000
    
    // 阶段计算 (0-1)
    const dawnEnd = dayNight.dawnDuskDuration / totalCycle
    const dayEnd = (dayNight.dawnDuskDuration + dayNight.dayDuration) / totalCycle
    const duskEnd = (dayNight.dawnDuskDuration + dayNight.dayDuration + dayNight.dawnDuskDuration) / totalCycle
    
    if (this.currentTime < dawnEnd) {
      // 黎明阶段 - 从黑夜过渡到白天
      const progress = this.currentTime / dawnEnd
      alpha = (1 - progress) * 0.4
      // 橙红色渐变
      color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 20, g: 20, b: 50 },
        { r: 255, g: 136, b: 68 },
        100,
        progress * 100
      )
      this.isDay = false
    } else if (this.currentTime < dayEnd) {
      // 白天阶段 - 完全光照
      alpha = 0
      this.isDay = true
    } else if (this.currentTime < duskEnd) {
      // 黄昏阶段 - 从白天过渡到黑夜
      const progress = (this.currentTime - dayEnd) / (duskEnd - dayEnd)
      alpha = progress * 0.35
      // 蓝紫色渐变
      color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 255, g: 136, b: 68 },
        { r: 68, g: 68, b: 170 },
        100,
        progress * 100
      )
      this.isDay = false
    } else {
      // 夜晚阶段 - 持续黑暗
      alpha = 0.35
      color = 0x111133
      this.isDay = false
    }
    
    // 应用视觉效果
    this.overlay.setAlpha(alpha)
    this.overlay.setFillStyle(
      (color as any).r << 16 | (color as any).g << 8 | (color as any).b
    )
  }

  isDaytime(): boolean {
    return this.isDay
  }

  getTimeProgress(): number {
    return this.currentTime
  }
}
