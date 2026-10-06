import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';
import { ReflexLevelManager, type ReflexLevelConfig } from '../managers/ReflexLevelManager';

const COLORS = [
  { name: 'ROJO', color: 0xff4466, css: '#ff4466' },
  { name: 'AZUL', color: 0x2979ff, css: '#2979ff' },
  { name: 'VERDE', color: 0x4caf50, css: '#4caf50' },
  { name: 'AMARILLO', color: 0xffd700, css: '#ffd700' }
];

export class ReflexScene extends Phaser.Scene {
  private currentLevel = 1;
  private levelConfig!: ReflexLevelConfig;
  private score = 0;
  private runCoins = 0;
  private isOver = false;
  private levelUnlocked = false;
  private timeLeft = 3000;

  private label!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private timerBar!: Phaser.GameObjects.Rectangle;
  private scoreText!: Phaser.GameObjects.Text;
  private uiLayer: Phaser.GameObjects.GameObject[] = [];
  private stroopTarget = 0;
  private memSequence: number[] = [];
  private memStep = 0;
  private memShowing = false;
  private mathAnswer = 0;
  private seqPattern: number[] = [];
  private seqInput: number[] = [];
  private seqShowing = false;
  private oddIndex = 0;

  constructor() {
    super('ReflexScene');
  }

  init(data: { level?: number }) {
    this.currentLevel = data.level || 1;
    this.levelConfig = ReflexLevelManager.getLevel(this.currentLevel);
  }

  preload() {
    this.load.audio('coin', '/sounds/coin.mp3');
    this.load.audio('hit', '/sounds/hit.mp3');
    this.load.audio('level_passed', '/sounds/level-passed.mp3');
  }

  create() {
    const { width, height } = this.scale;
    this.isOver = false;
    this.levelUnlocked = false;
    this.score = 0;
    this.runCoins = 0;
    this.uiLayer = [];

    this.add.rectangle(width / 2, height / 2, width, height, 0x101018);

    this.add.text(16, 10, `Nv.${this.currentLevel} ${this.levelConfig.name}`, {
      fontFamily: 'Arial Black', fontSize: '13px', color: '#e040fb'
    });
    this.scoreText = this.add.text(16, 28, '0', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#ffffff'
    });
    this.hint = this.add.text(width / 2, 52, '', {
      fontFamily: 'Arial', fontSize: '12px', color: '#9988aa', align: 'center'
    }).setOrigin(0.5);

    this.label = this.add.text(width / 2, 95, '', {
      fontFamily: 'Arial Black', fontSize: '26px', color: '#ffffff'
    }).setOrigin(0.5);

    this.timerBar = this.add.rectangle(width / 2, 125, 200, 8, 0xe040fb);

