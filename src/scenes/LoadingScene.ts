import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' })
  }

  create(data: { toIsland: string }): void {
    const islandId = data?.toIsland || 'starter_forest'

    // 背景
    this.cameras.main.setBackgroundColor(0x1a1a2e)

    // 装饰：浮云动画
    const cloud1 = this.add.text(-100, 150, '☁️', { fontSize: '48px' })
    const cloud2 = this.add.text(-100, 300, '☁️', { fontSize: '32px' })
    const cloud3 = this.add.text(-100, 450, '☁️', { fontSize: '40px' })

    this.tweens.add({
      targets: cloud1,
      x: GAME_CONFIG.width + 100,
      duration: 6000,
      repeat: -1,
    })
    this.tweens.add({
      targets: cloud2,
      x: GAME_CONFIG.width + 100,
      duration: 8000,
      repeat: -1,
    })
    this.tweens.add({
      targets: cloud3,
      x: GAME_CONFIG.width + 100,
      duration: 7000,
      repeat: -1,
    })

    // 航行文字
    const text = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      '航行中...',
      { fontSize: '36px', color: '#d4a373', fontStyle: 'bold' }
    )
    text.setOrigin(0.5)

    // 加载点闪烁
    const dots = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 50,
      '. . .',
      { fontSize: '24px', color: '#888888' }
    )
    dots.setOrigin(0.5)

    this.tweens.add({
      targets: dots,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    })

    // 过渡
    this.time.delayedCall(GAME_CONFIG.airship.travelTime, () => {
      this.scene.start('GameScene', { islandId })
    })
  }
}
