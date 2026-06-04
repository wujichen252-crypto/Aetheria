export enum ItemCategory {
  BASIC = 'basic',
  PROCESSED = 'processed',
  RARE = 'rare',
  LEGENDARY = 'legendary',
  TOOL = 'tool',
  WEAPON = 'weapon',
  CONSUMABLE = 'consumable',
}

export interface ItemDefinition {
  id: string
  name: string
  category: ItemCategory
  weight: number
  description: string
  stackable: boolean
  maxStack: number
  edible?: { hungerRestore: number; hpRestore?: number }
  fuelValue?: number
}

export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
  // ---- 基础材料 ----
  wood: {
    id: 'wood', name: '木材', category: ItemCategory.BASIC,
    weight: 2, description: '从树木采集的木材', stackable: true, maxStack: 99,
    fuelValue: 5,
  },
  fiber: {
    id: 'fiber', name: '纤维', category: ItemCategory.BASIC,
    weight: 1, description: '柔软的植物纤维', stackable: true, maxStack: 99,
  },
  stone: {
    id: 'stone', name: '石材', category: ItemCategory.BASIC,
    weight: 3, description: '普通的石头', stackable: true, maxStack: 99,
  },
  berry: {
    id: 'berry', name: '浆果', category: ItemCategory.BASIC,
    weight: 0.5, description: '酸甜的野生浆果', stackable: true, maxStack: 99,
    edible: { hungerRestore: 15 },
  },
  iron_ore: {
    id: 'iron_ore', name: '铁矿', category: ItemCategory.BASIC,
    weight: 4, description: '富含铁元素的矿石', stackable: true, maxStack: 99,
  },

  // ---- 加工材料 ----
  plank: {
    id: 'plank', name: '木板', category: ItemCategory.PROCESSED,
    weight: 2, description: '加工过的木板，用途广泛', stackable: true, maxStack: 99,
    fuelValue: 8,
  },
  ingot: {
    id: 'ingot', name: '铁锭', category: ItemCategory.PROCESSED,
    weight: 3, description: '冶炼过的铁锭', stackable: true, maxStack: 99,
  },
  cloth: {
    id: 'cloth', name: '布匹', category: ItemCategory.PROCESSED,
    weight: 1, description: '编织而成的布料', stackable: true, maxStack: 99,
  },
  biofuel: {
    id: 'biofuel', name: '生物燃料', category: ItemCategory.PROCESSED,
    weight: 1, description: '精炼的生物质燃料', stackable: true, maxStack: 99,
    fuelValue: 50,
  },

  // ---- 稀有物品 ----
  translator_fragment: {
    id: 'translator_fragment', name: '翻译器碎片', category: ItemCategory.RARE,
    weight: 0, description: '古代翻译器的碎片，凑齐后可解读符文', stackable: true, maxStack: 5,
  },
  ancient_core: {
    id: 'ancient_core', name: '远古核心', category: ItemCategory.RARE,
    weight: 1, description: '遗迹守卫的核心，蕴藏古老能量', stackable: true, maxStack: 5,
  },

  // ---- 工具 ----
  climbing_hook: {
    id: 'climbing_hook', name: '攀爬钩', category: ItemCategory.TOOL,
    weight: 3, description: '可以登上垂直峭壁', stackable: false, maxStack: 1,
  },

  // ---- 武器 ----
  dagger: {
    id: 'dagger', name: '短刀', category: ItemCategory.WEAPON,
    weight: 2, description: '快速但范围小的近战武器', stackable: false, maxStack: 1,
  },
  spear: {
    id: 'spear', name: '长矛', category: ItemCategory.WEAPON,
    weight: 3, description: '中距离突刺武器', stackable: false, maxStack: 1,
  },
  slingshot: {
    id: 'slingshot', name: '弹弓', category: ItemCategory.WEAPON,
    weight: 1, description: '远程射击，消耗石子', stackable: false, maxStack: 1,
  },
}

export function getItemDef(id: string): ItemDefinition {
  const def = ITEM_DEFINITIONS[id]
  if (!def) throw new Error(`Unknown item: ${id}`)
  return def
}

export function getItemName(id: string): string {
  return ITEM_DEFINITIONS[id]?.name ?? id
}

export function getItemWeight(id: string): number {
  return ITEM_DEFINITIONS[id]?.weight ?? 1
}
