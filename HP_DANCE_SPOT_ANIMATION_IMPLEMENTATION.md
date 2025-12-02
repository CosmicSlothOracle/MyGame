# HP Dance Spot Animation Implementation

## Overview

Added a special 16-frame `dance_spot` animation to HP's character atlas that triggers when a player successfully performs a perfect beatmatch at a dance spot in Dance Mode.

## Changes Made

### 1. HP Atlas Configuration (`assets/characters/HP/atlas.json`)

**New Frame Definitions** (Spalte 12, x: 2816):

```json
"dance_spot_000": { "frame": { "x": 2816, "y": 0, "w": 256, "h": 256 }, ... },
"dance_spot_001": { "frame": { "x": 2816, "y": 256, "w": 256, "h": 256 }, ... },
"dance_spot_002": { "frame": { "x": 2816, "y": 512, "w": 256, "h": 256 }, ... },
...
"dance_spot_015": { "frame": { "x": 2816, "y": 3840, "w": 256, "h": 256 }, ... }
```

**New Animation Definition**:

```json
"dance_spot": [
  { "frame": "dance_spot_000", "d": 0.5 },
  { "frame": "dance_spot_001", "d": 0.5 },
  { "frame": "dance_spot_002", "d": 0.5 },
  { "frame": "dance_spot_003", "d": 0.5 },
  { "frame": "dance_spot_004", "d": 0.5 },
  { "frame": "dance_spot_005", "d": 0.5 },
  { "frame": "dance_spot_006", "d": 0.5 },
  { "frame": "dance_spot_007", "d": 0.5 },
  { "frame": "dance_spot_008", "d": 0.5 },
  { "frame": "dance_spot_009", "d": 0.5 },
  { "frame": "dance_spot_010", "d": 0.5 },
  { "frame": "dance_spot_011", "d": 0.5 },
  { "frame": "dance_spot_012", "d": 0.5 },
  { "frame": "dance_spot_013", "d": 0.5 },
  { "frame": "dance_spot_014", "d": 0.5 },
  { "frame": "dance_spot_015", "d": 0.5 }
]
```

**Atlas Layout**:

- **Spalte 12**: x: 2816 (12 * 256)
- **16 Frames**: y: 0 bis y: 3840 (16 * 256)
- **Frame Duration**: 0.5 Sekunden pro Frame
- **Total Duration**: 8 Sekunden (16 * 0.5)

### 2. Physics Logic (`js/physics.js`)

**Added HP Animation Trigger**:

```javascript
// NEW: Trigger HP dance_spot animation for the scoring player
const scoringPlayer = state.players[playerIndex];
if (scoringPlayer && scoringPlayer.characterConfig && scoringPlayer.characterConfig.animations.dance_spot) {
  // Set the player's animation to dance_spot (16 frames, one-shot)
  scoringPlayer.animation = {
    name: "dance_spot",
    frameIndex: 0,
    time: 0,
    isLooped: false,
    speed: 1.0
  };
  console.log(`[Dance Mode] Triggered HP dance_spot animation for player ${playerIndex}`);
}
```

**Integration Point**: Added to `incrementDanceModeScore()` function, triggered when:

1. Player performs perfect beatmatch at active dance spot
2. Dance spot is successfully cleared
3. Score is incremented

## How It Works

### Animation Triggering

1. **Player scores** at active dance spot with perfect beatmatch
2. **HP Animation**: `dance_spot` animation starts (16 frames, 8 seconds)
3. **Stage Effects**: `dance_spot_cleared` + `dance_spot_burst` play simultaneously
4. **Audio Filter**: Updates based on combined score
5. **New Spot**: Next random dance spot is selected

### Animation Properties

- **Duration**: 8 seconds (16 frames × 0.5s)
- **Loop**: No (one-shot animation)
- **Speed**: Normal (1.0x)
- **Trigger**: Only on perfect beatmatch at dance spots
- **Player**: Only the scoring player (P1 or P2)

### Visual Sequence

```
Perfect Beatmatch → HP dance_spot animation (8s) + Stage cleared effects + Burst effect
```

## Benefits

1. **Visual Feedback**: Clear indication when player successfully scores at dance spot
2. **Character-Specific**: HP has unique animation for dance spot success
3. **Distinct from Normal**: Different from regular beatmatch animations
4. **Rewarding**: 8-second celebration animation for successful dance spot completion
5. **Non-Intrusive**: One-shot animation doesn't interfere with gameplay

## Files Modified

1. `assets/characters/HP/atlas.json`:
   - Added 16 frame definitions (dance_spot_000 to dance_spot_015)
   - Added animation definition (dance_spot)
   - Positioned in Spalte 12 (x: 2816)

2. `js/physics.js`:
   - Modified `incrementDanceModeScore()` function
   - Added HP animation trigger logic
   - Added debug logging

## Status: Implemented ✅

The HP dance spot animation system is now fully implemented:

- ✅ 16-frame animation added to HP's atlas
- ✅ Animation triggers on perfect dance spot beatmatch
- ✅ One-shot animation (8 seconds duration)
- ✅ Only affects the scoring player
- ✅ Integrated with existing dance mode effects

## Testing

**Expected Behavior**:

1. Player performs perfect beatmatch at active dance spot
2. HP character plays `dance_spot` animation (8 seconds)
3. Console shows: "Triggered HP dance_spot animation for player X"
4. Stage effects (cleared + burst) play simultaneously
5. New random dance spot is selected

**Console Commands for Testing**:

```javascript
// Check if HP has dance_spot animation
console.log(state.players[0].characterConfig.animations.dance_spot);

// Check current player animation
console.log(state.players[0].animation);

// Check dance mode state
console.log(state.danceMode);
```

## Next Steps

**Graphics Required**:

- Create 16 frames of HP dance spot animation in `assets/characters/HP/atlas.png`
- Position frames in Spalte 12 (x: 2816, y: 0-3840)
- Each frame should be 256x256 pixels
- Animation should represent HP's celebration of successful dance spot completion
