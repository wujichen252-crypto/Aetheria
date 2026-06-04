export enum CreatureType {
  PASSIVE = 'passive',
  NEUTRAL = 'neutral',
  HOSTILE = 'hostile',
}

export interface CreatureDefinition {
  id: string
  name: string
  type: CreatureType
  hp: number
  damage: number
  speed: number
  detectRange: number
  chaseRange: number
  attackRange: number
  attackCooldown: number
  fleeRange: number
  drops: Array<{ item: string; chance: number; count: number }>
  texture: string
}

export const CREATURE_DEFS: Record<string, CreatureDefinition> = {
  forest_rabbit: {
    id: 'forest_rabbit', name: '森林兔', type: CreatureType.PASSIVE,
    hp: 1, damage: 0, speed: 180,
    detectRange: 200, chaseRange: 0, attackRange: 0, attackCooldown: 0, fleeRange: 300,
    drops: [{ item: 'fiber', chance: 0.5, count: 1 }],
    texture: 'creature_rabbit',
  },
  forest_spider: {
    id: 'forest_spider', name: '森林蜘蛛', type: CreatureType.HOSTILE,
    hp: 4, damage: 10, speed: 140,
    detectRange: 180, chaseRange: 400, attackRange: 40, attackCooldown: 1500, fleeRange: 0,
    drops: [{ item: 'fiber', chance: 1.0, count: 2 }],
    texture: 'creature_spider',
  },
  ridge_wolf: {
    id: 'ridge_wolf', name: '岩脊狼', type: CreatureType.HOSTILE,
    hp: 6, damage: 15, speed: 200,
    detectRange: 250, chaseRange: 500, attackRange: 45, attackCooldown: 1200, fleeRange: 0,
    drops: [{ item: 'bone', chance: 0.8, count: 1 }],
    texture: 'creature_wolf',
  },
  ancient_golem: {
    id: 'ancient_golem', name: '远古傀儡', type: CreatureType.HOSTILE,
    hp: 20, damage: 25, speed: 60,
    detectRange: 200, chaseRange: 350, attackRange: 50, attackCooldown: 2500, fleeRange: 0,
    drops: [{ item: 'translator_fragment', chance: 0.3, count: 1 }, { item: 'stone', chance: 1.0, count: 5 }],
    texture: 'creature_golem',
  },
}

export function getCreatureDef(id: string): CreatureDefinition {
  const def = CREATURE_DEFS[id]
  if (!def) throw new Error(`Unknown creature: ${id}`)
  return def
}
