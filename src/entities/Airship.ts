import Phaser from 'phaser'

export class Airship extends Phaser.Physics.Arcade.Sprite {
  private promptText!: Phaser.GameObjects.Text
  private promptBg!: Phaser.GameObjects.Rectangle
  private sceneRef: Phaser.Scene
  private beacon!: Phaser.GameObjects.Ellipse

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'airship')
    this.sceneRef = scene

    scene.add.existing(this)
    scene.physics.add.existing(this, true)

    this.setDepth(3)

    this.createBeacon()
    this.createPrompt()
  }

  private createBeacon(): void {
    // 飞艇下方的发光引导圈
    this.beacon = this.sceneRef.add.ellipse(this.x, this.y + 20, 60, 16, 0xd4a373, 0.2)
    this.beacon.setDepth(1)

    // 脉冲动画
    this.sceneRef.tweens.add({
      targets: this.beacon,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1200,
      repeat: -1,
      yoyo: false,
    })

    // 飞艇自身浮动
    this.sceneRef.tweens.add({
      targets: this,
      y: this.y - 4,
      duration: 1500,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut',
    })
  }

  private createPrompt(): void {
    this.promptBg = this.sceneRef.add.rectangle(
      this.x,
      this.y - 40,
      200, 28,
      0x1a1a2e, 0.9
    )
    this.promptBg.setStrokeStyle(1, 0xd4a373)
    this.promptBg.setDepth(60)
    this.promptBg.setVisible(false)

    this.promptText = this.sceneRef.add.text(
      this.x,
      this.y - 40,
      '[E / 左键] 前往其他岛屿',
      { fontSize: '13px', color: '#d4a373', fontStyle: 'bold' }
    )
    this.promptText.setOrigin(0.5)
    this.promptText.setDepth(61)
    this.promptText.setVisible(false)
  }

  showPrompt(): void {
    this.promptBg.setPosition(this.x, this.y - 44)
    this.promptText.setPosition(this.x, this.y - 44)
    this.promptBg.setVisible(true)
    this.promptText.setVisible(true)
  }

  hidePrompt(): void {
    this.promptBg.setVisible(false)
    this.promptText.setVisible(false)
  }
}
