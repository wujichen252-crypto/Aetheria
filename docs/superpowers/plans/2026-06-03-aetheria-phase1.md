# Aetheria Phase 1 核心原型实现计划

> **目标：** 单场景岛屿原型，验证核心玩法可运行

**架构：** 纯Phaser 3，不引入Vue减少复杂度

**技术栈：** Phaser 3 + TypeScript + Vite

---

## 文件结构

```
aetheria/
├── src/
│   ├── main.ts                 # 入口
│   ├── game.ts                 # 游戏初始化
│   ├── config.ts               # 配置常量
│   ├── scenes/
│   │   ├── BootScene.ts        # 加载场景
│   │   └── GameScene.ts        # 主游戏场景
│   ├── entities/
│   │   ├── Player.ts           # 玩家控制
│   │   ├── Resource.ts         # 可收集资源（树、岩石）
│   │   └── Collectible.ts      # 掉落物品
│   ├── systems/
│   │   ├── InputManager.ts     # 输入管理
│   │   ├── DayNightCycle.ts    # 昼夜循环
│   │   ├── InventorySystem.ts  # 背包系统
│   │   └── InteractionSystem.ts # 交互系统
│   └── ui/
│       ├── Hud.ts              # 顶部状态栏
│       └── InventoryUI.ts      # 背包UI
├── assets/
│   ├── sprites/                # 精灵图（占位色块）
│   └── tiles/                  # 瓦片图
├── tiled/                      # Tiled地图文件
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "aetheria",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.60.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 创建 vite.config.ts**

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000
  }
})
```

- [ ] **Step 4: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>浮岛纪元 Aetheria</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; overflow: hidden; }
    #game-container { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 5: 安装依赖**

Run: `cd /workspace && npm install`

---

## Task 2: 游戏配置与入口

**Files:**
- Create: `src/config.ts`
- Create: `src/main.ts`
- Create: `src/game.ts`

- [ ] **Step 1: 创建 src/config.ts**

```ts
export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  tileSize: 32,
  
  // 玩家属性
  player: {
    speed: 200,
    runSpeed: 320,
    staminaMax: 100,
    staminaRegen: 10,
    staminaCost: 15,
    hpMax: 100,
    hungerMax: 100,
    hungerDecrease: 1, // 每秒减少
    weightMax: 50
  },
  
  // 昼夜循环（20分钟 = 1200秒 = 1天）
  dayNight: {
    dayDuration: 600, // 10分钟白天
    nightDuration: 600, // 10分钟夜晚
    dawnDuskDuration: 60 // 1分钟黎明/黄昏
  },
  
  // 资源
  resources: {
    tree: { hp: 3, yield: ['wood', 'fiber'], respawnTime: 300 },
    rock: { hp: 5, yield: ['stone'], respawnTime: 600 }
  },
  
  // 颜色
  colors: {
    sky: 0x1a1a2e,
    ground: 0x3d3d5c,
    tree: 0x2d5a27,
    rock: 0x6b6b6b,
    player: 0xd4a373
  }
}
```

- [ ] **Step 2: 创建 src/main.ts**

```ts
import './style.css'
import { initGame } from './game'

initGame()
```

- [ ] **Step 3: 创建 src/style.css**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  background: #1a1a2e; 
  overflow: hidden;
  font-family: 'Source Han Sans SC', sans-serif;
}
#game-container { 
  width: 100vw; 
  height: 100vh; 
  display: flex;
  justify-content: center;
  align-items: center;
}
```

- [ ] **Step 4: 创建 src/game.ts**

```ts
import Phaser from 'phaser'
import { GAME_CONFIG } from './config'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'

