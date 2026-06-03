import Phaser from 'phaser'
import { GAME_CONFIG } from './config'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'

export function initGame(): void {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    backgroundColor: GAME_CONFIG.colors.sky,
    parent: 'game-container',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [BootScene, GameScene]
  }

  new Phaser.Game(config)
}
