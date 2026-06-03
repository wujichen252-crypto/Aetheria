import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

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
    // 背景
    this.bg = this.scene.add.rectangle(
      0, 0,
      300, 350,
      0x1a1a2e, 0.95
    )
    this.bg.setStrokeStyle(3, 0xd4a373)
    
    // 标题
    this.title = this.scene.add.text(0, -150, '背包', {
      fontSize: '24px',
      color: '#d4a373',
      fontStyle: 'bold'
    })
    this.title.setOrigin(0.5)
    
    this.container = this.scene.add.container(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      [this.bg, this.title]
    )
    this.container.setScrollFactor(0)
    this.container.setDepth(200)
    this.container.setVisible(false)
  }

  private setupInput(): void {
    this.scene.input.keyboard.on('keydown-TAB', (event: any) => {
      event.preventDefault()
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
    // 清除旧文本
    this.itemTexts.forEach(text => text.destroy())
    this.itemTexts = []
    
    const itemNames: { [key: string]: string } = {
      wood: '木材',
      fiber: '纤维',
      stone: '石材'
    }
    
    let y = -120
    let hasItems = false
    
    this.inventoryRef.forEach((count, item) => {
      hasItems = true
      const text = this.scene.add.text(-130, y, `${itemNames[item] || item}: ${count}`, {
        fontSize: '18px',
        color: '#ffffff'
      })
      text.setScrollFactor(0)
      text.setDepth(201)
      this.container.add(text)
      this.itemTexts.push(text)
      y += 35
    })
    
    if (!hasItems) {
      const emptyText = this.scene.add.text(0, 0, '背包为空', {
        fontSize: '18px',
        color: '#666666'
      })
      emptyText.setOrigin(0.5)
      emptyText.setScrollFactor(0)
      emptyText.setDepth(201)
      this.container.add(emptyText)
      this.itemTexts.push(emptyText)
    }
  }
}