export function initGame(): void {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    backgroundColor: GAME_CONFIG.colors.sky,
    parent: 'game-container',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [BootScene, GameScene]
  }

  new Phaser.Game(config)
}
```

- [ ] **Step 5: 运行验证**

Run: `cd /workspace && npm run dev`

Expected: 空白页面，无报错

---

## Task 3: BootScene 加载场景

**Files:**
- Create: `src/scenes/BootScene.ts`

- [ ] **Step 1: 创建 BootScene**

```ts
import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // 创建简单的占位图形
    this.createPlaceholderGraphics()
  }

  create(): void {
    this.scene.start('GameScene')
  }

  private createPlaceholderGraphics(): void {
    // 玩家精灵（32x32 橙色方块）
    const playerGraphics = this.make.graphics()
    playerGraphics.fillStyle(GAME_CONFIG.colors.player)
    playerGraphics.fillRect(0, 0, 28, 28)
    playerGraphics.generateTexture('player', 28, 28)
    playerGraphics.destroy()

    // 树木（32x48 绿色方块）
    const treeGraphics = this.make.graphics()
    treeGraphics.fillStyle(GAME_CONFIG.colors.tree)
    treeGraphics.fillRect(0, 0, 32, 48)
    treeGraphics.generateTexture('tree', 32, 48)
    treeGraphics.destroy()

    // 岩石（32x24 灰色方块）
    const rockGraphics = this.make.graphics()
    rockGraphics.fillStyle(GAME_CONFIG.colors.rock)
    rockGraphics.fillRect(0, 0, 32, 24)
    rockGraphics.generateTexture('rock', 32, 24)
    rockGraphics.destroy()

    // 地面瓦片（32x32）
    const tileGraphics = this.make.graphics()
    tileGraphics.fillStyle(GAME_CONFIG.colors.ground)
    tileGraphics.fillRect(0, 0, 32, 32)
    tileGraphics.lineStyle(1, 0x2a2a4a)
    tileGraphics.strokeRect(0, 0, 32, 32)
    tileGraphics.generateTexture('ground', 32, 32)
    tileGraphics.destroy()
  }
}
```

- [ ] **Step 2: 测试加载场景**

Run: `cd /workspace && npm run dev`

Expected: 控制台无错误，自动跳转到GameScene

---

## Task 4: GameScene 主游戏场景

**Files:**
- Create: `src/scenes/GameScene.ts`
- Create: `src/entities/Player.ts`
- Create: `src/systems/InputManager.ts`

- [ ] **Step 1: 创建 InputManager**

```ts
import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class InputManager {
  private scene: Phaser.Scene
  private keys: { [key: string]: Phaser.Input.Keyboard.Key }
  public isRunning: boolean = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.keys = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      run: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      inventory: Phaser.Input.Keyboard.KeyCodes.TAB
    }) as { [key: string]: Phaser.Input.Keyboard.Key }
  }

  getDirection(): { x: number; y: number } {
    let x = 0
    let y = 0

    if (this.keys.left.isDown) x -= 1
    if (this.keys.right.isDown) x += 1
    if (this.keys.up.isDown) y -= 1
    if (this.keys.down.isDown) y += 1

    return { x, y }
  }

  isMoving(): boolean {
    const dir = this.getDirection()
    return dir.x !== 0 || dir.y !== 0
  }

  getSpeed(): number {
    this.isRunning = this.keys.run.isDown
    return this.isRunning ? GAME_CONFIG.player.runSpeed : GAME_CONFIG.player.speed
  }
}
```

- [ ] **Step 2: 创建 Player 实体**

```ts
import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { InputManager } from '../systems/InputManager'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private scene: Phaser.Scene
  private input: InputManager
  
  // 属性
  public hp: number
  public stamina: number
  public hunger: number
  public inventory: Map<string, number>
  
  // 状态
  private isRunning: boolean = false
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')
    this.scene = scene
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    this.setCollideWorldBounds(true)
    this.setDepth(10)
    
    // 初始化属性
    this.hp = GAME_CONFIG.player.hpMax
    this.stamina = GAME_CONFIG.player.staminaMax
    this.hunger = GAME_CONFIG.player.hungerMax
    this.inventory = new Map()
    
    // 输入管理器
    this.input = new InputManager(scene)
  }

  update(): void {
    if (!this.input) return
    
    const direction = this.input.getDirection()
    const speed = this.input.getSpeed()
    
    // 归一化对角线移动
    if (direction.x !== 0 && direction.y !== 0) {
      direction.x *= 0.707
      direction.y *= 0.707
    }
    
    // 奔跑消耗体力
    if (this.input.isMoving() && this.input.isRunning && this.stamina > 0) {
      this.stamina -= GAME_CONFIG.player.staminaCost * (1/60)
      this.isRunning = true
    } else {
      this.isRunning = false
      // 体力恢复
      if (this.stamina < GAME_CONFIG.player.staminaMax) {
        this.stamina += GAME_CONFIG.player.staminaRegen * (1/60)
      }
    }
    
    // 饥饿自然减少
    this.hunger -= GAME_CONFIG.player.hungerDecrease * (1/60)
    this.hunger = Math.max(0, this.hunger)
    
    // 应用移动
    this.setVelocity(direction.x * speed, direction.y * speed)
    
    // 更新状态UI
    this.updateHud()
  }

  private updateHud(): void {
    const gameScene = this.scene.scene.get('GameScene') as any
    if (gameScene?.hud) {
      gameScene.hud.updateStats(this.hp, this.stamina, this.hunger)
    }
  }

  addItem(item: string, count: number = 1): void {
    const current = this.inventory.get(item) || 0
    this.inventory.set(item, current + count)
    
    // 显示收集提示
    const gameScene = this.scene.scene.get('GameScene') as any
    if (gameScene?.hud) {
      gameScene.hud.showCollectMessage(item, count)
    }
  }
}
```

- [ ] **Step 3: 创建 GameScene**

```ts
import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'
import { Player } from '../entities/Player'
import { Resource } from '../entities/Resource'
import { Hud } from '../ui/Hud'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private resources: Resource[] = []
  private hud!: Hud
  private map!: Phaser.Tilemaps.Tilemap

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    // 创建地图
    this.createMap()
    
    // 创建玩家
    this.player = new Player(this, 400, 300)
    
    // 创建资源
    this.createResources()
    
    // 创建UI
    this.hud = new Hud(this)
    
    // 设置摄像机跟随
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, 1280, 960)
    this.cameras.main.setZoom(1.5)
  }

  private createMap(): void {
    // 创建瓦片调色板（程序生成）
    const tileset = this.add.tilemap(40, 30, 32, 32, 'ground')
    
    // 填充地面
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 40; x++) {
        tileset.putTileAt(0, x, y)
      }
    }
    
    // 物理层
    this.map = this.add.tilemap(40, 30, 32, 32, 'ground')
    this.map.createLayer(0).setCollisionByProperty({ collides: true })
  }

  private createResources(): void {
    // 随机放置树木
    const treePositions = [
      { x: 200, y: 200 }, { x: 300, y: 150 }, { x: 500, y: 250 },
      { x: 600, y: 400 }, { x: 150, y: 400 }, { x: 700, y: 150 }
    ]
    
    treePositions.forEach(pos => {
      const tree = new Resource(this, pos.x, pos.y, 'tree', 'tree')
      this.resources.push(tree)
      this.physics.add.existing(tree, true)
      this.physics.add.collider(this.player, tree)
    })
    
    // 随机放置岩石
    const rockPositions = [
      { x: 400, y: 200 }, { x: 450, y: 350 }, { x: 250, y: 300 }
    ]
    
    rockPositions.forEach(pos => {
      const rock = new Resource(this, pos.x, pos.y, 'rock', 'rock')
      this.resources.push(rock)
      this.physics.add.existing(rock, true)
      this.physics.add.collider(this.player, rock)
    })
  }

  update(): void {
    this.player?.update()
  }
}
```

- [ ] **Step 4: 测试运行**

Run: `cd /workspace && npm run dev`

Expected: 看到玩家（橙色方块）可以用WASD移动

---

## Task 5: 资源实体与交互

**Files:**
- Create: `src/entities/Resource.ts`
- Modify: `src/scenes/GameScene.ts`
- Modify: `src/entities/Player.ts`

- [ ] **Step 1: 创建 Resource**

```ts
import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class Resource extends Phaser.Physics.Arcade.Sprite {
  public type: string
  public hp: number
  private maxHp: number
  private yieldItems: string[]
  private respawnTime: number
  private isDepleted: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number, type: string, texture: string) {
    super(scene, x, y, texture)
    this.type = type
    
    scene.add.existing(this)
    scene.physics.add.existing(this, true)
    
    const config = GAME_CONFIG.resources[type as keyof typeof GAME_CONFIG.resources]
    this.maxHp = config?.hp || 3
    this.hp = this.maxHp
    this.yieldItems = config?.yield || ['wood']
    this.respawnTime = config?.respawnTime || 300
    
    this.setInteractive()
  }

  damage(amount: number, player: any): void {
    if (this.isDepleted) return
    
    this.hp -= amount
    
    // 视觉反馈 - 闪烁
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    })
    
    if (this.hp <= 0) {
      this.destroyResource(player)
    }
  }

  private destroyResource(player: any): void {
    this.isDepleted = true
    
    // 掉落物品
    this.yieldItems.forEach(item => {
      player.addItem(item, 1)
    })
    
    // 隐藏资源
    this.setVisible(false)
    this.disableBody(true, true)
    
    // 定时重生
    this.scene.time.delayedCall(this.respawnTime * 1000, () => {
      this.respawn()
    })
  }

  private respawn(): void {
    this.isDepleted = false
    this.hp = this.maxHp
    this.setVisible(true)
    this.enableBody(true, this.x, this.y, true, true)
  }
}
```

- [ ] **Step 2: 修改 Player 添加交互方法**

在 Player.ts 中添加:

```ts
  interact(resource: Resource): void {
    if (resource) {
      resource.damage(1, this)
    }
  }
