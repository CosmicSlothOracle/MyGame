# Heatmap System - Architecture Guidelines

## Core Principles

### 1. **Color Consistency is Critical**
- **NEVER** deviate from the defined RGB values in `HEATMAP_SYSTEM_SPEC.md`
- Use exact color matching with 5-pixel tolerance maximum
- All heatmap files must use pure colors - no anti-aliasing or gradients

### 2. **File Structure is Sacred**
```
levels/sidescroller/[stage]/sections/[section]/heatmaps/
├── ground.png      # REQUIRED - Black (0,0,0)
├── kill.png        # REQUIRED - Red (255,0,0)
├── semisolid.png   # REQUIRED - Yellow (255,255,0)
├── spawn.png       # REQUIRED - Blue (0,0,255)
├── friction.png    # OPTIONAL - Cyan/Magenta
├── hazard.png      # OPTIONAL - Orange/Purple
├── bounce.png      # OPTIONAL - Green
├── speed.png       # OPTIONAL - White
└── special.png     # OPTIONAL - Gray
```

### 3. **Loading Strategy**
- **Required heatmaps**: Load with error (game won't start without them)
- **Optional heatmaps**: Load with try/catch (game continues if missing)
- **Performance**: Cache all loaded heatmaps in memory
- **Validation**: Log successful loads, warn on missing optional files

## Implementation Rules

### 4. **Physics Integration**
- Heatmap effects are checked **BEFORE** collision detection
- Multiple effects can stack (e.g., friction + hazard on same pixel)
- Use cooldowns to prevent effect spam
- Effects are applied based on player hurtbox positions

### 5. **Color Detection**
```javascript
// ALWAYS use this pattern for color matching
const color = getPixelColor(x, y, imageData);
if (color && color.a > 128) { // Check alpha first
  if (colorsMatch(color, HEATMAP_COLORS.CYAN)) {
    // Apply effect
  }
}
```

### 6. **Effect Cooldowns**
- **Hazard effects**: 0.5-1.0 second cooldowns
- **Speed boosts**: 0.2 second cooldowns
- **Special effects**: 2.0 second cooldowns
- **Bounce effects**: No cooldown (physics-based)

## Prohibited Actions

### 7. **NEVER Do These**
- ❌ Create heatmaps with custom colors not in the spec
- ❌ Mix multiple effects in a single heatmap file
- ❌ Use anti-aliased or gradient colors
- ❌ Skip the try/catch for optional heatmap loading
- ❌ Apply effects without cooldown management
- ❌ Check heatmap effects after collision detection

### 8. **Performance Warnings**
- ❌ Don't sample every pixel - use 6-pixel step for performance
- ❌ Don't check heatmaps when player is stationary
- ❌ Don't load heatmaps larger than level dimensions
- ❌ Don't create heatmaps with unnecessary transparency

## Extension Guidelines

### 9. **Adding New Heatmap Types**
1. **Update `HEATMAP_SYSTEM_SPEC.md`** with new color definitions
2. **Add loading code** in `js/game-assets.js` with try/catch
3. **Add state variables** in `js/game-state.js`
4. **Implement physics logic** in `js/physics.js` `checkHeatmapEffects()`
5. **Update this document** with new rules

### 10. **Testing Requirements**
- [ ] All required heatmaps load without errors
- [ ] Optional heatmaps fail gracefully when missing
- [ ] Color detection works with exact RGB values
- [ ] Effects trigger at correct player positions
- [ ] Cooldowns prevent effect spam
- [ ] Multiple effects work together correctly
- [ ] Performance remains stable with all heatmaps active

## Debugging Tools

### 11. **Console Logging**
```javascript
// Enable detailed heatmap logging
console.log(`[Heatmap] Loaded ${heatmapType} for ${sectionKey}`);
console.log(`[Heatmap] Effect triggered: ${effectType} at (${x}, ${y})`);
console.log(`[Heatmap] Color detected: RGB(${r}, ${g}, ${b})`);
```

### 12. **Visual Debugging**
- Use browser dev tools to inspect loaded image data
- Verify pixel colors match exact RGB specifications
- Check that transparency is handled correctly

## Migration Notes

### 13. **From Old System**
- Existing `ground.png`, `kill.png`, `semisolid.png`, `spawn.png` remain unchanged
- New heatmap types are purely additive
- No breaking changes to existing level files
- Backward compatibility maintained

### 14. **Future Considerations**
- Heatmap system is designed for easy extension
- New effects can be added without modifying core physics
- Color system can be expanded with new combinations
- Performance optimizations can be added without breaking functionality

---

**Remember**: The heatmap system is designed to give level designers **visual control** over game physics. Keep it simple, consistent, and extensible!
