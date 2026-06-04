import Phaser from 'phaser'

export interface TradeOffer {
  id: string
  name: string
  description: string
  requires: Array<{ item: string; count: number }>
  gives: Array<{ item: string; count: number }>
  oneTime?: boolean
}

export class Merchant extends Phaser.Physics.Arcade.Sprite {
  public tradeOffers: TradeOffer[]
  public nameLabel: string

  constructor(scene: Phaser.Scene, x: number, y: number, offers: TradeOffer[]) {
    super(scene, x, y, 'merchant')
    this.tradeOffers = offers
    this.nameLabel = '流浪商人'

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setImmovable(true)
    this.setDepth(3)
    ;(this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)

    // 浮动动画
    scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  /** 该交易是否已被买断（一次性交易） */
  isOfferUsed(offerId: string, usedOffers: string[]): boolean {
    const offer = this.tradeOffers.find(o => o.id === offerId)
    return !!offer?.oneTime && usedOffers.includes(offerId)
  }
}
