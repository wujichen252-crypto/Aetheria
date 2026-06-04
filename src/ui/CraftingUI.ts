import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { Recipe, RecipeSystem } from '../systems/RecipeSystem'
import { getItemDef } from '../world/ItemDefinitions'

const CATEGORIES = ['all', 'processing', 'fuel', 'tools', 'weapons'] as const
type Category = (typeof CATEGORIES)[number]

const CATEGORY_NAMES: Record<Category, string> = {
  all: '全部',
  processing: '加工',
  fuel: '燃料',
  tools: '工具',
  weapons: '武器',
}

export class CraftingUI {
  private scene: Phaser.Scene
  private container!: Phaser.GameObjects.Container
  private isOpen: boolean = false
  private selectedCategory: Category = 'all'
  private selectedRecipe: Recipe | null = null
  private recipeTexts: Phaser.GameObjects.Text[] = []
  private categoryTexts: Phaser.GameObjects.Text[] = []
  private detailTexts: Phaser.GameObjects.Text[] = []
  private craftBtn!: Phaser.GameObjects.Rectangle
  private craftBtnText!: Phaser.GameObjects.Text
  private inventoryRef: Map<string, number>
  private onInventoryChange: () => void

  constructor(
    scene: Phaser.Scene,
    inventory: Map<string, number>,
    onInventoryChange: () => void
  ) {
    this.scene = scene
    this.inventoryRef = inventory
    this.onInventoryChange = onInventoryChange
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

    const title = this.scene.add.text(0, -ph / 2 + 25, '工作台', {
      fontSize: '24px', color: '#d4a373', fontStyle: 'bold',
    })
    title.setOrigin(0.5)

    this.container = this.scene.add.container(cx, cy, [bg, title])
    this.container.setScrollFactor(0)
    this.container.setDepth(200)
    this.container.setVisible(false)

    // 分类标签
    let catX = -pw / 2 + 20
    for (const cat of CATEGORIES) {
      const ct = this.scene.add.text(catX, -ph / 2 + 55, CATEGORY_NAMES[cat], {
        fontSize: '14px', color: cat === this.selectedCategory ? '#d4a373' : '#888888',
      })
      ct.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { this.selectedCategory = cat; this.refresh() })
      this.categoryTexts.push(ct)
      this.container.add(ct)
      catX += 70
    }

    // Craft按钮
    this.craftBtn = this.scene.add.rectangle(pw / 2 - 90, ph / 2 - 40, 160, 40, 0x4a4a2e)
    this.craftBtn.setStrokeStyle(2, 0xd4a373)
    this.craftBtn.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.doCraft())
    this.container.add(this.craftBtn)

    this.craftBtnText = this.scene.add.text(pw / 2 - 90, ph / 2 - 40, '制作', {
      fontSize: '18px', color: '#d4a373', fontStyle: 'bold',
    })
    this.craftBtnText.setOrigin(0.5)
    this.container.add(this.craftBtnText)

    const escText = this.scene.add.text(0, ph / 2 - 15, '按 ESC 关闭', {
      fontSize: '14px', color: '#666666',
    })
    escText.setOrigin(0.5)
    this.container.add(escText)
  }

  private setupInput(): void {
    this.scene.input.keyboard!.on('keydown-ESC', () => {
      if (this.isOpen) this.close()
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

  isOpenNow(): boolean {
    return this.isOpen
  }

  private refresh(): void {
    this.clearTexts()

    // 获取当前分类的配方
    let recipes: Recipe[]
    if (this.selectedCategory === 'all') {
      recipes = RecipeSystem.getUnlockedRecipes()
    } else {
      recipes = RecipeSystem.getUnlockedRecipes().filter(r => r.category === this.selectedCategory)
    }

    // 高亮分类
    this.categoryTexts.forEach((ct, i) => {
      ct.setColor(CATEGORIES[i] === this.selectedCategory ? '#d4a373' : '#888888')
    })

    // 左侧配方列表
    let ry = -120
    const pw = 500
    recipes.forEach(recipe => {
      const canCraft = RecipeSystem.canCraft(recipe, this.inventoryRef)
      const isSelected = this.selectedRecipe?.id === recipe.id
      const color = isSelected ? '#d4a373' : canCraft ? '#e0e0e0' : '#666666'

      const rt = this.scene.add.text(-pw / 2 + 20, ry, recipe.name, {
        fontSize: '15px', color,
      })
      rt.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.selectedRecipe = recipe
          this.refresh()
        })
      this.container.add(rt)
      this.recipeTexts.push(rt)

      ry += 28
    })

    // 右侧详情
    if (this.selectedRecipe) {
      this.renderDetails(this.selectedRecipe)
    }
  }

  private renderDetails(recipe: Recipe): void {
    const pw = 500
    let dy = -120

    // 配方描述
    const desc = this.scene.add.text(pw / 2 - 180, dy, `┌─ ${recipe.name}`, {
      fontSize: '16px', color: '#d4a373',
    })
    this.container.add(desc)
    this.detailTexts.push(desc)
    dy += 28

    // 所需材料
    const reqLabel = this.scene.add.text(pw / 2 - 180, dy, '所需材料:', {
      fontSize: '14px', color: '#888888',
    })
    this.container.add(reqLabel)
    this.detailTexts.push(reqLabel)
    dy += 22

    let allMet = true
    recipe.inputs.forEach(input => {
      const count = this.inventoryRef.get(input.item) ?? 0
      const met = count >= input.count
      if (!met) allMet = false
      const itemName = getItemDef(input.item).name
      const color = met ? '#44ff44' : '#ff4444'
      const txt = this.scene.add.text(pw / 2 - 170, dy, `${itemName}: ${count}/${input.count}`, {
        fontSize: '13px', color,
      })
      this.container.add(txt)
      this.detailTexts.push(txt)
      dy += 20
    })

    dy += 8

    // 产出
    const outLabel = this.scene.add.text(pw / 2 - 180, dy, '产出:', {
      fontSize: '14px', color: '#888888',
    })
    this.container.add(outLabel)
    this.detailTexts.push(outLabel)
    dy += 22

    recipe.outputs.forEach(output => {
      const itemName = getItemDef(output.item).name
      const txt = this.scene.add.text(pw / 2 - 170, dy, `${itemName} x${output.count}`, {
        fontSize: '13px', color: '#44ff44',
      })
      this.container.add(txt)
      this.detailTexts.push(txt)
      dy += 20
    })

    // Craft按钮状态
    if (allMet) {
      this.craftBtn.setFillStyle(0x3a5a3a)
      this.craftBtnText.setColor('#d4a373')
      this.craftBtn.setInteractive({ useHandCursor: true })
    } else {
      this.craftBtn.setFillStyle(0x3a2a2a)
      this.craftBtnText.setColor('#666666')
      this.craftBtn.removeInteractive()
    }
  }

  private doCraft(): void {
    if (!this.selectedRecipe) return
    const result = RecipeSystem.craft(this.selectedRecipe, this.inventoryRef)
    if (result) {
      // 添加产出到背包
      result.forEach(r => {
        const current = this.inventoryRef.get(r.item) ?? 0
        this.inventoryRef.set(r.item, current + r.count)
      })
      this.onInventoryChange()
      this.refresh()
    }
  }

  private clearTexts(): void {
    this.recipeTexts.forEach(t => t.destroy())
    this.recipeTexts = []
    this.detailTexts.forEach(t => t.destroy())
    this.detailTexts = []
  }
}
