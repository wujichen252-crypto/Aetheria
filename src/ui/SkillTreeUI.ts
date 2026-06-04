import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { SkillTreeSystem, SkillBranch } from '../systems/SkillTreeSystem'

const BRANCH_ORDER = [SkillBranch.EXPLORER, SkillBranch.ARTISAN, SkillBranch.SCHOLAR]
const BRANCH_NAMES: Record<SkillBranch, string> = {
  [SkillBranch.EXPLORER]: '探险家',
  [SkillBranch.ARTISAN]: '工匠',
  [SkillBranch.SCHOLAR]: '学者',
}

export class SkillTreeUI {
  private scene: Phaser.Scene
  private container!: Phaser.GameObjects.Container
  private isOpen: boolean = false
  private skillTree: SkillTreeSystem
  private currentBranch: SkillBranch = SkillBranch.EXPLORER
  private contentTexts: Phaser.GameObjects.Text[] = []
  private branchTexts: Phaser.GameObjects.Text[] = []
  private pointsText!: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, skillTree: SkillTreeSystem) {
    this.scene = scene
    this.skillTree = skillTree
    this.createUI()
    this.setupInput()
  }

  private createUI(): void {
    const pw = 500
    const ph = 420
    const cx = GAME_CONFIG.width / 2
    const cy = GAME_CONFIG.height / 2

    const bg = this.scene.add.rectangle(0, 0, pw, ph, 0x1a1a2e, 0.95)
    bg.setStrokeStyle(3, 0xd4a373)

    this.pointsText = this.scene.add.text(0, -ph / 2 + 25, '技能点: 0', {
      fontSize: '20px', color: '#d4a373', fontStyle: 'bold',
    })
    this.pointsText.setOrigin(0.5)

    this.container = this.scene.add.container(cx, cy, [bg, this.pointsText])
    this.container.setScrollFactor(0)
    this.container.setDepth(200)
    this.container.setVisible(false)

    // 分支标签
    let bx = -150
    BRANCH_ORDER.forEach(branch => {
      const bt = this.scene.add.text(bx, -ph / 2 + 55, BRANCH_NAMES[branch], {
        fontSize: '18px',
        color: this.currentBranch === branch ? SkillTreeSystem.getBranchColor(branch) : '#888888',
        fontStyle: this.currentBranch === branch ? 'bold' : 'normal',
      })
      bt.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.currentBranch = branch
          this.refresh()
        })
      this.branchTexts.push(bt)
      this.container.add(bt)
      bx += 120
    })
  }

  private setupInput(): void {
    this.scene.input.keyboard!.on('keydown-K', () => {
      this.toggle()
    })
  }

  open(): void {
    this.isOpen = true
    this.container.setVisible(true)
    this.refresh()
  }

  close(): void {
    this.isOpen = false
    this.container.setVisible(false)
  }

  toggle(): void {
    if (this.isOpen) this.close()
    else this.open()
  }

  isOpenNow(): boolean {
    return this.isOpen
  }

  private refresh(): void {
    // 清除旧内容
    this.contentTexts.forEach(t => t.destroy())
    this.contentTexts = []

    this.pointsText.setText(`技能点: ${this.skillTree.getSkillPoints()}`)

    // 高亮分支标签
    BRANCH_ORDER.forEach((branch, i) => {
      if (this.branchTexts[i]) {
        this.branchTexts[i].setColor(
          branch === this.currentBranch ? SkillTreeSystem.getBranchColor(branch) : '#888888'
        )
        this.branchTexts[i].setFontStyle(branch === this.currentBranch ? 'bold' : 'normal')
      }
    })

    const skills = this.skillTree.getSkillsByBranch(this.currentBranch)
    let y = -100

    skills.forEach(skill => {
      const level = this.skillTree.getSkillLevel(skill.id)
      const canUp = this.skillTree.canUpgrade(skill.id)
      const isMaxed = level >= skill.maxLevel
      const color = isMaxed ? '#44ff44' : canUp ? '#e0e0e0' : '#666666'

      // 技能名 + 等级
      const name = this.scene.add.text(-230, y, `${skill.name} [${level}/${skill.maxLevel}]`, {
        fontSize: '16px', color, fontStyle: isMaxed ? 'bold' : 'normal',
      })
      this.container.add(name)
      this.contentTexts.push(name)

      // 描述
      const desc = this.scene.add.text(-220, y + 20, skill.description, {
        fontSize: '12px', color: '#888888',
      })
      this.container.add(desc)
      this.contentTexts.push(desc)

      // 升级按钮
      if (!isMaxed) {
        const btnColor = canUp ? '#3a5a3a' : '#3a2a2a'
        const btn = this.scene.add.text(200, y, canUp ? '[升级]' : '[锁定]', {
          fontSize: '14px', color: canUp ? '#44ff44' : '#666666',
          backgroundColor: btnColor, padding: { x: 8, y: 4 },
        })
        if (canUp) {
          btn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
              this.skillTree.upgrade(skill.id)
              this.refresh()
            })
        }
        this.container.add(btn)
        this.contentTexts.push(btn)
      }

      y += 55
    })
  }
}
