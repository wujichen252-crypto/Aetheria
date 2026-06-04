export enum SkillBranch {
  EXPLORER = 'explorer',
  ARTISAN = 'artisan',
  SCHOLAR = 'scholar',
}

export interface SkillNode {
  id: string
  branch: SkillBranch
  name: string
  description: string
  maxLevel: number
  costPerLevel: number
  prerequisites: string[]
  effects: Array<{ type: string; value: number }>
}

const SKILL_DEFS: SkillNode[] = [
  // === 探险家 ===
  {
    id: 'explorer_light_step', branch: SkillBranch.EXPLORER,
    name: '轻量步伐', description: '负重对移速的影响减少 10%/级',
    maxLevel: 3, costPerLevel: 1, prerequisites: [],
    effects: [{ type: 'weight_reduction', value: 0.1 }],
  },
  {
    id: 'explorer_sprint', branch: SkillBranch.EXPLORER,
    name: '奔跑训练', description: '冲刺体力消耗减少 15%/级',
    maxLevel: 3, costPerLevel: 1, prerequisites: ['explorer_light_step'],
    effects: [{ type: 'stamina_cost_reduction', value: 0.15 }],
  },
  {
    id: 'explorer_glide', branch: SkillBranch.EXPLORER,
    name: '滑翔翼', description: '解锁滑翔能力',
    maxLevel: 1, costPerLevel: 3, prerequisites: ['explorer_sprint'],
    effects: [{ type: 'unlock_glide', value: 1 }],
  },
  {
    id: 'explorer_scout', branch: SkillBranch.EXPLORER,
    name: '斥候视野', description: '地图揭示范围扩大 50%/级',
    maxLevel: 2, costPerLevel: 1, prerequisites: ['explorer_light_step'],
    effects: [{ type: 'reveal_radius_bonus', value: 1 }],
  },

  // === 工匠 ===
  {
    id: 'artisan_gathering', branch: SkillBranch.ARTISAN,
    name: '高效采集', description: '采集时额外获得 1 个/级',
    maxLevel: 3, costPerLevel: 1, prerequisites: [],
    effects: [{ type: 'bonus_yield', value: 1 }],
  },
  {
    id: 'artisan_fuel', branch: SkillBranch.ARTISAN,
    name: '燃料专家', description: '燃料制作产量翻倍',
    maxLevel: 1, costPerLevel: 2, prerequisites: ['artisan_gathering'],
    effects: [{ type: 'fuel_multiplier', value: 2 }],
  },
  {
    id: 'artisan_repair', branch: SkillBranch.ARTISAN,
    name: '工具保养', description: '工具耐久消耗减半（预留）',
    maxLevel: 1, costPerLevel: 2, prerequisites: ['artisan_gathering'],
    effects: [{ type: 'tool_durability', value: 0.5 }],
  },
  {
    id: 'artisan_master', branch: SkillBranch.ARTISAN,
    name: '锻造大师', description: '解锁高级武器配方',
    maxLevel: 1, costPerLevel: 3, prerequisites: ['artisan_fuel', 'artisan_repair'],
    effects: [{ type: 'unlock_advanced_recipes', value: 1 }],
  },

  // === 学者 ===
  {
    id: 'scholar_mapping', branch: SkillBranch.SCHOLAR,
    name: '测绘员', description: '地图探索范围扩大 +1 格/级',
    maxLevel: 3, costPerLevel: 1, prerequisites: [],
    effects: [{ type: 'reveal_radius', value: 1 }],
  },
  {
    id: 'scholar_language', branch: SkillBranch.SCHOLAR,
    name: '古代语言', description: '能够解读废墟符文',
    maxLevel: 1, costPerLevel: 3, prerequisites: ['scholar_mapping'],
    effects: [{ type: 'unlock_translate', value: 1 }],
  },
  {
    id: 'scholar_resistance', branch: SkillBranch.SCHOLAR,
    name: '元素抗性', description: '风暴/虚空伤害减少 25%/级',
    maxLevel: 2, costPerLevel: 1, prerequisites: ['scholar_mapping'],
    effects: [{ type: 'element_resistance', value: 0.25 }],
  },
]

export class SkillTreeSystem {
  private skills: Map<string, number> = new Map() // skillId -> currentLevel
  private skillPoints: number = 0

  constructor() {
    // 初始化所有技能为等级0
    SKILL_DEFS.forEach(s => this.skills.set(s.id, 0))
  }

  addSkillPoint(): void {
    this.skillPoints++
  }

  getSkillPoints(): number {
    return this.skillPoints
  }

  spendSkillPoints(amount: number): boolean {
    if (this.skillPoints < amount) return false
    this.skillPoints -= amount
    return true
  }

  getAllSkills(): SkillNode[] {
    return SKILL_DEFS
  }

  getSkillsByBranch(branch: SkillBranch): SkillNode[] {
    return SKILL_DEFS.filter(s => s.branch === branch)
  }

  getSkillLevel(skillId: string): number {
    return this.skills.get(skillId) ?? 0
  }

  canUpgrade(skillId: string): boolean {
    // 已读满？
    const skill = SKILL_DEFS.find(s => s.id === skillId)
    if (!skill) return false

    const currentLevel = this.skills.get(skillId) ?? 0
    if (currentLevel >= skill.maxLevel) return false

    // 前置技能满足？
    for (const preId of skill.prerequisites) {
      const pre = SKILL_DEFS.find(s => s.id === preId)
      if (!pre) return false
      const preLevel = this.skills.get(preId) ?? 0
      // 前置需要满级
      if (preLevel < pre.maxLevel) return false
    }

    // 技能点够？
    return this.skillPoints >= skill.costPerLevel
  }

  upgrade(skillId: string): boolean {
    if (!this.canUpgrade(skillId)) return false
    const skill = SKILL_DEFS.find(s => s.id === skillId)!
    if (!this.spendSkillPoints(skill.costPerLevel)) return false
    const current = this.skills.get(skillId) ?? 0
    this.skills.set(skillId, current + 1)
    return true
  }

  getSkillEffect(skillId: string, effectType: string): number {
    const skill = SKILL_DEFS.find(s => s.id === skillId)
    if (!skill) return 0
    const level = this.skills.get(skillId) ?? 0
    const effect = skill.effects.find(e => e.type === effectType)
    if (!effect) return 0
    return effect.value * level
  }

  getSkillByName(name: string): SkillNode | undefined {
    return SKILL_DEFS.find(s => s.name === name)
  }

  static getBranchColor(branch: SkillBranch): string {
    switch (branch) {
      case SkillBranch.EXPLORER: return '#44dd44'
      case SkillBranch.ARTISAN: return '#dd8844'
      case SkillBranch.SCHOLAR: return '#4488dd'
    }
  }

  saveState(): { skills: Array<[string, number]>; points: number } {
    return {
      skills: Array.from(this.skills.entries()),
      points: this.skillPoints,
    }
  }

  loadState(data: { skills: Array<[string, number]>; points: number }): void {
    if (!data) return
    this.skills = new Map(data.skills)
    this.skillPoints = data.points
  }

  reset(): void {
    this.skills.clear()
    SKILL_DEFS.forEach(s => this.skills.set(s.id, 0))
    this.skillPoints = 0
  }
}
