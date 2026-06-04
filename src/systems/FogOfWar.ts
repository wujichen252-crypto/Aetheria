import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class FogOfWar {
  private scene: Phaser.Scene
  private tiles: Phaser.GameObjects.Rectangle[]
  private revealed: boolean[]
  private cols: number
  private rows: number
  private tileSize: number
  private revealRadius: number = 4
  private mapWidth: number
  private mapHeight: number

  constructor(scene: Phaser.Scene, mapWidth: number, mapHeight: number) {
    this.scene = scene
    this.mapWidth = mapWidth
    this.mapHeight = mapHeight
    this.tileSize = GAME_CONFIG.tileSize
    this.cols = Math.ceil(this.mapWidth / this.tileSize)
    this.rows = Math.ceil(this.mapHeight / this.tileSize)
    this.tiles = []
    this.revealed = new Array(this.cols * this.rows).fill(false)

    this.createFog()
  }

  private createFog(): void {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.scene.add.rectangle(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          this.tileSize + 1,
          this.tileSize + 1,
          0x000000, 0.85
        )
        tile.setDepth(20)
        this.tiles.push(tile)
      }
    }
  }

  update(playerX: number, playerY: number): void {
    const cx = Math.floor(playerX / this.tileSize)
    const cy = Math.floor(playerY / this.tileSize)

    for (let dy = -this.revealRadius; dy <= this.revealRadius; dy++) {
      for (let dx = -this.revealRadius; dx <= this.revealRadius; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > this.revealRadius) continue

        const tx = cx + dx
        const ty = cy + dy
        if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) continue

        const idx = ty * this.cols + tx
        if (!this.revealed[idx]) {
          this.revealed[idx] = true
          const tile = this.tiles[idx]
          this.scene.tweens.add({
            targets: tile,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
          })
        }
      }
    }
  }

  isRevealed(worldX: number, worldY: number): boolean {
    const tx = Math.floor(worldX / this.tileSize)
    const ty = Math.floor(worldY / this.tileSize)
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return false
    return this.revealed[ty * this.cols + tx]
  }

  getRevealedGrid(): boolean[] {
    return this.revealed
  }

  loadState(saved: boolean[]): void {
    if (!saved || saved.length !== this.revealed.length) return
    for (let i = 0; i < saved.length; i++) {
      if (saved[i] && !this.revealed[i]) {
        this.revealed[i] = true
        this.tiles[i].setAlpha(0)
      }
    }
  }

  setRevealRadius(r: number): void {
    this.revealRadius = r
  }

  destroy(): void {
    this.tiles.forEach(t => t.destroy())
  }
}
