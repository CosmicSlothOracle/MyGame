# Heatmap Color Legend - Complete Reference

This document contains all color definitions used across all heatmaps in the game.

---

## 1. Ground Heatmap (`ground.png`)

| Color Name | RGB | Hex | Description |
|------------|-----|-----|-------------|
| **Black** | (0, 0, 0) | `#000000` | Standard ground/platform |
| **Dark Gray** | (64, 64, 64) | `#404040` | Walls (vertical collision) |
| **Light Gray** | (192, 192, 192) | `#C0C0C0` | Ceilings (top collision) |

---

## 2. Kill Zone Heatmap (`kill.png`)

| Color Name | RGB | Hex | Description |
|------------|-----|-----|-------------|
| **Red** | (255, 0, 0) | `#FF0000` | Instant death on contact |

---

## 3. Semisolid Heatmap (`semisolid.png`)

| Color Name | RGB | Hex | Description |
|------------|-----|-----|-------------|
| **Yellow** | (255, 255, 0) | `#FFFF00` | Platform (passable from below) |

---

## 4. Spawn Heatmap (`spawn.png`)

| Color Name | RGB | Hex | Description |
|------------|-----|-----|-------------|
| **Blue** | (0, 0, 255) | `#0000FF` | Player spawn point |
| **Magenta** | (255, 0, 255) | `#FF00FF` | NPC spawn point |

---

## 5. Friction Heatmap (`friction.png`)

| Color Name | RGB | Hex | Description |
|------------|-----|-----|-------------|
| **Cyan** | (0, 255, 255) | `#00FFFF` | Ice (low friction) |
| **Magenta** | (255, 0, 255) | `#FF00FF` | Mud (high friction) |

---

## 6. Hazard Heatmap (`hazard.png`)

| Color Name | RGB | Hex | Description |
|------------|-----|-----|-------------|
| **Orange** | (255, 165, 0) | `#FFA500` | Lava (damage over time) |
| **Purple** | (128, 0, 128) | `#800080` | Electric (shock effect) |

---

## 7. Bounce Heatmap (`bounce.png`)

| Color Name | RGB | Hex | Description |
|------------|-----|-----|-------------|
| **Green** | (0, 255, 0) | `#00FF00` | Trampolin effect |

---

## 8. Speed Heatmap (`speed.png`)

| Color Name | RGB | Hex | Description |
|------------|-----|-----|-------------|
| **White** | (255, 255, 255) | `#FFFFFF` | Speed boost zone |

---

## 9. Special Heatmap (`special.png`)

### 9.1. Dance Zone Spots

| Spot ID | RGB | Hex | Description |
|---------|-----|-----|-------------|
| **Spot A** | (255, 30, 30) | `#FF1E1E` | Primary red dance zone |
| **Spot B** | (200, 30, 30) | `#C81E1E` | Secondary red dance zone |
| **Spot C** | (150, 30, 30) | `#961E1E` | Tertiary red dance zone |
| **Spot D** | (255, 100, 30) | `#FF641E` | Orange dance zone (Tutorial) |
| **Spot E** | (255, 150, 30) | `#FF961E` | Light orange dance zone |

### 9.2. Legacy Stage Animation Colors (Deprecated)

> **Note:** These colors are deprecated. Use `anim_ui.png` instead for stage animations.

| Animation | RGB | Hex | Description |
|-----------|-----|-----|-------------|
| **fx_stage_3** | (3, 255, 0) | `#03FF00` | Stage animation spawn (legacy) |
| **fx_stage_3_1** | (3, 0, 255) | `#0300FF` | Stage animation spawn (legacy) |

### 9.3. Other Special Effects

| Color Name | RGB | Hex | Description |
|------------|-----|-----|-------------|
| **Gray** | (128, 128, 128) | `#808080` | Teleporter / Special effects |

---

## 10. UI Animation Heatmap (`anim_ui.png`)

> **New System:** Stage UI animations are now triggered via dedicated `anim_ui.png` heatmap using 256×256 pixel color blocks.

### Color Mapping (Automatic Assignment)

The system automatically assigns colors to animations based on alphabetical sorting. The mapping is logged to console at runtime.

