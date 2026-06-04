import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { getItemName } from '../world/ItemDefinitions'
import { UI, createPanel, createText } from './UIStyles'

export class InventoryUI {
  private scene: Phaser.Scene
  private container!: Phaser.GameObjects.Container
  private bg!: Phaser.GameObjects.Rectangle
  private title!: Phaser.GameObjects.Text
  private itemTexts: Phaser.GameObjects.Text[] = []
  private inventoryRef: Map<string, number>
  private isOpen: boolean = false

  constructor(scene: Phaser.Scene, inventory: Map<string, number>) {
    this.scene = scene
    this.inventoryRef = inventory

    this.createUI()
    this.setupInput()
  }

  private createUI(): void {
    const w = 300, h = 360

    this.bg = createPanel(this.scene, 0, 0, w, h)

    this.title = createText(this.scene, 0, -h / 2 + 20, '背包', UI.font.title, { x: 0.5, y: 0.5 })

    this.container = this.scene.add.container(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      [this.bg, this.title],
    )
    this.container.setScrollFactor(0)
    this.container.setDepth(200)
    this.container.setVisible(false)
  }

  private setupInput(): void {
    this.scene.input.keyboard!.on('keydown-TAB', (_event: any) => {
      _event.preventDefault()
      this.toggle()
    })
  }

  toggle(): void {
    this.isOpen = !this.isOpen
    this.container.setVisible(this.isOpen)
    if (this.isOpen) {
      this.updateDisplay()
    }
  }

  updateDisplay(): void {
    this.itemTexts.forEach(text => text.destroy())
    this.itemTexts = []

    let y = -120
    let hasItems = false

    this.inventoryRef.forEach((count, item) => {
      hasItems = true
      const text = createText(this.scene, -130, y, `${getItemName(item)}: ${count}`, UI.font.body)
      this.container.add(text)
      this.itemTexts.push(text)
      y += 35
    })

    if (!hasItems) {
      const emptyText = createText(this.scene, 0, 0, '背包为空', { fontSize: '18px', color: '#666666' }, { x: 0.5, y: 0.5 })
      this.container.add(emptyText)
      this.itemTexts.push(emptyText)
    }
  }
}
