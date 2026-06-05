export interface SaveSlot {
  slotIndex: number
  islandName: string
  playTime: number
  hp: number
  stamina: number
  hunger: number
  inventory: Array<[string, number]>
  currentIsland: string
  discoveredIslands: string[]
  discoveredPois: string[]
  unlockedRoutes: string[]
  completedDangerLevels: number[]
  airshipFuel: number
  maxHp: number
  maxStamina: number
  maxHunger: number
  skillPoints: number
  skillLevels: Array<[string, number]>
  timestamp: number
}

const SAVE_KEY_PREFIX = 'aetheria_save_'

export class SaveManager {
  static getSlots(): (SaveSlot | null)[] {
    const slots: (SaveSlot | null)[] = []
    for (let i = 0; i < 3; i++) {
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`)
      if (raw) {
        try {
          slots.push(JSON.parse(raw) as SaveSlot)
        } catch {
          slots.push(null)
        }
      } else {
        slots.push(null)
      }
    }
    return slots
  }

  static saveSlot(
    slotIndex: number,
    data: Omit<SaveSlot, 'slotIndex' | 'timestamp'>,
  ): void {
    const slot: SaveSlot = {
      ...data,
      slotIndex,
      timestamp: Date.now(),
    }
    localStorage.setItem(`${SAVE_KEY_PREFIX}${slotIndex}`, JSON.stringify(slot))
  }

  static loadSlot(slotIndex: number): SaveSlot | null {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotIndex}`)
    if (!raw) return null
    try {
      return JSON.parse(raw) as SaveSlot
    } catch {
      return null
    }
  }

  static deleteSlot(slotIndex: number): void {
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotIndex}`)
  }

  static slotExists(slotIndex: number): boolean {
    return localStorage.getItem(`${SAVE_KEY_PREFIX}${slotIndex}`) !== null
  }
}
