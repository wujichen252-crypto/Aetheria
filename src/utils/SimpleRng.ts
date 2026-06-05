/**
 * 简单线性同余随机数生成器（可复现）
 * 用于程序化生成（岛屿、地图等）
 */
export class SimpleRng {
  private seed: number

  constructor(seed: number) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }

  /** 获取 0-1 之间的随机数 */
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }

  /** 获取范围内的随机整数 [min, max] */
  between(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }

  /** 从数组中随机选择一个元素 */
  pick<T>(array: T[]): T {
    return array[this.between(0, array.length - 1)]
  }

  /** 按概率返回 true/false */
  chance(probability: number): boolean {
    return this.next() < probability
  }

  /** 获取当前种子（用于调试） */
  getSeed(): number {
    return this.seed
  }

  /** 重置为指定种子 */
  reset(seed: number): void {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }
}
