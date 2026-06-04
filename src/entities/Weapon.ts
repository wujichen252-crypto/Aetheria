export enum WeaponType {
  DAGGER = 'dagger',
  SPEAR = 'spear',
  SLINGSHOT = 'slingshot',
}

export interface WeaponDefinition {
  type: WeaponType
  name: string
  damage: number
  range: number
  attackSpeed: number
  staminaCost: number
  knockback: number
  projectileTexture?: string
}

export const WEAPON_DEFS: Record<WeaponType, WeaponDefinition> = {
  [WeaponType.DAGGER]: {
    type: WeaponType.DAGGER, name: '短刀',
    damage: 12, range: 40, attackSpeed: 300, staminaCost: 8, knockback: 50,
  },
  [WeaponType.SPEAR]: {
    type: WeaponType.SPEAR, name: '长矛',
    damage: 18, range: 70, attackSpeed: 600, staminaCost: 12, knockback: 100,
  },
  [WeaponType.SLINGSHOT]: {
    type: WeaponType.SLINGSHOT, name: '弹弓',
    damage: 8, range: 250, attackSpeed: 800, staminaCost: 15, knockback: 30,
    projectileTexture: 'projectile_stone',
  },
}

// 空手
export const UNARMED: WeaponDefinition = {
  type: WeaponType.DAGGER, name: '空手',
  damage: 5, range: 30, attackSpeed: 500, staminaCost: 5, knockback: 30,
}