    this.startMode();
  }

  private clearUI() {
    this.uiLayer.forEach(o => o.destroy());
    this.uiLayer = [];
  }

  private startMode() {
    this.clearUI();
    switch (this.levelConfig.mode) {
      case 'stroop': this.setupStroop(); break;
      case 'memory': this.setupMemory(); break;
      case 'math': this.setupMath(); break;
      case 'sequence': this.setupSequence(); break;
      case 'odd': this.setupOdd(); break;
    }
  }

  // ─── STROOP ──────
  private setupStroop() {
    this.hint.setText('Toca el color de la TINTA (no leas la palabra)');
    const { width, height } = this.scale;

    COLORS.forEach((c, i) => {
      const x = i % 2 === 0 ? width * 0.30 : width * 0.70;
      const y = height * 0.42 + Math.floor(i / 2) * 95;
      const btn = this.add.rectangle(x, y, 130, 75, c.color)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.pickStroop(i));
      this.uiLayer.push(btn);
    });
    this.nextStroop();
  }

  private nextStroop() {
    // Palabra = un color, tinta = otro
    const wordIdx = Phaser.Math.Between(0, 3);
    let inkIdx = Phaser.Math.Between(0, 3);
    if (this.levelConfig.difficulty >= 2) {
      while (inkIdx === wordIdx) inkIdx = Phaser.Math.Between(0, 3);
    } else if (Math.random() < 0.75) {
      while (inkIdx === wordIdx) inkIdx = Phaser.Math.Between(0, 3);
    }
    this.stroopTarget = inkIdx;
    this.label.setText(COLORS[wordIdx].name);
    this.label.setColor(COLORS[inkIdx].css);
    this.timeLeft = Math.max(900, this.levelConfig.timeMs - this.score * 30);
    this.timerBar.width = 200;
  }

  private pickStroop(i: number) {
    if (this.isOver) return;
    if (i === this.stroopTarget) this.onCorrect();
    else this.endGame();
  }

  // ─── MEMORY (cartas) ──────
  private setupMemory() {
    this.hint.setText('Memoriza el orden de los brillos');
    this.label.setText('…');
    this.label.setColor('#ffffff');
    this.memSequence = [];
    const len = 3 + Math.floor(this.levelConfig.difficulty / 2) + Math.floor(this.score / 3);
    for (let i = 0; i < Math.min(len, 8); i++) {
      this.memSequence.push(Phaser.Math.Between(0, 3));
    }
    this.memStep = 0;
    this.memShowing = true;

    const { width, height } = this.scale;
    const btns: Phaser.GameObjects.Rectangle[] = [];
    COLORS.forEach((c, i) => {
      const x = i % 2 === 0 ? width * 0.30 : width * 0.70;
      const y = height * 0.42 + Math.floor(i / 2) * 95;
      const btn = this.add.rectangle(x, y, 130, 75, c.color)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        if (this.memShowing || this.isOver) return;
        if (i === this.memSequence[this.memStep]) {
          this.memStep++;
          if (this.memStep >= this.memSequence.length) this.onCorrect();
        } else this.endGame();
      });
      btns.push(btn);
      this.uiLayer.push(btn);
    });

    // Mostrar secuencia
    let delay = 400;
    this.memSequence.forEach((idx, step) => {
      this.time.delayedCall(delay + step * 600, () => {
        if (this.isOver) return;
        btns[idx].setScale(1.12);
        this.time.delayedCall(350, () => btns[idx].setScale(1));
      });
    });
    this.time.delayedCall(delay + this.memSequence.length * 600, () => {
      this.memShowing = false;
      this.label.setText('¡Tu turno!');
    });
  }

  // ─── MATH ──────
  private setupMath() {
    this.hint.setText('Elige el resultado correcto');
    this.label.setColor('#ffffff');
    const d = this.levelConfig.difficulty;
    const a = Phaser.Math.Between(2 + d, 9 + d * 3);
    const b = Phaser.Math.Between(2 + d, 9 + d * 2);
    const ops = d >= 5 ? ['+', '-', '×'] : d >= 3 ? ['+', '-', '×'] : ['+', '-'];
    const op = Phaser.Math.RND.pick(ops);
    let result = 0;
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else result = a * b;
    this.mathAnswer = result;
    this.label.setText(`${a} ${op} ${b} = ?`);
    this.timeLeft = this.levelConfig.timeMs;
    this.timerBar.width = 200;

    // 4 opciones (1 correcta)
    const opts = new Set<number>([result]);
    while (opts.size < 4) {
      opts.add(result + Phaser.Math.Between(-12, 12) || result + 3);
    }
    const arr = Phaser.Utils.Array.Shuffle([...opts]);
    const { width, height } = this.scale;
    arr.forEach((val, i) => {
      const x = i % 2 === 0 ? width * 0.30 : width * 0.70;
      const y = height * 0.42 + Math.floor(i / 2) * 95;
      const btn = this.add.rectangle(x, y, 130, 75, 0x2a2a40)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0xe040fb);
      const t = this.add.text(x, y, `${val}`, {
        fontFamily: 'Arial Black', fontSize: '24px', color: '#ffffff'
      }).setOrigin(0.5);
      btn.on('pointerdown', () => {
        if (val === this.mathAnswer) this.onCorrect();
        else this.endGame();
      });
      this.uiLayer.push(btn, t);
    });
  }

  // ─── SEQUENCE (más largo) ───────
  private setupSequence() {
    this.hint.setText('Repite la secuencia de colores');
    this.label.setText('Mira…');
    this.label.setColor('#ffffff');
    const len = 3 + Math.floor(this.score / 2) + Math.floor(this.levelConfig.difficulty / 3);
    this.seqPattern = [];
    for (let i = 0; i < Math.min(len, 9); i++) {
      this.seqPattern.push(Phaser.Math.Between(0, 3));
    }
    this.seqInput = [];
    this.seqShowing = true;

    const { width, height } = this.scale;
    const btns: Phaser.GameObjects.Rectangle[] = [];
    COLORS.forEach((c, i) => {
      const x = i % 2 === 0 ? width * 0.30 : width * 0.70;
      const y = height * 0.42 + Math.floor(i / 2) * 95;
      const btn = this.add.rectangle(x, y, 130, 75, c.color)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        if (this.seqShowing || this.isOver) return;
        this.seqInput.push(i);
        const step = this.seqInput.length - 1;
        if (this.seqInput[step] !== this.seqPattern[step]) {
          this.endGame();
          return;
        }
        if (this.seqInput.length === this.seqPattern.length) this.onCorrect();
      });
      btns.push(btn);
      this.uiLayer.push(btn);
    });

    this.seqPattern.forEach((idx, step) => {
      this.time.delayedCall(500 + step * 550, () => {
        if (this.isOver) return;
        btns[idx].setAlpha(0.4);
        this.time.delayedCall(280, () => btns[idx].setAlpha(1));
      });
    });
    this.time.delayedCall(500 + this.seqPattern.length * 550, () => {
      this.seqShowing = false;
      this.label.setText('¡Repite!');
    });
  }

  // ─── ODD ONE OUT ─────────
  private setupOdd() {
    this.hint.setText('Toca el que NO pertenece al grupo');
    this.label.setText('¿Cuál sobra?');
    this.label.setColor('#ffffff');
    this.timeLeft = this.levelConfig.timeMs;
    this.timerBar.width = 200;

    const groupType = Phaser.Math.Between(0, 2);
    // 0: números pares vs impar | 1: vocales vs consonante | 2: múltiplos
    const items: string[] = [];
    this.oddIndex = Phaser.Math.Between(0, 3);

    if (groupType === 0) {
      const evens = [2, 4, 6, 8, 10, 12, 14, 16];
      Phaser.Utils.Array.Shuffle(evens);
      for (let i = 0; i < 4; i++) items.push(i === this.oddIndex ? '7' : `${evens[i]}`);
    } else if (groupType === 1) {
      const vocals = ['A', 'E', 'I', 'O'];
      const cons = ['B', 'C', 'D', 'F', 'G', 'H'];
      for (let i = 0; i < 4; i++) {
        items.push(i === this.oddIndex ? Phaser.Math.RND.pick(cons) : vocals[i]);
      }
    } else {
      const mult = [3, 6, 9, 12, 15, 18];
      Phaser.Utils.Array.Shuffle(mult);
      for (let i = 0; i < 4; i++) items.push(i === this.oddIndex ? '10' : `${mult[i]}`);
    }

    const { width, height } = this.scale;
    items.forEach((txt, i) => {
      const x = i % 2 === 0 ? width * 0.30 : width * 0.70;
      const y = height * 0.42 + Math.floor(i / 2) * 95;
      const btn = this.add.rectangle(x, y, 130, 75, 0x2a2a40)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0xe040fb);
      const t = this.add.text(x, y, txt, {
        fontFamily: 'Arial Black', fontSize: '26px', color: '#ffffff'
      }).setOrigin(0.5);
      btn.on('pointerdown', () => {
        if (i === this.oddIndex) this.onCorrect();
        else this.endGame();
      });
      this.uiLayer.push(btn, t);
    });
  }

  // ─── COMÚN ─────────
  private onCorrect() {
    this.score++;
    if (this.score % 2 === 0) {
      CurrencyManager.addCoins(1);
      this.runCoins++;
      try { this.sound.play('coin', { volume: 0.4 }); } catch (_) {}
    }
    this.scoreText.setText(`${this.score}  ●${this.runCoins}`);

    if (this.score >= this.levelConfig.targetScore && !this.levelUnlocked) {
      this.levelUnlocked = true;
      ReflexLevelManager.unlock(this.currentLevel + 1);
      try { this.sound.play('level_passed', { volume: 0.55 }); } catch (_) {}
      this.hint.setText('¡Nivel desbloqueado! Sigue sumando…');
      this.hint.setColor('#00ffcc');
    }

    this.startMode();
  }

  update(_: number, delta: number) {
    if (this.isOver) return;
    if (this.levelConfig.timeMs > 0 &&
      (this.levelConfig.mode === 'stroop' || this.levelConfig.mode === 'math' || this.levelConfig.mode === 'odd')) {
      this.timeLeft -= delta;
      const base = this.levelConfig.timeMs;
      this.timerBar.width = Math.max(0, (this.timeLeft / base) * 200);
      if (this.timeLeft <= 0) this.endGame();
    }
  }

  private endGame() {
    if (this.isOver) return;
    this.isOver = true;
    try { this.sound.play('hit', { volume: 0.45 }); } catch (_) {}
    this.clearUI();

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);
    this.add.text(width / 2, height * 0.30, 'FIN', {
      fontFamily: 'Arial Black', fontSize: '36px', color: '#e040fb'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.40, `Aciertos ${this.score}  ·  +${this.runCoins}💰`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff'
    }).setOrigin(0.5);

    const retry = this.add.rectangle(width / 2, height * 0.54, 180, 48, 0xe040fb)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.54, 'REINTENTAR', {
      fontFamily: 'Arial Black', fontSize: '16px', color: '#ffffff'
    }).setOrigin(0.5);
    retry.on('pointerdown', () => this.scene.restart({ level: this.currentLevel }));

    const menu = this.add.rectangle(width / 2, height * 0.64, 180, 42, 0x333355)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.64, 'MENÚ REFLEX', {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffffff'
    }).setOrigin(0.5);
    menu.on('pointerdown', () => this.scene.start('ReflexMenuScene'));

    const hub = this.add.rectangle(width / 2, height * 0.74, 180, 40, 0x222240)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.74, 'HUB JUEGOS', {
      fontFamily: 'Arial', fontSize: '14px', color: '#aaaaaa'
    }).setOrigin(0.5);
    hub.on('pointerdown', () => this.scene.start('HubScene'));
  }
}