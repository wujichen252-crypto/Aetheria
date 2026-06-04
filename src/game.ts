import Phaser from 'phaser'
import { GAME_CONFIG } from './config'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { LoadingScene } from './scenes/LoadingScene'

export function initGame(): void {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    backgroundColor: '#1a1a2e',
    parent: 'game-container',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, GameScene, LoadingScene],
  }

  new Phaser.Game(config)
}
