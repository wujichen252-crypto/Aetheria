import Phaser from 'phaser'

// ---------------------------------------------------------------
// Aetheria (浮岛纪元) — 统一 UI 样式常量
// 所有 UI 组件通过此文件保证视觉一致性
// ---------------------------------------------------------------

export const UI = {
  // 颜色
  color: {
    bgDark: 0x1a1a2e,
    bgPanel: 0x16213e,
    bgInput: 0x0f3460,
    gold: 0xd4a373,
    goldLight: 0xe8c39e,
    white: '#e0e0e0',
    whiteHex: 0xe0e0e0,
    gray: '#888888',
    grayHex: 0x888888,
    red: 0xff4444,
    green: 0x44ff44,
    orange: 0xffaa44,
    blue: 0x6688ff,
    purple: 0x8866cc,
  },

  // 字体
  font: {
    body: { fontSize: '14px', color: '#e0e0e0' },
    bodyBold: { fontSize: '14px', color: '#e0e0e0', fontStyle: 'bold' },
    title: { fontSize: '20px', color: '#d4a373', fontStyle: 'bold' },
    subtitle: { fontSize: '16px', color: '#d4a373', fontStyle: 'bold' },
    small: { fontSize: '12px', color: '#888888' },
    gold: { fontSize: '18px', color: '#d4a373', fontStyle: 'bold' },
    hint: { fontSize: '14px', color: '#888888' },
    label: { fontSize: '13px', color: '#d4a373' },
  },

  // 面板
  panel: {
    bg: 0x16213e,
    border: 0xd4a373,
    alpha: 0.95,
    padding: 16,
    radius: 6,
  },

  // 按钮
  button: {
    bg: 0x0f3460,
    hover: 0x1a5276,
    disabled: 0x333333,
    text: '#d4a373',
    textDisabled: '#555555',
    border: 0xd4a373,
  },

  // 布局
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },

  // 长宽
  barHeight: 16,
  barWidth: 150,
} as const

// ---------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------

/** 创建标准背景面板 */
export function createPanel(
  scene: Phaser.Scene,
  x: number, y: number,
  w: number, h: number,
  style?: { bg?: number; border?: number; alpha?: number },
): Phaser.GameObjects.Rectangle {
  const bg = scene.add.rectangle(x, y, w, h, style?.bg ?? UI.panel.bg, style?.alpha ?? UI.panel.alpha)
  bg.setStrokeStyle(2, style?.border ?? UI.panel.border)
  bg.setScrollFactor(0)
  bg.setDepth(300)
  return bg
}

/** 创建标准文字 */
export function createText(
  scene: Phaser.Scene,
  x: number, y: number,
  text: string,
  style?: Partial<Phaser.Types.GameObjects.Text.TextStyle>,
  origin?: { x: number; y: number },
): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, text, { ...UI.font.body, ...style })
  if (origin) t.setOrigin(origin.x, origin.y)
  t.setScrollFactor(0)
  t.setDepth(301)
  return t
}

/** 创建关闭按钮 (X) */
export function createCloseButton(
  scene: Phaser.Scene,
  x: number, y: number,
  onClick: () => void,
): Phaser.GameObjects.Text {
  const btn = scene.add.text(x, y, '✕', {
    fontSize: '22px', color: '#d4a373', fontStyle: 'bold',
  })
  btn.setOrigin(0.5)
  btn.setScrollFactor(0)
  btn.setDepth(302)
  btn.setInteractive({ useHandCursor: true })
  btn.on('pointerover', () => btn.setColor('#e8c39e'))
  btn.on('pointerout', () => btn.setColor('#d4a373'))
  btn.on('pointerdown', onClick)
  return btn
}

/** 返回面板包围盒 (用于计算布局) */
export function panelBounds(cx: number, cy: number, w: number, h: number) {
  return { left: cx - w / 2, right: cx + w / 2, top: cy - h / 2, bottom: cy + h / 2 }
}
