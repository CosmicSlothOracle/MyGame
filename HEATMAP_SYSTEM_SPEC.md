# Heatmap System - Complete Specification

## Asset Directory Structure

```
levels/sidescroller/[stage_name]/sections/[section_name]/heatmaps/
├── ground.png      # Solide Wände/Böden (Kollision)
├── kill.png        # Kill-Zonen (Tod bei Berührung)
├── semisolid.png   # Plattformen (von unten durchspringbar)
├── spawn.png       # Spawn-Punkte für Spieler
├── friction.png    # Reibungseffekte (Eis/Matsch)
├── hazard.png      # Gefahrenzonen (Lava/Schock)
├── bounce.png      # Trampolin-Effekte
├── speed.png       # Speed-Boost Zonen
└── special.png     # Spezielle Effekte (Teleporter, etc.)
```

## Color Code Standards

### Primary Heatmaps (Required)

| File | Color | RGB | Hex | Effect |
|------|-------|-----|-----|--------|
| `ground.png` | **Black** | (0,0,0) | #000000 | Standard Boden |
| `ground.png` | **Dark Gray** | (64,64,64) | #404040 | Wände |
| `ground.png` | **Light Gray** | (192,192,192) | #C0C0C0 | Decken |
| `kill.png` | **Red** | (255,0,0) | #FF0000 | Kill-Zone |
| `semisolid.png` | **Yellow** | (255,255,0) | #FFFF00 | Plattform |
| `spawn.png` | **Blue** | (0,0,255) | #0000FF | Spawn-Punkt |

### Extended Heatmaps (Optional)

| File | Color | RGB | Hex | Effect |
|------|-------|-----|-----|--------|
| `friction.png` | **Cyan** | (0,255,255) | #00FFFF | Eis (niedrige Reibung) |
| `friction.png` | **Magenta** | (255,0,255) | #FF00FF | Matsch (hohe Reibung) |
| `hazard.png` | **Orange** | (255,165,0) | #FFA500 | Lava (Schaden) |
| `hazard.png` | **Purple** | (128,0,128) | #800080 | Elektro (Schock) |
| `bounce.png` | **Green** | (0,255,0) | #00FF00 | Trampolin |
| `speed.png` | **White** | (255,255,255) | #FFFFFF | Speed-Boost |
| `special.png` | **Gray** | (128,128,128) | #808080 | Teleporter |

## Asset Creation Guidelines

### File Requirements

- **Format**: PNG with transparency support
- **Size**: Must match level dimensions exactly
- **Color Depth**: 24-bit RGB minimum
- **Transparency**: Use pure black (0,0,0) for "no effect" areas

### Naming Convention

- Use lowercase with underscores: `friction.png`, `speed_boost.png`
- Be descriptive: `moving_platform.png` not `mp.png`
- Version control: `friction_v2.png` for iterations

### Color Precision

- Use **exact RGB values** - no anti-aliasing on effect boundaries
- **Pure colors only** - no gradients or mixed pixels
- **Consistent alpha** - fully opaque (255) for effects, transparent for none

## Implementation Notes

### Physics Integration

- All heatmaps are processed in `physics.js` during player update
- Effects are applied based on player position and velocity
- Multiple effects can stack (e.g., friction + hazard on same pixel)

### Surface Type Physics

Different surface types in `ground.png` have different physics behaviors:

#### **Black (0,0,0) - Standard Ground**

- **Horizontal**: Stop movement, no bounce
- **Vertical**: Standard landing, no special effects
- **Use case**: Normal floors and platforms

#### **Dark Gray (64,64,64) - Walls**

- **Horizontal**: Stop movement when grounded, bounce when airborne
- **Vertical**: Soft bounce when hitting wall while moving up
- **Use case**: Vertical walls, barriers

#### **Light Gray (192,192,192) - Ceilings**

- **Horizontal**: Sliding movement (reduced friction)
- **Vertical**: Stop upward movement, no bounce
- **Use case**: Ceilings, overhangs

### Performance Considerations

- Heatmaps are cached in memory after loading
- Pixel sampling uses 6-pixel step for performance
- Effects are only calculated when player is moving
- Surface type detection uses color matching with 5-pixel tolerance

### Extensibility

- New heatmap types can be added by:
  1. Adding color definition to this spec
  2. Creating loading code in `game-assets.js`
  3. Adding physics logic in `physics.js`
  4. Updating this documentation

## Quality Assurance

### Testing Checklist

- [ ] All heatmap files load without errors
- [ ] Colors match exact RGB specifications
- [ ] Effects trigger at correct player positions
- [ ] Multiple effects work together correctly
- [ ] Performance remains stable with all heatmaps active

### Validation Tools

- Color picker verification for exact RGB values
- Pixel-perfect boundary testing
- Cross-platform compatibility testing
