import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    this.createPlaceholderGraphics()
  }

  create(): void {
    this.scene.start('GameScene')
  }

  private createPlaceholderGraphics(): void {
    // 玩家精灵（28x28 金色方块）
    const playerGraphics = this.make.graphics()
    playerGraphics.fillStyle(GAME_CONFIG.colors.player)
    playerGraphics.fillRect(0, 0, 28, 28)
    playerGraphics.generateTexture('player', 28, 28)
    playerGraphics.destroy()

    // 树木（32x48 绿色方块）
    const treeGraphics = this.make.graphics()
    treeGraphics.fillStyle(GAME_CONFIG.colors.tree)
    treeGraphics.fillRect(0, 0, 32, 48)
    treeGraphics.generateTexture('tree', 32, 48)
    treeGraphics.destroy()

    // 岩石（32x24 灰色方块）
    const rockGraphics = this.make.graphics()
    rockGraphics.fillStyle(GAME_CONFIG.colors.rock)
    rockGraphics.fillRect(0, 0, 32, 24)
    rockGraphics.generateTexture('rock', 32, 24)
    rockGraphics.destroy()

    // 地面瓦片（32x32）
    const tileGraphics = this.make.graphics()
    tileGraphics.fillStyle(GAME_CONFIG.colors.ground)
    tileGraphics.fillRect(0, 0, 32, 32)
    tileGraphics.lineStyle(1, 0x2a2a4a)
    tileGraphics.strokeRect(0, 0, 32, 32)
    tileGraphics.generateTexture('ground', 32, 32)
    tileGraphics.destroy()
  }
}