| Animation | RGB | Hex | Palette Index | Description |
|-----------|-----|-----|---------------|-------------|
| **box_a** | (255, 0, 0) | `#FF0000` | 0 | Red |
| **box_b** | (0, 255, 0) | `#00FF00` | 1 | Green |
| **box_c** | (0, 0, 255) | `#0000FF` | 2 | Blue |
| **box_d** | (255, 255, 0) | `#FFFF00` | 3 | Yellow |
| **box_e** | (0, 255, 255) | `#00FFFF` | 4 | Cyan |
| **box_f** | (255, 0, 255) | `#FF00FF` | 5 | Magenta |
| **box_g** | (255, 128, 0) | `#FF8000` | 6 | Orange |
| **box_h** | (128, 0, 255) | `#8000FF` | 7 | Purple |

### Full Palette (20 Colors Available)

| Index | RGB | Hex | Color Name |
|-------|-----|-----|------------|
| 0 | (255, 0, 0) | `#FF0000` | Red |
| 1 | (0, 255, 0) | `#00FF00` | Green |
| 2 | (0, 0, 255) | `#0000FF` | Blue |
| 3 | (255, 255, 0) | `#FFFF00` | Yellow |
| 4 | (0, 255, 255) | `#00FFFF` | Cyan |
| 5 | (255, 0, 255) | `#FF00FF` | Magenta |
| 6 | (255, 128, 0) | `#FF8000` | Orange |
| 7 | (128, 0, 255) | `#8000FF` | Purple |
| 8 | (128, 255, 0) | `#80FF00` | Lime |
| 9 | (255, 128, 192) | `#FF80C0` | Pink |
| 10 | (0, 128, 128) | `#008080` | Teal |
| 11 | (0, 0, 128) | `#000080` | Navy |
| 12 | (128, 0, 0) | `#800000` | Maroon |
| 13 | (128, 128, 0) | `#808000` | Olive |
| 14 | (165, 42, 42) | `#A52A2A` | Brown |
| 15 | (255, 127, 80) | `#FF7F50` | Coral |
| 16 | (75, 0, 130) | `#4B0082` | Indigo |
| 17 | (238, 130, 238) | `#EE82EE` | Violet |
| 18 | (255, 215, 0) | `#FFD700` | Gold |
| 19 | (192, 192, 192) | `#C0C0C0` | Silver |

### Usage Instructions

1. **Create `anim_ui.png`** in your stage's `heatmaps/` directory
2. **Use 256×256 pixel blocks** - each block represents one animation spawn point
3. **Fill blocks completely** with the color corresponding to your desired animation
4. **Check console logs** at runtime to see the exact color mapping for your stage's animations
5. **Positioning**: The animation spawns at the center of each 256×256 block

---

## Color Conflict Warnings

### Reserved Colors (Do Not Use in Multiple Heatmaps)

| Color | RGB | Used In | Conflict Risk |
|-------|-----|---------|---------------|
| Pure Red | (255, 0, 0) | `kill.png`, `anim_ui.png` | ⚠️ High |
| Pure Green | (0, 255, 0) | `bounce.png`, `anim_ui.png` | ⚠️ High |
| Pure Blue | (0, 0, 255) | `spawn.png`, `anim_ui.png` | ⚠️ High |
| Magenta | (255, 0, 255) | `friction.png`, `spawn.png` | ⚠️ Medium |
| Yellow | (255, 255, 0) | `semisolid.png`, `anim_ui.png` | ⚠️ Medium |

**Best Practice:** Always use the dedicated heatmap file for each purpose. Do not mix systems.

---

## Technical Notes

- **Color Tolerance**: Most systems use ±5 RGB tolerance for color matching
- **Alpha Channel**: Minimum alpha of 128 (50%) required for detection in most systems
- **Block Size**: `anim_ui.png` uses 256×256 pixel blocks (1:1 mapping to animation frames)
- **Legacy Support**: Old `special.png` animation colors still work but are deprecated

---

## Quick Reference by File

| File | Primary Colors | Purpose |
|------|----------------|---------|
| `ground.png` | Black, Dark Gray, Light Gray | Collision detection |
| `kill.png` | Red | Death zones |
| `semisolid.png` | Yellow | Passable platforms |
| `spawn.png` | Blue, Magenta | Spawn points |
| `friction.png` | Cyan, Magenta | Surface friction |
| `hazard.png` | Orange, Purple | Damage zones |
| `bounce.png` | Green | Bounce effects |
| `speed.png` | White | Speed boosts |
| `special.png` | Red variants, Orange variants | Dance zones, legacy animations |
| `anim_ui.png` | Full palette (20 colors) | Stage UI animations |

---

*Last updated: 2024*
