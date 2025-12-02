# Background Layer System - Usage Guide

## 🎨 **Neue Layer-Struktur:**

```
1. bg (Background) - Animiertes Video oder statisches Bild
2. bgLayer (Background Layer) - NEU: Für Stage Animations
3. Characters - Spieler
4. Effects & Particles - Effekte
5. Projectiles - Projektile
6. mid (Middle Layer) - Mittlere Ebene
7. Snow Overlay - Schnee-Effekte
8. fg (Foreground) - Vordergrund
```

## 📁 **Stage-Struktur:**

```
levels/sidescroller/ninja_stage/sections/pvp_stage/
├── bg_animated/
│   └── bg.webm          # Animierter Hintergrund
├── bg.png               # Statischer Hintergrund (Fallback)
├── bg_layer.png         # NEU: Background Layer (optional)
├── mid.png              # Mittlere Ebene
├── fg.png               # Vordergrund
└── stage_animations/    # Stage-spezifische Animationen
    ├── atlas.json
    └── atlas.png
```

## 🚀 **Verwendung:**

### 1. **Background Layer laden:**
Das System lädt automatisch `bg_layer.png` wenn vorhanden:
```javascript
// Automatisch in game-assets.js
state.bgLayer = await loadImage(`${stagePath}/bg_layer.png`);
```

### 2. **Stage Animation spawnen:**
```javascript
// Beispiel: Stage Animation auf bgLayer spawnen
Physics.spawnStageAnimation(state, "fx_stage_sound",
  { x: 1100, y: 400 },
  {
    scale: 0.5,
    isLooped: true,
    speed: 1.0,
    offsetX: 0,
    offsetY: 0
  }
);
```

### 3. **Stage Animation mit Duration:**
```javascript
// Einmalige Animation mit Fade-Out
Physics.spawnStageAnimation(state, "fx_stage_sound",
  { x: 500, y: 300 },
  {
    scale: 1.0,
    isLooped: false,
    duration: 3.0, // 3 Sekunden
    useDurationCleanup: true
  }
);
```

## 🎯 **Vorteile:**

- **Separate Layer:** Stage Animations laufen unabhängig von Characters
- **Performance:** Optimiert für Background-Effekte
- **Flexibilität:** Sowohl statische als auch animierte Inhalte
- **Kompatibilität:** Funktioniert mit bestehenden Stage Animations
- **Optional:** Falls kein `bg_layer.png` vorhanden, wird es übersprungen

## 🔧 **Technische Details:**

- **Rendering:** `renderStageAnimations()` in `renderer.js`
- **Update:** `updateStageAnimations()` in `physics.js`
- **Spawning:** `spawnStageAnimation()` in `physics.js`
- **Assets:** Automatisches Laden in `game-assets.js`

## 📝 **Beispiel-Integration:**

```javascript
// In main.js oder physics.js
if (state.stageFxAtlas && state.stageFxAtlas.animations["fx_stage_sound"]) {
  // Spawn permanent looping stage effect
  Physics.spawnStageAnimation(state, "fx_stage_sound",
    { x: 1100, y: 400 },
    {
      scale: 0.5,
      isLooped: true,
      speed: 1.0
    }
  );
}
```

Das System ist vollständig integriert und bereit für die Verwendung! 🎮
