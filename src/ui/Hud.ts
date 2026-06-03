import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class Hud {
  private scene: Phaser.Scene
  private hpBar!: Phaser.GameObjects.Graphics
  private staminaBar!: Phaser.GameObjects.Graphics
  private hungerBar!: Phaser.GameObjects.Graphics
  private hpText!: Phaser.GameObjects.Text
  private staminaText!: Phaser.GameObjects.Text
  private hungerText!: Phaser.GameObjects.Text
  private collectMessage!: Phaser.GameObjects.Text
  private collectBg!: Phaser.GameObjects.Rectangle

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createBars()
    this.createCollectMessage()
  }

  private createBars(): void {
    const barWidth = 150
    const barHeight = 16
    const spacing = 24
    const startX = 10
    const startY = 10
    
    // HP条
    this.hpBar = this.scene.add.graphics()
    this.hpBar.setScrollFactor(0)
    this.hpBar.setDepth(100)
    
    this.hpText = this.scene.add.text(startX + 4, startY + 2, 'HP: 100/100', { 
      fontSize: '12px', 
      color: '#ffffff' 
    })
    this.hpText.setScrollFactor(0)
    this.hpText.setDepth(101)
    
    // Stamina条
    this.staminaBar = this.scene.add.graphics()
    this.staminaBar.setPosition(0, spacing)
    this.staminaBar.setScrollFactor(0)
    this.staminaBar.setDepth(100)
    
    this.staminaText = this.scene.add.text(startX + 4, startY + spacing + 2, '体力: 100/100', { 
      fontSize: '12px', 
      color: '#ffffff' 
    })
    this.staminaText.setScrollFactor(0)
    this.staminaText.setDepth(101)
    
    // Hunger条
    this.hungerBar = this.scene.add.graphics()
    this.hungerBar.setPosition(0, spacing * 2)
    this.hungerBar.setScrollFactor(0)
    this.hungerBar.setDepth(100)
    
    this.hungerText = this.scene.add.text(startX + 4, startY + spacing * 2 + 2, '饥饿: 100/100', { 
      fontSize: '12px', 
      color: '#ffffff' 
    })
    this.hungerText.setScrollFactor(0)
    this.hungerText.setDepth(101)
    
    // 绘制初始状态
    this.updateStats(GAME_CONFIG.player.hpMax, GAME_CONFIG.player.staminaMax, GAME_CONFIG.player.hungerMax)
  }

  private createCollectMessage(): void {
    // 消息背景
    this.collectBg = this.scene.add.rectangle(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 80,
      200, 40,
      0x1a1a2e, 0.8
    )
    this.collectBg.setStrokeStyle(2, 0xd4a373)
    this.collectBg.setScrollFactor(0)
    this.collectBg.setDepth(101)
    this.collectBg.setAlpha(0)
    
    this.collectMessage = this.scene.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 80,
      '',
      { fontSize: '18px', color: '#d4a373', fontStyle: 'bold' }
    )
    this.collectMessage.setOrigin(0.5)
    this.collectMessage.setScrollFactor(0)
    this.collectMessage.setDepth(102)
    this.collectMessage.setAlpha(0)
  }

  updateStats(hp: number, stamina: number, hunger: number): void {
    const barWidth = 150
    const barHeight = 16
    const startX = 10
    const startY = 10
    const spacing = 24
    
    // HP
    this.hpBar.clear()
    this.hpBar.fillStyle(0xff4444)
    this.hpBar.fillRect(startX, startY, barWidth * (hp / GAME_CONFIG.player.hpMax), barHeight)
    this.hpBar.lineStyle(2, 0xffffff)
    this.hpBar.strokeRect(startX, startY, barWidth, barHeight)
    this.hpText.setText(`HP: ${Math.floor(hp)}/${GAME_CONFIG.player.hpMax}`)
    
    // Stamina
    this.staminaBar.clear()
    this.staminaBar.fillStyle(0x44ff44)
    this.staminaBar.fillRect(startX, startY + spacing, barWidth * (stamina / GAME_CONFIG.player.staminaMax), barHeight)
    this.staminaBar.lineStyle(2, 0xffffff)
    this.staminaBar.strokeRect(startX, startY + spacing, barWidth, barHeight)
    this.staminaText.setText(`体力: ${Math.floor(stamina)}/${GAME_CONFIG.player.staminaMax}`)
    
    // Hunger
    this.hungerBar.clear()
    this.hungerBar.fillStyle(0xffaa44)
    this.hungerBar.fillRect(startX, startY + spacing * 2, barWidth * (hunger / GAME_CONFIG.player.hungerMax), barHeight)
    this.hungerBar.lineStyle(2, 0xffffff)
    this.hungerBar.strokeRect(startX, startY + spacing * 2, barWidth, barHeight)
    this.hungerText.setText(`饥饿: ${Math.floor(hunger)}/${GAME_CONFIG.player.hungerMax}`)
  }

  showCollectMessage(item: string, count: number): void {
    const itemNames: { [key: string]: string } = {
      wood: '木材',
      fiber: '纤维',
      stone: '石材'
    }
    
    this.collectMessage.setText(`+${count} ${itemNames[item] || item}`)
    this.collectMessage.setAlpha(1)
    this.collectBg.setAlpha(1)
    this.collectMessage.setY(GAME_CONFIG.height - 80)
    this.collectBg.setY(GAME_CONFIG.height - 80)
    
    // 清除之前的tween
    this.scene.tweens.killTweensOf(this.collectMessage)
    this.scene.tweens.killTweensOf(this.collectBg)
    
    this.scene.tweens.add({
      targets: [this.collectMessage, this.collectBg],
      y: '-=30',
      alpha: 0,
      duration: 1500,
      ease: 'Power2'
    })
  }
}
