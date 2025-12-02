# Dance Mode - Heatmap Guide for pvp_stage_3

## special.png Color Codes for Dance Spots

Use these **exact RGB values** when creating dance spot markers in `pvp_stage_3/heatmaps/special.png`:

| Spot ID | Animation Name | RGB Color | Hex Color | Description |
|---------|---------------|-----------|-----------|-------------|
| Spot A | `dance_spot_a` | (255, 30, 30) | #FF1E1E | Bright red |
| Spot B | `dance_spot_b` | (200, 30, 30) | #C81E1E | Medium red |
| Spot C | `dance_spot_c` | (150, 30, 30) | #961E1E | Dark red |
| Spot D | `dance_spot_d` | (255, 100, 30) | #FF641E | Orange-red |
| Spot E | `dance_spot_e` | (255, 150, 30) | #FF961E | Light orange-red |

## Important Notes

1. **Color Tolerance**: The system uses 5-pixel tolerance, so colors must be within ±5 of the target RGB values
2. **Alpha Channel**: Must be > 128 for detection (use 255 for solid color)
3. **Minimum Spots**: At least 4 spots required, recommend placing all 5
4. **Block Grouping**: System uses 20x20 pixel blocks - paint ~10-20 pixels per spot for reliable detection
5. **Existing Colors**: Avoid these colors already in use:
   - Green (3, 255, 0) - fx_stage_3
   - Blue (3, 0, 255) - fx_stage_3_1
   - Pure Red (255, 0, 0) - kill.png
   - Yellow/Orange/Magenta/Cyan - Dance Battle spots

## Recommended Placement for pvp_stage_3

Spread spots across the stage for varied gameplay:
- Place spots on different platforms (semisolid areas)
- Vary heights to encourage vertical movement
- Ensure all spots are accessible without requiring special abilities
- Keep spots away from kill zones

## Testing the Heatmap

1. Start the game and select Dance Mode
2. Choose pvp_stage_3
3. Console will log: `[Dance Mode] Found X dance spots`
4. Each spot's world coordinates will be printed
5. One spot will pulse (active spot)

## Sprite Creation Guide

Create 4-frame animations for each spot (256x256 per frame) in:
`pvp_stage_3/stage_animations/atlas.png`

Layout:
- Column 3 (x:512): dance_spot_a frames 0-3
- Column 4 (x:768): dance_spot_b frames 0-3
- Column 5 (x:1024): dance_spot_c frames 0-3
- Column 6 (x:1280): dance_spot_d frames 0-3
- Column 7 (x:1536): dance_spot_e frames 0-3

## Burst Animation

Create 8-frame burst animation in `assets/effects/atlas_fx3.png`:
- Position: x:2048, y:0-1792 (Column 11)
- Plays when player scores at a dance spot
- Suggested: Explosion/star burst effect

