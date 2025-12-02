# Dance Zone System - Usage Guide (New Zone.png Standard)

## Overview

The **Dance Zone System** creates dynamic, location-based beatmatch zones. Players must move to the **Active Spot** to score Perfect Beat Matches.
The system has been simplified to use **Radial Distance** logic instead of pixel-alpha lookups.

---

## The New Standard: `Zone.png`

Each stage now uses a dedicated `Zone.png` heatmap for defining dance spots.

### How It Works

1. **Input**: `levels/.../heatmaps/Zone.png`
2. **Marking**: Paint up to 5 **solid distinct blobs** (e.g. 20x20 pixels minimum).
3. **Color**: All blobs can be the **SAME COLOR** (any color with Alpha > 128).
4. **Detection**: The game automatically detects separate "blobs" and treats each as a unique Dance Spot.
5. **Active Spot**: One spot is randomly selected as **Active**.
6. **Proximity**: The game calculates the **Distance** from the player to the Active Spot's center.

### Fading Rules (Radial)

Instead of painting gradients, the game applies smooth fading based on distance:

| Distance | Effect |
|----------|--------|
| **0 - 150px** | **Hot Zone** (100% Volume, UI Visible, Bonuses Active) |
| **150 - 800px** | **Fade Zone** (Volume fades linearly 100% -> 0%) |
| **> 800px** | **Silent Zone** (0% Volume, UI Hidden) |

---

## Setup Instructions

### Step 1: Create `Zone.png`

1. Navigate to `levels/sidescroller/[stage]/sections/[section]/heatmaps/`
2. Create a new file `Zone.png` (same dimensions as other heatmaps).
3. Fill background with **Transparent** (Alpha 0).

### Step 2: Paint Spots

1. Choose **ANY solid color** (e.g., Red, Blue, White).
2. Paint **distinct blobs** where you want dance spots.
   - Recommended size: 20x20 pixels or larger.
   - Shape: Square, Circle, Blob - doesn't matter.
   - **Important**: Blobs must be separated by at least ~5 pixels to be detected as separate spots.
3. Paint up to **5 separate spots**.

**Example Layout:**

```
[SPOT 1]       [SPOT 2]       [SPOT 3]
```

### Step 3: Save & Play

1. Save `Zone.png`.
2. Start the game.
3. Check console: `[Dance Mode] Zone.png: Found X spots using blob detection.`

---

## Legacy Support (`special.png`)

The old system using `special.png` with specific colors (Spot A-E) and alpha gradients is still supported as a fallback if `Zone.png` is missing.
However, `Zone.png` is the preferred method for new stages.

---

## FAQ

**Q: Do I need different colors for each spot?**
A: No! In `Zone.png`, you can use the same color for all spots. The game separates them by position (Blob Detection).

**Q: Do I need to paint gradients?**
A: No! Just paint solid blobs. The fading is handled mathematically by the game logic.

**Q: How does the game know which spot is active?**
A: It picks one randomly every 16 bars. Only the active spot emits music/bonuses.

**Q: Can I control the fade radius?**
A: Currently hardcoded (150px full, 800px max). Adjustments require code changes in `DanceSpotManager.js`.
