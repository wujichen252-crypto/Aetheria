import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class InputManager {
  private scene: Phaser.Scene
  private keys: { [key: string]: Phaser.Input.Keyboard.Key }
  public isRunning: boolean = false
  private prevLeftDown: boolean = false
  private prevRightDown: boolean = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    const kb = this.scene.input.keyboard!
    this.keys = kb.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      run: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      inventory: Phaser.Input.Keyboard.KeyCodes.TAB,
      attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
      weaponSwitch: Phaser.Input.Keyboard.KeyCodes.Q,
    }) as { [key: string]: Phaser.Input.Keyboard.Key }

    // 禁用右键菜单
    scene.input.mouse!.disableContextMenu()
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

  /** 攻击：Space 或 鼠标左键 */
  isAttackPressed(): boolean {
    const kbPressed = Phaser.Input.Keyboard.JustDown(this.keys.attack)
    const leftDown = this.scene.input.activePointer.leftButtonDown()
    const mousePressed = leftDown && !this.prevLeftDown
    this.prevLeftDown = leftDown
    return kbPressed || mousePressed
  }

  /** 鼠标左键刚刚按下（未消费），用于交互检测 */
  isLeftClickDown(): boolean {
    const leftDown = this.scene.input.activePointer.leftButtonDown()
    const clicked = leftDown && !this.prevLeftDown
    return clicked
  }

  /** 消费当前左键状态，防止同时触发攻击 */
  consumeLeftClick(): void {
    this.prevLeftDown = this.scene.input.activePointer.leftButtonDown()
  }

  /** 闪避：Shift 或 鼠标右键 */
  isDodgePressed(): boolean {
    const kbPressed = Phaser.Input.Keyboard.JustDown(this.keys.run)

    const rightDown = this.scene.input.activePointer.rightButtonDown()
    const mousePressed = rightDown && !this.prevRightDown
    this.prevRightDown = rightDown

    return kbPressed || mousePressed
  }

  isWeaponSwitchPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.weaponSwitch)
  }

  /** E 键或鼠标左键点击交互 */
  isInteractPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.interact)
  }

  /** 鼠标在世界坐标中的位置 */
  getPointerWorldPos(): { x: number; y: number } {
    const pointer = this.scene.input.activePointer
    return {
      x: pointer.worldX,
      y: pointer.worldY,
    }
  }

  getKey(keyName: string): Phaser.Input.Keyboard.Key {
    return this.keys[keyName]
  }
}
