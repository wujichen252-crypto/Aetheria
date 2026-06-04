import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { FogOfWar } from '../systems/FogOfWar'
import { POIDefinition } from '../world/IslandData'
import { GameStateManager } from '../systems/GameState'

export class MapUI {
  private scene: Phaser.Scene
  private container!: Phaser.GameObjects.Container
  private isOpen: boolean = false
  private fogOfWar: FogOfWar
  private islandWidth: number
  private islandHeight: number
  private poiList: POIDefinition[]
  private playerDot!: Phaser.GameObjects.Arc

  constructor(
    scene: Phaser.Scene,
    fogOfWar: FogOfWar,
    mapWidth: number,
    mapHeight: number,
    pois: POIDefinition[],
  ) {
    this.scene = scene
    this.fogOfWar = fogOfWar
    this.islandWidth = mapWidth
    this.islandHeight = mapHeight
    this.poiList = pois
    this.createUI()
    this.setupInput()
  }

  private createUI(): void {
    // 大地图
    const scaleX = GAME_CONFIG.width / this.islandWidth
    const scaleY = GAME_CONFIG.height / this.islandHeight
    const scale = Math.min(scaleX, scaleY) * 0.8

    const mapW = this.islandWidth * scale
    const mapH = this.islandHeight * scale

    const bg = this.scene.add.rectangle(0, 0, mapW + 40, mapH + 40, 0x1a1a2e, 0.95)
    bg.setStrokeStyle(2, 0xd4a373)

    // 地图网格渲染（使用 Graphics）
    const mapGfx = this.scene.add.graphics()
    const offsetX = -mapW / 2
    const offsetY = -mapH / 2

    // 已探索区域（暗色背景上稍亮）
    const gsm = GameStateManager.getInstance()
    const revealed = this.fogOfWar.getRevealedGrid()
    const cols = Math.ceil(this.islandWidth / GAME_CONFIG.tileSize)
    const rows = Math.ceil(this.islandHeight / GAME_CONFIG.tileSize)

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const idx = ty * cols + tx
        if (revealed[idx]) {
          mapGfx.fillStyle(0x3a5a3a, 0.6)
          mapGfx.fillRect(
            offsetX + tx * GAME_CONFIG.tileSize * scale,
            offsetY + ty * GAME_CONFIG.tileSize * scale,
            GAME_CONFIG.tileSize * scale + 1,
            GAME_CONFIG.tileSize * scale + 1,
          )
        }
      }
    }

    // 岛屿边界
    mapGfx.lineStyle(2, 0x888888, 0.5)
    mapGfx.strokeRect(offsetX, offsetY, mapW, mapH)

    // POI 标记
    this.poiList.forEach(poi => {
      if (gsm.data.discoveredPois.includes(poi.id)) {
        const px = offsetX + poi.x * scale
        const py = offsetY + poi.y * scale
        mapGfx.fillStyle(0xffdd44)
        mapGfx.fillCircle(px, py, 4)
      }
    })

    // 玩家位置（动态）
    this.playerDot = this.scene.add.circle(0, 0, 4, 0x44ff44)
    this.playerDot.setDepth(202)

    // 标题
    const title = this.scene.add.text(0, -mapH / 2 - 10, '地图', {
      fontSize: '20px', color: '#d4a373', fontStyle: 'bold',
    })
    title.setOrigin(0.5)

    this.container = this.scene.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, [bg, mapGfx, title])
    this.container.setScrollFactor(0)
    this.container.setDepth(300)
    this.container.setVisible(false)
  }

  private setupInput(): void {
    this.scene.input.keyboard!.on('keydown-M', () => {
      this.toggle()
    })
  }

  toggle(): void {
    this.isOpen = !this.isOpen
    this.container.setVisible(this.isOpen)
  }

  update(playerX: number, playerY: number): void {
    if (!this.isOpen) return

    const scaleX = GAME_CONFIG.width / this.islandWidth
    const scaleY = GAME_CONFIG.height / this.islandHeight
    const scale = Math.min(scaleX, scaleY) * 0.8
    const mapW = this.islandWidth * scale

    // 更新玩家位置
    this.playerDot.setPosition(
      GAME_CONFIG.width / 2 - mapW / 2 + playerX * scale,
      GAME_CONFIG.height / 2 - (this.islandHeight * scale) / 2 + playerY * scale,
    )
    this.playerDot.setDepth(301)
    this.playerDot.setScrollFactor(0)
  }

  isMapOpen(): boolean {
    return this.isOpen
  }

  destroy(): void {
    this.container.destroy()
    this.playerDot.destroy()
  }
}