```

- [ ] **Step 3: 修改 GameScene 添加交互逻辑**

在 GameScene.create() 后添加:

```ts
  // 交互检测
  this.physics.add.overlap(this.player, this.resources, (player: Player, resource: Resource) => {
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E).isDown) {
      player.interact(resource)
    }
  })
```

- [ ] **Step 4: 测试**

Run: `cd /workspace && npm run dev`

Expected: 靠近树木/岩石，按E可以收集

---

## Task 6: UI系统

**Files:**
- Create: `src/ui/Hud.ts`
- Create: `src/ui/InventoryUI.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: 创建 Hud**

```ts
import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class Hud {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private hpBar!: Phaser.GameObjects.Graphics
  private staminaBar!: Phaser.GameObjects.Graphics
  private hungerBar!: Phaser.GameObjects.Graphics
  private hpText!: Phaser.GameObjects.Text
  private staminaText!: Phaser.GameObjects.Text
  private hungerText!: Phaser.GameObjects.Text
  private collectMessage!: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.container = scene.add.container(10, 10)
    this.container.setScrollFactor(0)
    this.container.setDepth(100)
    
    this.createBars()
    this.createCollectMessage()
  }

  private createBars(): void {
    const barWidth = 150
    const barHeight = 16
    const spacing = 24
    
    // HP条
    this.hpBar = this.scene.add.graphics()
    this.container.add(this.hpBar)
    this.hpText = this.scene.add.text(8, 4, 'HP: 100/100', { 
      fontSize: '12px', 
      color: '#ffffff' 
    })
    this.hpText.setScrollFactor(0)
    this.hpText.setDepth(101)
    this.container.add(this.hpText)
    
    // Stamina条
    this.staminaBar = this.scene.add.graphics()
    this.staminaBar.setPosition(0, spacing)
    this.container.add(this.staminaBar)
    this.staminaText = this.scene.add.text(8, spacing + 4, '体力: 100/100', { 
      fontSize: '12px', 
      color: '#ffffff' 
    })
    this.staminaText.setScrollFactor(0)
    this.staminaText.setDepth(101)
    this.container.add(this.staminaText)
    
    // Hunger条
    this.hungerBar = this.scene.add.graphics()
    this.hungerBar.setPosition(0, spacing * 2)
    this.container.add(this.hungerBar)
    this.hungerText = this.scene.add.text(8, spacing * 2 + 4, '饥饿: 100/100', { 
      fontSize: '12px', 
      color: '#ffffff' 
    })
    this.hungerText.setScrollFactor(0)
    this.hungerText.setDepth(101)
    this.container.add(this.hungerText)
  }

  private createCollectMessage(): void {
    this.collectMessage = this.scene.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 100,
      '',
      { fontSize: '18px', color: '#d4a373', fontStyle: 'bold' }
    )
    this.collectMessage.setOrigin(0.5)
    this.collectMessage.setScrollFactor(0)
    this.collectMessage.setDepth(101)
    this.collectMessage.setAlpha(0)
  }

  updateStats(hp: number, stamina: number, hunger: number): void {
    const barWidth = 150
    const barHeight = 16
    
    // HP
    this.hpBar.clear()
    this.hpBar.fillStyle(0xff4444)
    this.hpBar.fillRect(0, 0, barWidth * (hp / GAME_CONFIG.player.hpMax), barHeight)
    this.hpBar.lineStyle(2, 0xffffff)
    this.hpBar.strokeRect(0, 0, barWidth, barHeight)
    this.hpText.setText(`HP: ${Math.floor(hp)}/${GAME_CONFIG.player.hpMax}`)
    
    // Stamina
    this.staminaBar.clear()
    this.staminaBar.fillStyle(0x44ff44)
    this.staminaBar.fillRect(0, 0, barWidth * (stamina / GAME_CONFIG.player.staminaMax), barHeight)
    this.staminaBar.lineStyle(2, 0xffffff)
    this.staminaBar.strokeRect(0, 0, barWidth, barHeight)
    this.staminaText.setText(`体力: ${Math.floor(stamina)}/${GAME_CONFIG.player.staminaMax}`)
    
    // Hunger
    this.hungerBar.clear()
    this.hungerBar.fillStyle(0xffaa44)
    this.hungerBar.fillRect(0, 0, barWidth * (hunger / GAME_CONFIG.player.hungerMax), barHeight)
    this.hungerBar.lineStyle(2, 0xffffff)
    this.hungerBar.strokeRect(0, 0, barWidth, barHeight)
    this.hungerText.setText(`饥饿: ${Math.floor(hunger)}/${GAME_CONFIG.player.hungerMax}`)
  }

  showCollectMessage(item: string, count: number): void {
    const itemNames: { [key: string]: string } = {
      wood: '木材',
      fiber: '纤维',
      stone: '石材'
    }
    
    this.collectMessage.setText(`+${count} ${itemNames[item] || item}`)
    this.collectMessage.setAlpha(1)
    this.collectMessage.setY(GAME_CONFIG.height - 100)
    
    this.scene.tweens.add({
      targets: this.collectMessage,
      y: GAME_CONFIG.height - 150,
      alpha: 0,
      duration: 1500,
      ease: 'Power2'
    })
  }
}
```

