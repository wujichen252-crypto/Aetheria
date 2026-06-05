import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { GameStateManager } from '../systems/GameState'
import { getAllIslandIds, getIslandDefinition } from '../world/IslandData'
import { RecipeSystem } from '../systems/RecipeSystem'

export class ExplorationJournalUI {
  private scene: Phaser.Scene
  private container!: Phaser.GameObjects.Container
  private isOpen: boolean = false
  private contentTexts: Phaser.GameObjects.Text[] = []
  private tabTexts: Phaser.GameObjects.Text[] = []
  private currentTab: 'islands' | 'recipes' | 'lore' = 'islands'

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createUI()
    this.setupInput()
  }

  private createUI(): void {
    const pw = 450
    const ph = 400
    const cx = GAME_CONFIG.width / 2
    const cy = GAME_CONFIG.height / 2

    const bg = this.scene.add.rectangle(0, 0, pw, ph, 0x1a1a2e, 0.95)
    bg.setStrokeStyle(3, 0xd4a373)

    const title = this.scene.add.text(0, -ph / 2 + 25, '探索日志', {
      fontSize: '24px', color: '#d4a373', fontStyle: 'bold',
    })
    title.setOrigin(0.5)

    this.container = this.scene.add.container(cx, cy, [bg, title])
    this.container.setScrollFactor(0)
    this.container.setDepth(200)
    this.container.setVisible(false)

    // 标签
    const tabs: Array<{ key: 'islands' | 'recipes' | 'lore'; label: string }> = [
      { key: 'islands', label: '岛屿' },
      { key: 'recipes', label: '配方' },
      { key: 'lore', label: '故事' },
    ]

    let tx = -80
    tabs.forEach(tab => {
      const tt = this.scene.add.text(tx, -ph / 2 + 55, tab.label, {
        fontSize: '16px',
        color: this.currentTab === tab.key ? '#d4a373' : '#888888',
        fontStyle: this.currentTab === tab.key ? 'bold' : 'normal',
      })
      tt.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.currentTab = tab.key
          this.refresh()
        })
      this.tabTexts.push(tt)
      this.container.add(tt)
      tx += 100
    })
  }

  private setupInput(): void {
    this.scene.input.keyboard!.on('keydown-J', () => {
      this.toggle()
    })
  }

  toggle(): void {
    this.isOpen = !this.isOpen
    this.container.setVisible(this.isOpen)
    if (this.isOpen) this.refresh()
  }

  isOpenNow(): boolean {
    return this.isOpen
  }

  private refresh(): void {
    // 清除旧内容
    this.contentTexts.forEach(t => t.destroy())
    this.contentTexts = []

    // 更新标签高亮
    const tabKeys = ['islands', 'recipes', 'lore']
    this.tabTexts.forEach((tt, i) => {
      const isActive = tabKeys[i] === this.currentTab
      tt.setColor(isActive ? '#d4a373' : '#888888')
      tt.setFontStyle(isActive ? 'bold' : 'normal')
    })

    let y = -110
    const gsm = GameStateManager.getInstance()

    switch (this.currentTab) {
      case 'islands':
        this.renderIslands(gsm, y)
        break
      case 'recipes':
        this.renderRecipes(y)
        break
      case 'lore':
        this.renderLore(y)
        break
    }
  }

  private renderIslands(gsm: GameStateManager, y: number): void {
    getAllIslandIds().forEach(id => {
      const island = getIslandDefinition(id)
      const discovered = gsm.data.discoveredIslands.includes(id)
      const status = discovered ? '✓' : '?'
      const color = discovered ? '#e0e0e0' : '#666666'
      const desc = discovered ? island.description : '???'

      const t = this.scene.add.text(-200, y, `${status} ${island.name}`, {
        fontSize: '16px', color,
      })
      this.container.add(t)
      this.contentTexts.push(t)
      y += 22

      const d = this.scene.add.text(-180, y, desc, {
        fontSize: '12px', color: '#888888',
      })
      this.container.add(d)
      this.contentTexts.push(d)
      y += 28
    })
  }

  private renderRecipes(y: number): void {
    const unlocked = RecipeSystem.getUnlockedRecipes()
    const locked = RecipeSystem.getLockedRecipes()

    if (unlocked.length === 0) {
      const t = this.scene.add.text(-200, y, '尚未发现任何配方', {
        fontSize: '16px', color: '#888888',
      })
      this.container.add(t)
      this.contentTexts.push(t)
      return
    }

    const recLabel = this.scene.add.text(-200, y, '--- 已解锁 ---', {
      fontSize: '14px', color: '#d4a373',
    })
    this.container.add(recLabel)
    this.contentTexts.push(recLabel)
    y += 25

    unlocked.forEach(r => {
      const t = this.scene.add.text(-200, y, `✓ ${r.name}`, {
        fontSize: '14px', color: '#e0e0e0',
      })
      this.container.add(t)
      this.contentTexts.push(t)
      y += 22
    })

    if (locked.length > 0) {
      y += 8
      const lockLabel = this.scene.add.text(-200, y, '--- 未解锁 ---', {
        fontSize: '14px', color: '#666666',
      })
      this.container.add(lockLabel)
      this.contentTexts.push(lockLabel)
      y += 25

      locked.forEach(_r => {
        const t = this.scene.add.text(-200, y, `? ???`, {
          fontSize: '14px', color: '#555555',
        })
        this.container.add(t)
        this.contentTexts.push(t)
        y += 22
      })
    }
  }

  private renderLore(y: number): void {
    const t = this.scene.add.text(-200, y, '尚无发现。探索遗迹寻找世界破碎的真相...', {
      fontSize: '14px', color: '#888888',
    })
    this.container.add(t)
    this.contentTexts.push(t)
  }
}
