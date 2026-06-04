export interface RecipeIngredient {
  item: string
  count: number
}

export interface Recipe {
  id: string
  name: string
  description: string
  inputs: RecipeIngredient[]
  outputs: RecipeIngredient[]
  category: 'processing' | 'fuel' | 'tools' | 'weapons'
  unlockTrigger?: { type: 'item_discovered'; itemId: string }
}

const ALL_RECIPES: Recipe[] = [
  // ---- 加工 ----
  {
    id: 'craft_plank', name: '制作木板', description: '将原木加工成木板',
    inputs: [{ item: 'wood', count: 3 }], outputs: [{ item: 'plank', count: 2 }],
    category: 'processing',
    unlockTrigger: { type: 'item_discovered', itemId: 'wood' },
  },
  {
    id: 'craft_ingot', name: '冶炼铁锭', description: '将铁矿冶炼成铁锭',
    inputs: [{ item: 'iron_ore', count: 3 }, { item: 'wood', count: 2 }],
    outputs: [{ item: 'ingot', count: 1 }],
    category: 'processing',
    unlockTrigger: { type: 'item_discovered', itemId: 'iron_ore' },
  },
  {
    id: 'craft_cloth', name: '纺织布匹', description: '将纤维编织成布',
    inputs: [{ item: 'fiber', count: 5 }], outputs: [{ item: 'cloth', count: 1 }],
    category: 'processing',
    unlockTrigger: { type: 'item_discovered', itemId: 'fiber' },
  },

  // ---- 燃料 ----
  {
    id: 'craft_biofuel', name: '精炼生物燃料', description: '用浆果和纤维精炼燃料',
    inputs: [{ item: 'berry', count: 3 }, { item: 'fiber', count: 2 }],
    outputs: [{ item: 'biofuel', count: 1 }],
    category: 'fuel',
    unlockTrigger: { type: 'item_discovered', itemId: 'berry' },
  },
  {
    id: 'craft_biofuel_wood', name: '木质燃料', description: '用木材制作燃料',
    inputs: [{ item: 'wood', count: 5 }], outputs: [{ item: 'biofuel', count: 1 }],
    category: 'fuel',
    unlockTrigger: { type: 'item_discovered', itemId: 'plank' },
  },

  // ---- 工具 ----
  {
    id: 'craft_climbing_hook', name: '制作攀爬钩', description: '铁锭和纤维制成的攀爬工具',
    inputs: [{ item: 'ingot', count: 2 }, { item: 'fiber', count: 3 }],
    outputs: [{ item: 'climbing_hook', count: 1 }],
    category: 'tools',
    unlockTrigger: { type: 'item_discovered', itemId: 'ingot' },
  },

  // ---- 武器 ----
  {
    id: 'craft_dagger', name: '锻造短刀', description: '铁矿打造的短刃',
    inputs: [{ item: 'iron_ore', count: 4 }, { item: 'wood', count: 2 }],
    outputs: [{ item: 'dagger', count: 1 }],
    category: 'weapons',
    unlockTrigger: { type: 'item_discovered', itemId: 'iron_ore' },
  },
  {
    id: 'craft_spear', name: '制作长矛', description: '木杆和铁尖组成的长矛',
    inputs: [{ item: 'wood', count: 5 }, { item: 'ingot', count: 1 }],
    outputs: [{ item: 'spear', count: 1 }],
    category: 'weapons',
    unlockTrigger: { type: 'item_discovered', itemId: 'ingot' },
  },
  {
    id: 'craft_slingshot', name: '制作弹弓', description: '纤维和木材制作的简易弹弓',
    inputs: [{ item: 'wood', count: 3 }, { item: 'fiber', count: 4 }],
    outputs: [{ item: 'slingshot', count: 1 }],
    category: 'weapons',
    unlockTrigger: { type: 'item_discovered', itemId: 'cloth' },
  },
]

export class RecipeSystem {
  private static discoveredRecipes: Set<string> = new Set()
  private static unlockedRecipes: Set<string> = new Set()

  static initDiscovered(discoveredItems: string[]): void {
    // 基于已发现的物品解锁配方
    ALL_RECIPES.forEach(recipe => {
      if (recipe.unlockTrigger?.type === 'item_discovered') {
        if (discoveredItems.includes(recipe.unlockTrigger.itemId)) {
          this.unlockedRecipes.add(recipe.id)
        }
      }
    })
  }

  static onItemDiscovered(itemId: string): void {
    ALL_RECIPES.forEach(recipe => {
      if (recipe.unlockTrigger?.type === 'item_discovered' && recipe.unlockTrigger.itemId === itemId) {
        this.unlockedRecipes.add(recipe.id)
      }
    })
  }

  static getAllRecipes(): Recipe[] {
    return ALL_RECIPES
  }

  static getAvailableRecipes(inventory: Map<string, number>): Recipe[] {
    return ALL_RECIPES.filter(r => {
      if (!this.unlockedRecipes.has(r.id)) return false
      return this.canCraft(r, inventory)
    })
  }

  static getUnlockedRecipes(): Recipe[] {
    return ALL_RECIPES.filter(r => this.unlockedRecipes.has(r.id))
  }

  static getLockedRecipes(): Recipe[] {
    return ALL_RECIPES.filter(r => !this.unlockedRecipes.has(r.id))
  }

  static canCraft(recipe: Recipe, inventory: Map<string, number>): boolean {
    return recipe.inputs.every(input => (inventory.get(input.item) ?? 0) >= input.count)
  }

  static craft(recipe: Recipe, inventory: Map<string, number>): Array<{ item: string; count: number }> | null {
    // 检查材料
    if (!this.canCraft(recipe, inventory)) return null

    // 扣除材料
    for (const input of recipe.inputs) {
      const current = inventory.get(input.item) ?? 0
      const remaining = current - input.count
      if (remaining <= 0) {
        inventory.delete(input.item)
      } else {
        inventory.set(input.item, remaining)
      }
    }

    // 产出物品（合并相同物品）
    const result: Array<{ item: string; count: number }> = []
    for (const output of recipe.outputs) {
      const existing = result.find(r => r.item === output.item)
      if (existing) {
        existing.count += output.count
      } else {
        result.push({ item: output.item, count: output.count })
      }
    }

    // 标记配方为已发现
    this.discoveredRecipes.add(recipe.id)

    return result
  }

  static isRecipeUnlocked(recipeId: string): boolean {
    return this.unlockedRecipes.has(recipeId)
  }

  static getUnlockedRecipeIds(): string[] {
    return Array.from(this.unlockedRecipes)
  }

  static getDiscoveredRecipeIds(): string[] {
    return Array.from(this.discoveredRecipes)
  }

  static reset(): void {
    this.discoveredRecipes.clear()
    this.unlockedRecipes.clear()
  }
}