- [ ] **Step 2: 创建 InventoryUI**

```ts
import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class InventoryUI {
  private scene: Phaser.Scene
  private container!: Phaser.GameObjects.Container
  private isOpen: boolean = false
  private itemTexts: Phaser.GameObjects.Text[] = []
  private inventoryRef: Map<string, number>

  constructor(scene: Phaser.Scene, inventory: Map<string, number>) {
    this.scene = scene
    this.inventoryRef = inventory
    
    this.createUI()
    this.setupInput()
  }

  private createUI(): void {
    // 背景
    const bg = this.scene.add.graphics()
    bg.fillStyle(0x1a1a2e, 0.9)
    bg.fillRoundedRect(0, 0, 300, 400, 10)
    bg.lineStyle(2, 0xd4a373)
    bg.strokeRoundedRect(0, 0, 300, 400, 10)
    
    // 标题
    const title = this.scene.add.text(150, 20, '背包', {
      fontSize: '20px',
      color: '#d4a373',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)
    
    this.container = this.scene.add.container(
      GAME_CONFIG.width / 2 - 150,
      GAME_CONFIG.height / 2 - 200,
      [bg, title]
    )
    this.container.setScrollFactor(0)
    this.container.setDepth(200)
    this.container.setVisible(false)
    
    // 初始显示物品
    this.updateDisplay()
  }

  private setupInput(): void {
    this.scene.input.keyboard.on('keydown-TAB', () => {
      this.toggle()
    })
  }

  toggle(): void {
    this.isOpen = !this.isOpen
    this.container.setVisible(this.isOpen)
    if (this.isOpen) {
      this.updateDisplay()
    }
  }

  updateDisplay(): void {
    // 清除旧文本
    this.itemTexts.forEach(text => text.destroy())
    this.itemTexts = []
    
    const itemNames: { [key: string]: string } = {
      wood: '木材',
      fiber: '纤维',
      stone: '石材'
    }
    
    let y = 60
    this.inventoryRef.forEach((count, item) => {
      const text = this.scene.add.text(20, y, `${itemNames[item] || item}: ${count}`, {
        fontSize: '16px',
        color: '#ffffff'
      })
      text.setScrollFactor(0)
      text.setDepth(201)
      this.container.add(text)
      this.itemTexts.push(text)
      y += 30
    })
    
    if (this.inventoryRef.size === 0) {
      const emptyText = this.scene.add.text(150, 200, '背包为空', {
        fontSize: '16px',
        color: '#888888'
      })
      emptyText.setOrigin(0.5)
      emptyText.setScrollFactor(0)
      emptyText.setDepth(201)
      this.container.add(emptyText)
      this.itemTexts.push(emptyText)
    }
  }
}
```

