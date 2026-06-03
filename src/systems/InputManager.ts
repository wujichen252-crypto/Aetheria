import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class InputManager {
  private scene: Phaser.Scene
  private keys: { [key: string]: Phaser.Input.Keyboard.Key }
  public isRunning: boolean = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.keys = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      run: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      inventory: Phaser.Input.Keyboard.KeyCodes.TAB
    }) as { [key: string]: Phaser.Input.Keyboard.Key }
  }

  getDirection(): { x: number; y: number } {
    let x = 0
    let y = 0

    if (this.keys.left.isDown) x -= 1
    if (this.keys.right.isDown) x += 1
    if (this.keys.up.isDown) y -= 1
    if (this.keys.down.isDown) y += 1

    return { x, y }
  }

  isMoving(): boolean {
    const dir = this.getDirection()
    return dir.x !== 0 || dir.y !== 0
  }

  getSpeed(): number {
    this.isRunning = this.keys.run.isDown
    return this.isRunning ? GAME_CONFIG.player.runSpeed : GAME_CONFIG.player.speed
  }
}
