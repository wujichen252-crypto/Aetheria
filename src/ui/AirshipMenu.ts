import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { GameStateManager } from '../systems/GameState'
import { getIslandDefinition } from '../world/IslandData'
import { GameScene } from '../scenes/GameScene'
import { getItemName } from '../world/ItemDefinitions'
import { RouteGraph, RouteDefinition } from '../systems/RouteGraph'

export class AirshipMenu {
  private scene: GameScene
  private container!: Phaser.GameObjects.Container
  private isOpen: boolean = false
  private panelWidth: number = 420
  private destinationTexts: Phaser.GameObjects.Text[] = []
  private selectedIsland: string | null = null
  private fuelText!: Phaser.GameObjects.Text
  private titleText!: Phaser.GameObjects.Text
  private routeGraph!: RouteGraph

  constructor(scene: GameScene) {
    this.scene = scene
    this.routeGraph = RouteGraph.getInstance()
    this.createUI()
    this.setupInput()
  }

  private createUI(): void {
    const w = this.panelWidth
    const h = 420
    const cx = GAME_CONFIG.width / 2
    const cy = GAME_CONFIG.height / 2

    const bg = this.scene.add.rectangle(0, 0, w, h, 0x1a1a2e, 0.95)
    bg.setStrokeStyle(3, 0xd4a373)

    this.titleText = this.scene.add.text(0, -h / 2 + 30, '飞艇航行', {
      fontSize: '24px',
      color: '#d4a373',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)

    this.fuelText = this.scene.add.text(0, h / 2 - 30, '', {
      fontSize: '16px',
      color: '#888888',
    })
    this.fuelText.setOrigin(0.5)

    this.container = this.scene.add.container(cx, cy, [bg, this.titleText, this.fuelText])
    this.container.setScrollFactor(0)
    this.container.setDepth(200)
    this.container.setVisible(false)
  }

  private setupInput(): void {
    this.scene.input.keyboard!.on('keydown-ESC', () => {
      if (this.isOpen) this.close()
    })
  }

  open(): void {
    this.isOpen = true
    this.container.setVisible(true)
    this.refreshDestinations()
  }

  close(): void {
    this.isOpen = false
    this.container.setVisible(false)
  }

  private refreshDestinations(): void {
    const gsm = GameStateManager.getInstance()
    const currentIsland = getIslandDefinition(gsm.data.currentIsland)

    // 清除旧目的地文本
    this.destinationTexts.forEach(t => t.destroy())
    this.destinationTexts = []

    // 更新燃料文本
    this.fuelText.setText(`燃料: ${gsm.data.airshipFuel} / ${GAME_CONFIG.airship.fuelMax}`)

    // 标题
    const currentName = currentIsland.name
    this.titleText.setText(`飞艇航行 — 当前: ${currentName}`)

    // 获取当前岛屿的所有航线
    const routes = this.routeGraph.getRoutesFrom(currentIsland.id)
    let y = -130

    // 提示文本
    const hint = this.scene.add.text(-this.panelWidth / 2 + 30, y, '可前往的岛屿:', {
      fontSize: '14px',
      color: '#666666',
    })
    hint.setScrollFactor(0)
    hint.setDepth(201)
    this.container.add(hint)
    this.destinationTexts.push(hint)
    y += 30

    // 列出所有航线
    for (const route of routes) {
      // 确定目标岛屿ID（双向航线）
      const targetId = route.from === gsm.data.currentIsland ? route.to : route.from
      if (!getIslandDefinition(targetId)) continue

      // 检查航线解锁条件
      const isUnlocked = this.routeGraph.isRouteUnlocked(route.id)
      const isHidden = route.hidden && !isUnlocked
      if (isHidden) continue

      const island = getIslandDefinition(targetId)
      const fuelCost = route.fuelCost
      const canTravel = gsm.data.airshipFuel >= fuelCost && isUnlocked
      const color = canTravel ? '#e0e0e0' : (isUnlocked ? '#666666' : '#333333')
      const suffix = gsm.data.discoveredIslands.includes(targetId) ? '' : ' (未探索)'
      const lockSuffix = !isUnlocked ? ' [已锁定]' : ''

      const text = this.scene.add.text(-this.panelWidth / 2 + 30, y, `${island.name}${suffix}${lockSuffix}`, {
        fontSize: '17px',
        color: color,
      })
      text.setScrollFactor(0)
      text.setDepth(201)
      this.container.add(text)
      this.destinationTexts.push(text)

      // 点击交互
      text.setInteractive({ useHandCursor: canTravel })
        .on('pointerover', () => {
          if (canTravel) text.setColor('#d4a373')
        })
        .on('pointerout', () => {
          text.setColor(color)
        })
        .on('pointerdown', () => {
          if (canTravel) {
            this.selectedIsland = targetId
            this.confirmTravel(route)
          }
        })

      // 危险等级指示器
      const dangerIndicator = this.scene.add.text(-this.panelWidth / 2 + 250, y, this.getDangerIcon(island.dangerLevel), {
        fontSize: '16px',
      })
      dangerIndicator.setScrollFactor(0)
      dangerIndicator.setDepth(201)
      this.container.add(dangerIndicator)
      this.destinationTexts.push(dangerIndicator)

      // 燃料消耗信息
      const costText = this.scene.add.text(this.panelWidth / 2 - 80, y, `燃料: ${fuelCost}`, {
        fontSize: '14px',
        color: canTravel ? '#888888' : '#ff4444',
      })
      costText.setScrollFactor(0)
      costText.setDepth(201)
      this.container.add(costText)
      this.destinationTexts.push(costText)

      y += 45
    }

    // 补充燃料
    const biofuelCount = gsm.data.inventory.get('biofuel') ?? 0
    const refuelColor = biofuelCount > 0 && gsm.data.airshipFuel < GAME_CONFIG.airship.fuelMax ? '#88ff88' : '#666666'
    const refuelText = this.scene.add.text(0, y + 10, `[补充燃料] ${getItemName('biofuel')}: ${biofuelCount}`, {
      fontSize: '15px',
      color: refuelColor,
    })
    refuelText.setOrigin(0.5)
    refuelText.setScrollFactor(0)
    refuelText.setDepth(201)
    refuelText.setInteractive({ useHandCursor: biofuelCount > 0 })
      .on('pointerdown', () => {
        if (biofuelCount > 0 && gsm.data.airshipFuel < GAME_CONFIG.airship.fuelMax) {
          gsm.data.inventory.set('biofuel', biofuelCount - 1)
          if (gsm.data.inventory.get('biofuel') === 0) gsm.data.inventory.delete('biofuel')
          gsm.data.airshipFuel = Math.min(GAME_CONFIG.airship.fuelMax, gsm.data.airshipFuel + 50)
          this.refreshDestinations()
        }
      })
    this.container.add(refuelText)
    this.destinationTexts.push(refuelText)

    // ESC 提示
    const escText = this.scene.add.text(0, y + 45, '按 ESC 取消', {
      fontSize: '14px',
      color: '#666666',
    })
    escText.setOrigin(0.5)
    escText.setScrollFactor(0)
    escText.setDepth(201)
    this.container.add(escText)
    this.destinationTexts.push(escText)
  }

  private getDangerIcon(level: number): string {
    switch (level) {
      case 1: return '☆'
      case 2: return '★'
      case 3: return '★★'
      case 4: return '★★★'
      default: return '☆'
    }
  }

  private confirmTravel(route: RouteDefinition): void {
    if (!this.selectedIsland) return

    const gsm = GameStateManager.getInstance()
    gsm.data.airshipFuel -= route.fuelCost
    this.close()
    this.scene.travelToIsland(this.selectedIsland)
  }

  isMenuOpen(): boolean {
    return this.isOpen
  }
}
