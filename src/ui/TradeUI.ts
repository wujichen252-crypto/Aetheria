import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { UI, createPanel, createText } from './UIStyles'
import { getItemName } from '../world/ItemDefinitions'
import type { TradeOffer } from '../entities/Merchant'

export class TradeUI {
  private scene: Phaser.Scene
  private container!: Phaser.GameObjects.Container
  private isOpen: boolean = false
  private offers: TradeOffer[] = []
  private title!: Phaser.GameObjects.Text
  private offerTexts: Phaser.GameObjects.Text[] = []
  private infoText!: Phaser.GameObjects.Text
  private onTrade: (offerId: string) => boolean

  constructor(scene: Phaser.Scene, onTrade: (offerId: string) => boolean) {
    this.scene = scene
    this.onTrade = onTrade
    this.createUI()
  }

  private createUI(): void {
    const w = 440, h = 400
    createPanel(this.scene, 0, 0, w, h)
    this.title = createText(this.scene, 0, -h / 2 + 20, '交易', UI.font.title, { x: 0.5, y: 0.5 })
    this.infoText = createText(this.scene, 0, h / 2 - 20, '', UI.font.hint, { x: 0.5, y: 0.5 })

    this.container = this.scene.add.container(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      [this.title, this.infoText],
    )
    this.container.setScrollFactor(0)
    this.container.setDepth(200)
    this.container.setVisible(false)
  }

  open(offers: TradeOffer[], usedOffers: string[]): void {
    this.offers = offers
    this.isOpen = true
    this.container.setVisible(true)
    this.renderOffers(usedOffers)
  }

  close(): void {
    this.isOpen = false
    this.container.setVisible(false)
  }

  isOpenNow(): boolean { return this.isOpen }

  private renderOffers(usedOffers: string[]): void {
    // 清除旧文字
    this.offerTexts.forEach(t => t.destroy())
    this.offerTexts = []

    const startY = -120
    let y = startY

    this.offers.forEach((offer, idx) => {
      const used = offer.oneTime && usedOffers.includes(offer.id)
      const reqStr = offer.requires.map(r => `${getItemName(r.item)}×${r.count}`).join(' + ')
      const giveStr = offer.gives.map(g => `${getItemName(g.item)}×${g.count}`).join(' + ')
      const label = `${offer.name}: ${reqStr} → ${giveStr}${used ? ' (已售罄)' : ''}`

      const color = used ? '#555555' : '#e0e0e0'
      const text = createText(this.scene, -200, y, label, { fontSize: '13px', color })
      this.container.add(text)
      this.offerTexts.push(text)

      if (!used) {
        // 交易按钮
        const btn = this.scene.add.text(200, y, '[交易]', {
          fontSize: '13px', color: '#d4a373', fontStyle: 'bold',
        })
        btn.setOrigin(0.5)
        btn.setScrollFactor(0)
        btn.setDepth(302)
        btn.setInteractive({ useHandCursor: true })
        const idx_ = idx
        btn.on('pointerdown', () => {
          const success = this.onTrade(this.offers[idx_].id)
          this.infoText.setText(success ? '交易成功！' : '材料不足！')
          this.infoText.setColor(success ? '#44ff44' : '#ff4444')
          this.scene.time.delayedCall(1500, () => {
            if (this.infoText.active) this.infoText.setText('')
          })
        })
        btn.on('pointerover', () => btn.setColor('#e8c39e'))
        btn.on('pointerout', () => btn.setColor('#d4a373'))
        this.container.add(btn)
        this.offerTexts.push(btn)
      }

      y += 40
    })

    if (this.offers.length === 0) {
      const empty = createText(this.scene, 0, 0, '暂无交易', UI.font.body, { x: 0.5, y: 0.5 })
      this.container.add(empty)
      this.offerTexts.push(empty)
    }
  }
}
