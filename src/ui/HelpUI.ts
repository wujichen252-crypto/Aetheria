import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { UI, createPanel, createText } from './UIStyles'

const CONTROLS = [
  { key: '鼠标左键', action: '攻击 / 点击交互物体' },
  { key: '鼠标右键', action: '闪避翻滚' },
  { key: 'W / A / S / D', action: '移动' },
  { key: 'Shift + 方向', action: '奔跑' },
  { key: 'Space', action: '攻击（备选）' },
  { key: 'Q', action: '切换武器' },
  { key: 'E', action: '交互 / 采集 / 交易' },
  { key: 'Tab', action: '背包' },
  { key: 'M', action: '地图' },
  { key: 'J', action: '探索日志' },
  { key: 'K', action: '技能树' },
  { key: 'H', action: '帮助（当前界面）' },
]

const SKILL_BRANCHES = [
  {
    name: '探险家', color: '#44dd44',
    skills: ['轻量步伐', '奔跑训练', '滑翔翼', '斥候视野'],
  },
  {
    name: '工匠', color: '#dd8844',
    skills: ['高效采集', '燃料专家', '工具保养', '锻造大师'],
  },
  {
    name: '学者', color: '#4488dd',
    skills: ['测绘员', '古代语言', '元素抗性'],
  },
]

export class HelpUI {
  private scene: Phaser.Scene
  private container!: Phaser.GameObjects.Container
  private isOpen: boolean = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createUI()
    this.setupInput()
  }

  private createUI(): void {
    const w = 580, h = 480
    const bg = createPanel(this.scene, 0, 0, w, h)

    const title = createText(this.scene, 0, -h / 2 + 20, '操作指南', UI.font.title, { x: 0.5, y: 0.5 })

    const lines: Phaser.GameObjects.Text[] = [title]

    // ====== 左侧：操作键位 ======
    const leftLabel = this.scene.add.text(-260, -h / 2 + 50, '— 键位操作 —', {
      fontSize: '14px', color: '#d4a373', fontStyle: 'bold',
    })
    leftLabel.setScrollFactor(0)
    leftLabel.setDepth(301)
    lines.push(leftLabel)

    let y = -h / 2 + 75
    CONTROLS.forEach(c => {
      const keyText = this.scene.add.text(-270, y, c.key, {
        fontSize: '13px', color: '#d4a373', fontStyle: 'bold',
      })
      keyText.setScrollFactor(0)
      keyText.setDepth(301)

      const actionText = this.scene.add.text(-80, y, c.action, {
        fontSize: '13px', color: '#e0e0e0',
      })
      actionText.setScrollFactor(0)
      actionText.setDepth(301)

      lines.push(keyText, actionText)
      y += 24
    })

    // ====== 右侧：技能分支 ======
    const rightLabel = this.scene.add.text(30, -h / 2 + 50, '— 技能体系 —', {
      fontSize: '14px', color: '#d4a373', fontStyle: 'bold',
    })
    rightLabel.setScrollFactor(0)
    rightLabel.setDepth(301)
    lines.push(rightLabel)

    let sy = -h / 2 + 75
    SKILL_BRANCHES.forEach(branch => {
      const branchName = this.scene.add.text(30, sy, `${branch.name}系`, {
        fontSize: '13px', color: branch.color, fontStyle: 'bold',
      })
      branchName.setScrollFactor(0)
      branchName.setDepth(301)
      lines.push(branchName)
      sy += 20

      branch.skills.forEach(skill => {
        const skillText = this.scene.add.text(45, sy, `· ${skill}`, {
          fontSize: '12px', color: '#c0c0c0',
        })
        skillText.setScrollFactor(0)
        skillText.setDepth(301)
        lines.push(skillText)
        sy += 18
      })

      sy += 6
    })

    // 补充提示
    const footer = this.scene.add.text(0, h / 2 - 25, '按 K 打开技能树消耗技能点升级 · 按 H 关闭帮助', {
      fontSize: '12px', color: '#888888',
    })
    footer.setOrigin(0.5)
    footer.setScrollFactor(0)
    footer.setDepth(301)
    lines.push(footer)

    this.container = this.scene.add.container(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      [bg, ...lines],
    )
    this.container.setScrollFactor(0)
    this.container.setDepth(400)
    this.container.setVisible(false)
  }

  private setupInput(): void {
    this.scene.input.keyboard!.on('keydown-H', () => {
      this.toggle()
    })
  }

  toggle(): void {
    this.isOpen = !this.isOpen
    this.container.setVisible(this.isOpen)
  }

  isOpenNow(): boolean {
    return this.isOpen
  }

  destroy(): void {
    this.container.destroy()
  }
}
