import Phaser from 'phaser'

/**
 * Aetheria 音频管理器
 *
 * 当前为结构就绪阶段：所有调用安全无操作。
 * 将实际音频文件放入 assets/audio/ 后在 BootScene 中
 * 通过 this.load.audio(key, path) 加载，取消下方注释即可启用。
 */

export enum SfxKey {
  COLLECT = 'sfx_collect',
  ATTACK = 'sfx_attack',
  HURT = 'sfx_hurt',
  CRAFT = 'sfx_craft',
  UI_CLICK = 'sfx_ui_click',
  UI_CLOSE = 'sfx_ui_close',
  AIRSHIP = 'sfx_airship',
  DODGE = 'sfx_dodge',
  DEATH = 'sfx_death',
}

export enum BgmKey {
  EXPLORE = 'bgm_explore',
  COMBAT = 'bgm_combat',
}

export class AudioManager {
  private scene: Phaser.Scene
  private masterVolume: number = 0.5
  private sfxVolume: number = 0.7
  private bgmVolume: number = 0.3
  private muted: boolean = false
  private currentBgm: Phaser.Sound.BaseSound | null = null
  private currentBgmKey: string | null = null
  private enabled: boolean = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    // 当音频资源加载完成后设置 enabled = true
    // 目前 assets/audio/ 尚无文件，保持禁用
  }

  /** 启用音频（音频资源加载完成后调用） */
  enable(): void {
    this.enabled = true
  }

  playSfx(key: SfxKey, volume?: number): void {
    if (!this.enabled || this.muted) return
    try {
      this.scene.sound.play(key, { volume: (volume ?? 1) * this.sfxVolume * this.masterVolume })
    } catch {
      // 静默失败 —— 音频资源尚未加载
    }
  }

  playBgm(key: BgmKey): void {
    if (!this.enabled || this.muted) return
    if (this.currentBgmKey === key) return

    this.stopBgm()
    try {
      this.currentBgm = this.scene.sound.add(key, { loop: true, volume: this.bgmVolume * this.masterVolume })
      this.currentBgm.play()
      this.currentBgmKey = key
    } catch {
      // 静默失败
    }
  }

  stopBgm(): void {
    if (this.currentBgm) {
      this.currentBgm.stop()
      this.currentBgm.destroy()
      this.currentBgm = null
      this.currentBgmKey = null
    }
  }

  setMasterVolume(v: number): void { this.masterVolume = Phaser.Math.Clamp(v, 0, 1) }
  setSfxVolume(v: number): void { this.sfxVolume = Phaser.Math.Clamp(v, 0, 1) }
  setBgmVolume(v: number): void {
    this.bgmVolume = Phaser.Math.Clamp(v, 0, 1)
    if (this.currentBgm) {
      (this.currentBgm as unknown as { volume: number }).volume = this.bgmVolume * this.masterVolume
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted
    if (this.muted) {
      this.stopBgm()
    }
    return this.muted
  }

  isMuted(): boolean { return this.muted }
  isEnabled(): boolean { return this.enabled }
}