- [ ] **Step 3: 在 GameScene 中集成UI**

修改 GameScene.ts:

```ts
export class GameScene extends Phaser.Scene {
  // ... 现有代码 ...

  create(): void {
    // ... 现有代码 ...
    
    // 创建背包UI
    this.hud = new Hud(this)
    new InventoryUI(this, this.player.inventory)
  }
}
```

- [ ] **Step 4: 测试**

Run: `cd /workspace && npm run dev`

Expected: 
- 顶部显示HP/体力/饥饿条
- 按Tab打开背包
- 收集物品时显示提示

---

## Task 7: 昼夜循环系统

**Files:**
- Create: `src/systems/DayNightCycle.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: 创建 DayNightCycle**

```ts
import Phaser from 'phaser'
import { GAME_CONFIG } from '../config'

export class DayNightCycle {
  private scene: Phaser.Scene
  private overlay!: Phaser.GameObjects.Rectangle
  private currentTime: number = 0 // 0-1 代表一天
  private isDay: boolean = true
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createOverlay()
  }

  private createOverlay(): void {
    this.overlay = this.scene.add.rectangle(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      GAME_CONFIG.width * 2,
      GAME_CONFIG.height * 2,
      0x000000
    )
    this.overlay.setScrollFactor(0)
    this.overlay.setDepth(50)
    this.overlay.setAlpha(0)
  }

  update(delta: number): void {
    const dayNight = GAME_CONFIG.dayNight
    const totalCycle = dayNight.dayDuration + dayNight.nightDuration + dayNight.dawnDuskDuration * 2
    
    this.currentTime += delta / 1000
    if (this.currentTime >= 1) this.currentTime -= 1
    
    // 计算光照强度
    let alpha = 0
    
    const dayStart = dayNight.dawnDuskDuration / totalCycle
    const dayEnd = 1 - dayNight.dawnDuskDuration / totalCycle
    const noon = 0.5
    
    if (this.currentTime < dayStart) {
      // 黎明
      alpha = this.currentTime / dayStart * 0.3
      this.isDay = false
    } else if (this.currentTime < dayEnd) {
      // 白天
      alpha = 0
      this.isDay = true
    } else {
      // 黄昏到夜晚
      const progress = (this.currentTime - dayEnd) / (1 - dayEnd)
      alpha = progress * 0.5
      this.isDay = false
    }
    
    // 夜晚加深
    if (!this.isDay && alpha < 0.3) {
      alpha = 0.3
    }
    
    this.overlay.setAlpha(alpha)
    
    // 颜色变化
    if (this.currentTime < dayStart) {
      // 黎明 - 橙红色
      this.overlay.setFillStyle(0xff8844, alpha)
    } else if (this.currentTime > dayEnd) {
      // 黄昏 - 蓝紫色
      this.overlay.setFillStyle(0x4444aa, alpha)
    } else {
      this.overlay.setFillStyle(0x000000, alpha)
    }
  }

  isDaytime(): boolean {
    return this.isDay
  }

  getTimeProgress(): number {
    return this.currentTime
  }
}
```

- [ ] **Step 2: 在 GameScene 中集成**

修改 GameScene.ts:

```ts
import { DayNightCycle } from '../systems/DayNightCycle'

