import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export enum WeatherState {
  SUNNY = 'sunny',
  CLOUDY = 'cloudy',
  RAIN = 'rain',
  FOG = 'fog',
}

export class WeatherSystem {
  private scene: Phaser.Scene
  private currentState: WeatherState = WeatherState.SUNNY
  private targetState: WeatherState = WeatherState.SUNNY
  private fogOverlay!: Phaser.GameObjects.Rectangle
  private rainEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null
  private transitionProgress: number = 1

  constructor(scene: Phaser.Scene, weatherBias: string) {
    this.scene = scene
    this.createFogOverlay()

    // 根据岛屿天气倾向设置初始天气
    this.currentState = this.getWeatherForBias(weatherBias)
    this.targetState = this.currentState
    this.applyWeatherState(this.currentState, 1)
  }

  private createFogOverlay(): void {
    this.fogOverlay = this.scene.add.rectangle(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      GAME_CONFIG.width * 3,
      GAME_CONFIG.height * 3,
      0xffffff, 0
    )
    this.fogOverlay.setScrollFactor(0)
    this.fogOverlay.setDepth(40)
  }

  private getWeatherForBias(bias: string): WeatherState {
    switch (bias) {
      case 'sunny': return WeatherState.SUNNY
      case 'rainy': return WeatherState.RAIN
      case 'foggy': return WeatherState.FOG
      case 'stormy': return WeatherState.RAIN
      case 'mixed': return WeatherState.CLOUDY
      default: return WeatherState.SUNNY
    }
  }

  private createRain(): void {
    this.destroyRain()
    this.rainEmitter = this.scene.add.particles(0, 0, 'rain_particle', {
      x: { min: -GAME_CONFIG.width / 2, max: GAME_CONFIG.width * 1.5 },
      y: { min: -GAME_CONFIG.height / 2, max: 0 },
      speed: { min: 300, max: 500 },
      angle: { min: 80, max: 100 },
      lifespan: 2000,
      frequency: 30,
      quantity: 2,
      alpha: { start: 0.6, end: 0 },
      scale: { start: 1, end: 0.5 },
    })
    this.rainEmitter.setDepth(45)
    this.rainEmitter.setScrollFactor(0)
  }

  private destroyRain(): void {
    if (this.rainEmitter) {
      this.rainEmitter.destroy()
      this.rainEmitter = null
    }
  }

  private applyWeatherState(state: WeatherState, alpha: number): void {
    switch (state) {
      case WeatherState.SUNNY:
        this.destroyRain()
        this.fogOverlay.setAlpha(0)
        break
      case WeatherState.CLOUDY:
        this.destroyRain()
        this.fogOverlay.setAlpha(0.1 * alpha)
        break
      case WeatherState.RAIN:
        this.createRain()
        this.fogOverlay.setAlpha(0.08 * alpha)
        break
      case WeatherState.FOG:
        this.destroyRain()
        this.fogOverlay.setAlpha(GAME_CONFIG.weather.fogMaxAlpha * alpha)
        break
    }
  }

  update(_delta: number): void {
    if (this.transitionProgress < 1) {
      this.transitionProgress += GAME_CONFIG.weather.transitionSpeed
      const eased = Math.min(1, this.transitionProgress)
      this.applyWeatherState(this.targetState, eased)
    }
  }

  getCurrentState(): WeatherState {
    return this.currentState
  }

  destroy(): void {
    this.destroyRain()
    this.fogOverlay.destroy()
  }
}
