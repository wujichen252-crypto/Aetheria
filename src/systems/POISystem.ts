import Phaser from 'phaser'
import { GameStateManager } from './GameState'
import { POIDefinition } from '../world/IslandData'

export class POISystem {
  private scene: Phaser.Scene
  private pois: POIDefinition[]
  private markers: Phaser.GameObjects.Container[] = []
  private onDiscover: (poiId: string) => void

  constructor(scene: Phaser.Scene, pois: POIDefinition[], onDiscover: (poiId: string) => void) {
    this.scene = scene
    this.pois = pois
    this.onDiscover = onDiscover
    this.createMarkers()
  }

  private createMarkers(): void {
    const gsm = GameStateManager.getInstance()

    this.pois.forEach(poi => {
      if (gsm.data.discoveredPois.includes(poi.id)) return

      // 问号标记（未发现）
      const marker = this.scene.add.text(poi.x, poi.y - 20, '?', {
        fontSize: '24px', color: '#ffdd44', fontStyle: 'bold',
      })
      marker.setOrigin(0.5)
      marker.setDepth(25)

      // 脉动动画
      this.scene.tweens.add({
        targets: marker,
        scale: { from: 1, to: 1.3 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      // 发光光晕（圆圈）
      const glow = this.scene.add.circle(poi.x, poi.y, 8, 0xffdd44, 0.3)
      glow.setDepth(24)
      this.scene.tweens.add({
        targets: glow,
        alpha: { from: 0.3, to: 0.1 },
        scale: { from: 1, to: 1.5 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
      })

      const container = this.scene.add.container(0, 0, [glow, marker])
      this.markers.push(container)
    })
  }

  checkDiscovery(playerX: number, playerY: number, radius: number = 50): void {
    const gsm = GameStateManager.getInstance()

    this.pois.forEach((poi, idx) => {
      if (gsm.data.discoveredPois.includes(poi.id)) return

      const dist = Phaser.Math.Distance.Between(playerX, playerY, poi.x, poi.y)
      if (dist < radius) {
        gsm.data.discoveredPois.push(poi.id)
        this.onDiscover(poi.id)

        // 销毁标记
        if (this.markers[idx]) {
          this.scene.tweens.add({
            targets: this.markers[idx],
            alpha: 0,
            scale: 2,
            duration: 500,
            onComplete: () => this.markers[idx].destroy(),
          })
        }

        // 显示发现文字
        const text = this.scene.add.text(poi.x, poi.y - 40, `发现: ${poi.name}`, {
          fontSize: '16px', color: '#ffdd44', fontStyle: 'bold',
        })
        text.setOrigin(0.5)
        text.setDepth(60)
        this.scene.tweens.add({
          targets: text,
          y: text.y - 30,
          alpha: 0,
          duration: 2000,
          onComplete: () => text.destroy(),
        })
      }
    })
  }

  destroy(): void {
    this.markers.forEach(m => m.destroy())
  }
}
