import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { IslandDefinition } from '../world/IslandData'
import { getItemName } from '../world/ItemDefinitions'
import { UI } from './UIStyles'

export class Hud {
  private scene: Phaser.Scene
  private hpBar!: Phaser.GameObjects.Graphics
  private staminaBar!: Phaser.GameObjects.Graphics
  private hungerBar!: Phaser.GameObjects.Graphics
  private weightBar!: Phaser.GameObjects.Graphics
  private hpText!: Phaser.GameObjects.Text
  private staminaText!: Phaser.GameObjects.Text
  private hungerText!: Phaser.GameObjects.Text
  private weightText!: Phaser.GameObjects.Text
  private islandNameText!: Phaser.GameObjects.Text
  private collectMessage!: Phaser.GameObjects.Text
  private collectBg!: Phaser.GameObjects.Rectangle
  private weaponText!: Phaser.GameObjects.Text
  private getWeight: () => number = () => 0
  private getWeightMax: () => number = () => 50
  private barWidth = UI.barWidth
  private barHeight = UI.barHeight

  constructor(scene: Phaser.Scene, islandDef?: IslandDefinition) {
    this.scene = scene
    this.createBars()
    this.createCollectMessage()

    if (islandDef) {
      this.createIslandName(islandDef.name)
    }
  }

  setWeightAccessors(getWeight: () => number, getWeightMax: () => number): void {
    this.getWeight = getWeight
    this.getWeightMax = getWeightMax
  }

  private createBars(): void {
    const spacing = 24
    const startX = 10
    const startY = 10

    this.hpBar = this.scene.add.graphics()
    this.hpBar.setScrollFactor(0)
    this.hpBar.setDepth(100)

    this.hpText = this.scene.add.text(startX + 4, startY + 2, 'HP: 100/100', UI.font.small)
    this.hpText.setScrollFactor(0)
    this.hpText.setDepth(101)

    this.staminaBar = this.scene.add.graphics()
    this.staminaBar.setScrollFactor(0)
    this.staminaBar.setDepth(100)

    this.staminaText = this.scene.add.text(startX + 4, startY + spacing + 2, '体力: 100/100', UI.font.small)
    this.staminaText.setScrollFactor(0)
    this.staminaText.setDepth(101)

    this.hungerBar = this.scene.add.graphics()
    this.hungerBar.setScrollFactor(0)
    this.hungerBar.setDepth(100)

    this.hungerText = this.scene.add.text(startX + 4, startY + spacing * 2 + 2, '饥饿: 100/100', UI.font.small)
    this.hungerText.setScrollFactor(0)
    this.hungerText.setDepth(101)

    this.weightBar = this.scene.add.graphics()
    this.weightBar.setScrollFactor(0)
    this.weightBar.setDepth(100)

    this.weightText = this.scene.add.text(startX + 4, startY + spacing * 3 + 2, '负重: 0/50', UI.font.small)
    this.weightText.setScrollFactor(0)
    this.weightText.setDepth(101)

    this.weaponText = this.scene.add.text(startX + 4, startY + spacing * 4 + 4, '武器: 空手', UI.font.label)
    this.weaponText.setScrollFactor(0)
    this.weaponText.setDepth(101)

    this.updateStats(100, 100, 100)
  }

  updateWeapon(name: string): void {
    this.weaponText.setText(`武器: ${name}`)
  }

  private createIslandName(name: string): void {
    this.islandNameText = this.scene.add.text(
      GAME_CONFIG.width / 2, 15, name,
      { fontSize: '16px', color: '#d4a373', fontStyle: 'bold' },
    )
    this.islandNameText.setOrigin(0.5, 0)
    this.islandNameText.setScrollFactor(0)
    this.islandNameText.setDepth(100)
  }

  private createCollectMessage(): void {
    this.collectBg = this.scene.add.rectangle(
      GAME_CONFIG.width / 2, GAME_CONFIG.height - 80,
      200, 40, UI.panel.bg, 0.8,
    )
    this.collectBg.setStrokeStyle(2, UI.panel.border)
    this.collectBg.setScrollFactor(0)
    this.collectBg.setDepth(101)
    this.collectBg.setAlpha(0)

    this.collectMessage = this.scene.add.text(
      GAME_CONFIG.width / 2, GAME_CONFIG.height - 80, '',
      UI.font.gold,
    )
    this.collectMessage.setOrigin(0.5)
    this.collectMessage.setScrollFactor(0)
    this.collectMessage.setDepth(102)
    this.collectMessage.setAlpha(0)
  }

  updateStats(hp: number, stamina: number, hunger: number): void {
    const startX = 10
    const startY = 10
    const spacing = 24

    // HP
    this.hpBar.clear()
    this.hpBar.fillStyle(UI.color.red)
    this.hpBar.fillRect(startX, startY, this.barWidth * (hp / GAME_CONFIG.player.hpMax), this.barHeight)
    this.hpBar.lineStyle(2, UI.color.whiteHex)
    this.hpBar.strokeRect(startX, startY, this.barWidth, this.barHeight)
    this.hpText.setText(`HP: ${Math.floor(hp)}/${GAME_CONFIG.player.hpMax}`)

    // Stamina
    this.staminaBar.clear()
    this.staminaBar.fillStyle(UI.color.green)
    this.staminaBar.fillRect(startX, startY + spacing, this.barWidth * (stamina / GAME_CONFIG.player.staminaMax), this.barHeight)
    this.staminaBar.lineStyle(2, UI.color.whiteHex)
    this.staminaBar.strokeRect(startX, startY + spacing, this.barWidth, this.barHeight)
    this.staminaText.setText(`体力: ${Math.floor(stamina)}/${GAME_CONFIG.player.staminaMax}`)

    // Hunger
    this.hungerBar.clear()
    this.hungerBar.fillStyle(UI.color.orange)
    this.hungerBar.fillRect(startX, startY + spacing * 2, this.barWidth * (hunger / GAME_CONFIG.player.hungerMax), this.barHeight)
    this.hungerBar.lineStyle(2, UI.color.whiteHex)
    this.hungerBar.strokeRect(startX, startY + spacing * 2, this.barWidth, this.barHeight)
    this.hungerText.setText(`饥饿: ${Math.floor(hunger)}/${GAME_CONFIG.player.hungerMax}`)

    // Weight
    const weight = this.getWeight()
    const weightMax = this.getWeightMax()
    const weightRatio = Math.min(1, weight / weightMax)
    this.weightBar.clear()
    this.weightBar.fillStyle(UI.color.blue)
    this.weightBar.fillRect(startX, startY + spacing * 3, this.barWidth * weightRatio, this.barHeight)
    this.weightBar.lineStyle(2, UI.color.whiteHex)
    this.weightBar.strokeRect(startX, startY + spacing * 3, this.barWidth, this.barHeight)
    this.weightText.setText(`负重: ${Math.floor(weight)}/${weightMax}`)
  }

  showCollectMessage(item: string, count: number): void {
    this.collectMessage.setText(`+${count} ${getItemName(item)}`)
    this.collectMessage.setAlpha(1)
    this.collectBg.setAlpha(1)
    this.collectMessage.setY(GAME_CONFIG.height - 80)
    this.collectBg.setY(GAME_CONFIG.height - 80)

    this.scene.tweens.killTweensOf(this.collectMessage)
    this.scene.tweens.killTweensOf(this.collectBg)

    this.scene.tweens.add({
      targets: [this.collectMessage, this.collectBg],
      y: '-=30',
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
    })
  }
}
