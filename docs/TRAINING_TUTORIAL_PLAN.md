# Training Stage Tutorial System - Implementation Plan

## Overview
A comprehensive, step-by-step tutorial system for the training stage that teaches players all core combat mechanics in a structured, easy-to-learn format.

## Tutorial Structure

### Part 2: Combat Tutorial (Training Stage)
After completing Part 1 (Dance Spot Tutorial), players transition to the training stage for combat instruction.

### Tutorial Steps

#### Step 1: Basic Attacks (No Enemy)
**Goal**: Use every attack type once
**Instructions**:
- "Try each attack button: R1 (Light), R2 (Heavy), L1 (Special), L2 (Charged)"
- Show button prompts/highlights
- Track: R1, R2, L1, L2 used at least once
**Completion**: All 4 attack types used
**Next**: Spawn enemy, proceed to Step 2

#### Step 2: Attack on Enemy
**Goal**: Use every attack type once on the enemy
**Instructions**:
- "Now use each attack on the enemy!"
- Enemy spawns in idle state (NPC controller disabled)
- Track: R1, R2, L1, L2 hit enemy at least once
**Completion**: All 4 attack types hit enemy
**Next**: Enable beat matching, proceed to Step 3

#### Step 3: Perfect Beat Charged Attack
**Goal**: Collect 4 perfect beats, then perform a charged beat attack
**Instructions**:
- "Match the beat! Watch the top bar - each beat lights up"
- "Collect 4 perfect beats (green feedback)"
- "Then hold L2 to charge and release on beat for a charged attack!"
- Highlight HUD beat bar
- Track: perfect beat count (4 required), then charged L2 attack
**Completion**: 4 perfect beats collected + charged L2 attack performed
**Next**: Proceed to Step 4

#### Step 4: Dodge Training
**Goal**: Perform dodge/roll 3 times in a row
**Instructions**:
- "Press [Roll Button] to dodge!"
- "Dodge 3 times in a row to complete this step"
- Track: consecutive dodge count (reset on failure)
**Completion**: 3 consecutive dodges performed
**Next**: Proceed to Step 5

#### Step 5: Beat Matching System Explanation
**Goal**: Understand the beat matching system and HUD
**Instructions**:
- "The top bar shows the music beats - 4 beats per bar"
- "Time your attacks with the beats for bonus damage!"
- "Green = Perfect, Yellow = Good, Red = Miss"
- Highlight and explain HUD elements
- Interactive: Player performs a few beat-matched attacks
**Completion**: Player understands system (auto-advance after explanation + 2-3 successful beat matches)
**Next**: Tutorial complete, return to menu or unlock PvP

## Technical Implementation

### State Structure
```javascript
tutorial: {
  active: true,
  part: 2, // Combat tutorial
  step: 1, // Current step (1-5)
  stepData: {
    step1: {
      attacksUsed: { r1: false, r2: false, l1: false, l2: false },
      complete: false
    },
    step2: {
      attacksHit: { r1: false, r2: false, l1: false, l2: false },
      enemySpawned: false,
      complete: false
    },
    step3: {
      perfectBeatCount: 0,
      requiredPerfectBeats: 4,
      chargedAttackPerformed: false,
      complete: false
    },
    step4: {
      consecutiveDodges: 0,
      requiredDodges: 3,
      lastDodgeTime: 0,
      dodgeWindow: 3.0, // seconds between dodges to count as "in a row"
      complete: false
    },
    step5: {
      explanationShown: false,
      beatMatchesPerformed: 0,
      requiredMatches: 2,
      complete: false
    }
  },
  instructionPanel: {
    visible: true,
    currentText: "",
    highlightElements: [] // ["hud_beat_bar", "button_r1", etc.]
  }
}
```

### Instruction Panel UI
- Position: Bottom-center of screen
- Style: Semi-transparent dark background with white text
- Features:
  - Current instruction text
  - Button prompts (visual icons)
  - Progress indicators (e.g., "2/4 attacks used")
  - Highlight overlays for relevant UI elements

### Attack Tracking
- Monitor `p.attack.type` changes
- Track when each attack type is used
- For Step 2: Check hit detection against enemy player

### Perfect Beat Tracking
- Use existing `getBeatWindowQuality()` system
- Track "perfect" quality beats
- Reset counter if player takes damage or fails

### Dodge Tracking
- Monitor `p.roll.active` state changes
- Track consecutive dodges within time window
- Reset counter if too much time passes between dodges

### HUD Highlighting
- Overlay system for highlighting UI elements
- Pulse/glow effect on highlighted elements
- Arrow indicators pointing to relevant UI

### Step Progression
- Each step has completion conditions
- Auto-advance when conditions met
- Brief transition animation between steps
- Enemy spawns/despawns as needed

## File Structure

### New Files
- `js/tutorial-system.js` - Core tutorial logic and step management
- `js/ui-components.js` - Add `renderTutorialInstructionPanel()` function

### Modified Files
- `js/game-state.js` - Extend tutorial state structure
- `js/physics.js` - Add tutorial step tracking and progression logic
- `js/renderer.js` - Add instruction panel rendering and HUD highlighting
- `js/main.js` - Initialize tutorial step 1 when training stage loads

## User Experience Flow

1. **Transition from Part 1**: Victory dance → Training stage loads
2. **Step 1 Start**: Instruction panel appears, no enemy
3. **Step 1 Complete**: Enemy spawns, instruction updates
4. **Step 2 Complete**: Beat matching enabled, instruction updates
5. **Step 3 Complete**: Dodge instruction appears
6. **Step 4 Complete**: Beat matching explanation appears, HUD highlights
7. **Step 5 Complete**: Tutorial complete, return to menu

## Design Principles

1. **Progressive Disclosure**: One concept at a time
2. **Visual Feedback**: Clear indicators for progress and completion
3. **Non-Punishing**: No failure states, just progression
4. **Interactive Learning**: Player performs actions, not just reading
5. **Clear Instructions**: Concise, actionable text
6. **Visual Aids**: Button prompts, highlights, progress bars

## Future Enhancements

- Character-specific attack tutorials
- Advanced techniques (combos, tech, etc.)
- Optional challenges after completion
- Tutorial replay option
- Skip tutorial option (for returning players)