export class GameScene extends Phaser.Scene {
  private dayNightCycle!: DayNightCycle
  
  create(): void {
    // ... 现有代码 ...
    
    this.dayNightCycle = new DayNightCycle(this)
  }

  update(): void {
    this.player?.update()
    this.dayNightCycle?.update(this.game.loop.delta)
  }
}
```

- [ ] **Step 3: 测试**

Run: `cd /workspace && npm run dev`

Expected: 场景会随时间变暗/变亮

---

## Task 8: 优化与完善

**Files:**
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: 添加提示文本**

在 GameScene create() 中添加:

```ts
// 底部操作提示
const hintText = this.add.text(
  GAME_CONFIG.width / 2,
  GAME_CONFIG.height - 30,
  '[WASD] 移动  [Shift] 奔跑  [E] 交互  [Tab] 背包',
  { fontSize: '14px', color: '#888888' }
)
hintText.setOrigin(0.5)
hintText.setScrollFactor(0)
hintText.setDepth(100)
```

- [ ] **Step 2: 最终测试**

Run: `cd /workspace && npm run dev`

Expected: 完整可运行的Phase 1原型

- [ ] **Step 3: 构建生产版本**

Run: `cd /workspace && npm run build`

Expected: dist/ 文件夹生成成功

---

## 验证清单

运行后检查以下功能：
- [ ] WASD移动正常
- [ ] Shift奔跑消耗体力
- [ ] 体力自动恢复
- [ ] 饥饿值自然减少
- [ ] 靠近树木/岩石按E收集
- [ ] 收集物品显示提示
- [ ] Tab打开/关闭背包
- [ ] 顶部状态栏实时更新
- [ ] 昼夜循环光照变化
- [ ] 摄像机跟随玩家
