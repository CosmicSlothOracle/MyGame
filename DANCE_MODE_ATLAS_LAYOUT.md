# Dance Mode - Atlas Layout Reference

## pvp_stage_3/stage_animations/atlas.png Layout

```
Atlas Size: 2048 x 4096 pixels (8 columns x 16 rows @ 256x256)

Column Layout (x-axis):
├── Col 0 (x:0)    → fx_stage_3 (16 frames, y:0-3840)
├── Col 1 (x:256)  → fx_stage_3_1 (16 frames, y:0-3840)
├── Col 2 (x:512)  → dance_spot_a (4 frames, y:0-768) ← NEW
├── Col 3 (x:768)  → dance_spot_b (4 frames, y:0-768) ← NEW
├── Col 4 (x:1024) → dance_spot_c (4 frames, y:0-768) ← NEW
├── Col 5 (x:1280) → dance_spot_d (4 frames, y:0-768) ← NEW
└── Col 6 (x:1536) → dance_spot_e (4 frames, y:0-768) ← NEW

Visual Layout:
┌────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│ fx_3_0 │fx_3_1_0│spot_a_0│spot_b_0│spot_c_0│spot_d_0│spot_e_0│        │ Row 0
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ fx_3_1 │fx_3_1_1│spot_a_1│spot_b_1│spot_c_1│spot_d_1│spot_e_1│        │ Row 1
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ fx_3_2 │fx_3_1_2│spot_a_2│spot_b_2│spot_c_2│spot_d_2│spot_e_2│        │ Row 2
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ fx_3_3 │fx_3_1_3│spot_a_3│spot_b_3│spot_c_3│spot_d_3│spot_e_3│        │ Row 3
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ fx_3_4 │fx_3_1_4│        │        │        │        │        │        │ Row 4
│  ...   │  ...   │        │        │        │        │        │        │ ...
│ fx_3_15│fx_3_1_15                                                      │ Row 15
└────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
```

## assets/effects/atlas_fx3.png Layout

```
Atlas Size: 4096 x 4096 pixels (16 columns x 16 rows @ 256x256)

Column Layout (x-axis):
├── Col 0 (x:0)    → fx_knockback_standard (8 frames)
├── Col 1 (x:256)  → fx_knockback_dash (8 frames)
├── Col 2 (x:512)  → fx_knockback_launcher (8 frames)
├── Col 3 (x:768)  → fx_knockback_explosion (8 frames)
├── Col 4 (x:1024) → fx_clank (8 frames)
├── Col 5 (x:1280) → fx_wall_hit (4 frames)
├── Col 6 (x:1536) → fx_knockback_beatmatch (8 frames)
├── Col 0 (x:0)    → dance_spot (8 frames, y:2048-3840)
└── Col 8 (x:2048) → dance_spot_burst (8 frames, y:0-1792) ← NEW

Visual Layout (relevant section):
┌────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│kb_std_0│kb_dsh_0│kb_lch_0│kb_exp_0│clank_0 │wall_0  │kb_bm_0 │        │ Row 0
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│kb_std_1│kb_dsh_1│kb_lch_1│kb_exp_1│clank_1 │wall_1  │kb_bm_1 │        │ Row 1
│  ...   │  ...   │  ...   │  ...   │  ...   │  ...   │  ...   │        │ ...
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│d_spot_0│        │        │        │        │        │        │        │ Row 8
│d_spot_1│        │        │        │        │        │        │        │ Row 9
│  ...   │        │        │        │        │        │        │burst_0 │ Row 0
│d_spot_7│        │        │        │        │        │        │burst_1 │ Row 1
│        │        │        │        │        │        │        │burst_2 │ Row 2
│        │        │        │        │        │        │        │burst_3 │ Row 3
│        │        │        │        │        │        │        │burst_4 │ Row 4
│        │        │        │        │        │        │        │burst_5 │ Row 5
│        │        │        │        │        │        │        │burst_6 │ Row 6
│        │        │        │        │        │        │        │burst_7 │ Row 7
└────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
```

## Animation Frame Rates

- **Dance Spots** (stage atlas): 8 FPS, 4 frames = 0.5 second loop
- **Burst** (fx atlas): 12 FPS, 8 frames = 0.67 second one-shot

## Positioning in Game World

The heatmap pixel coordinates are converted to world coordinates:
- Heatmap dimensions: special.png size (e.g., 2500x1380)
- World dimensions: 2500x1380 (NATIVE_WIDTH x NATIVE_HEIGHT)
- Conversion: `worldX = (heatmapX / heatmapWidth) * 2500`

The sprite is centered on the heatmap pixel:
- Frame size: 256x256
- Sprite top-left = worldPos - 128 (half frame size)
- Detection radius = 128 (half frame size)

## Example special.png Creation Steps

1. Open pvp_stage_3/heatmaps/special.png (or create new 2500x1380 PNG)
2. Using pencil tool (NO anti-aliasing), paint 5 colored dots:
   - Spot A: #FF1E1E (10x10 pixels)
   - Spot B: #C81E1E (10x10 pixels)
   - Spot C: #961E1E (10x10 pixels)
   - Spot D: #FF641E (10x10 pixels)
   - Spot E: #FF961E (10x10 pixels)
3. Place dots on accessible platforms (check semisolid.png for reference)
4. Save as PNG with transparency
5. Test in-game

## Current System Status

✅ JSON Atlas definitions created
✅ Code integration complete
✅ Game mode selection UI implemented
✅ Score system implemented
✅ Respawn system modified for dance mode
⏳ Sprite graphics need to be created (you do this)
⏳ special.png heatmap needs colored markers (you do this)

## Next Steps for Artist

1. Create dance spot sprites (5 different animations, 4 frames each)
2. Create burst animation (1 animation, 8 frames)
3. Paint special.png with 5 colored markers
4. Test and iterate

