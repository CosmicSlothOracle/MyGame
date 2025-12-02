# Attack System Architecture Guidelines

## 🚨 CRITICAL: Do Not Deviate From This System

**Date**: After Attack System Refactor (2024)
**Status**: MANDATORY - All future development must follow these principles

---

## Core Principles

### 1. **NO MORE HARDCODED CHARACTER CHECKS**
❌ **FORBIDDEN**:
```javascript
if (p.charName === "cyboard") {
  // Character-specific logic
}
```

✅ **REQUIRED**:
```javascript
const descriptor = AttackCatalog.getDescriptor(p, attackType);
if (descriptor?.specialProperty) {
  // Data-driven logic
}
```

### 2. **Attack Configuration is Data-Driven**
- All attack properties (damage, knockback, FX, priority) come from `attack-catalog.js`
- New characters = new descriptor entries, NOT code changes
- Character-specific behavior via descriptor metadata (e.g., `animSpeed`)

### 3. **Ultimate System Architecture**
- **Fritz**: Uses `p.attack.type = "r2_l2_ulti"` (standard system)
- **HP/Cyboard**: Uses `p.ultiPhase` (special state machine) BUT must attach descriptors to hits
- **All ultimates**: Must use `AttackCatalog.getDescriptor(p, "r2_l2_ulti")` for priority/FX

---

## Implementation Rules

### Adding New Characters
1. **Add descriptors to `attack-catalog.js`** (duplicate from similar character)
2. **NO code changes in `physics.js`** for basic attacks
3. **Special interactions** (like Cyboard sword) require code, but use descriptors for FX/priority

### Adding New Attacks
1. **Define in `attack-catalog.js`** with proper tier/priority
2. **Add FX references** in descriptor.fx.hit/clank
3. **Use descriptor in attack logic** for speed, FX, priority

### FX System
```javascript
// OLD (FORBIDDEN):
spawnEffect(state, p, "hardcoded_fx");

// NEW (REQUIRED):
const descriptor = AttackCatalog.getDescriptor(p, attackType);
const fxId = descriptor?.fx?.hit?.id || "fallback_fx";
spawnEffect(state, p, fxId, descriptor?.fx?.hit?.options);
```

---

## Exception Cases (Keep As-Is)

These character-specific checks are **intentionally preserved**:

### 1. Projectile State Machines
```javascript
// Cyboard sword recall logic (lines 680-707)
if (p.charName === "cyboard" && p.swordIsOut) {
  // Complex projectile interaction - must stay
}
```

### 2. Unique Input Combinations
```javascript
// Fritz L3+R1 combo (lines 801-808)
if (inputs.l3UpR1Down && p.charName === "fritz") {
  // Unique input mapping - must stay
}
```

### 3. Character-Specific Special Attacks
```javascript
// L1/L2 per character (lines 834-870)
if (inputs.l1Down && p.charName === "fritz") {
  // Each char has unique specials - must stay
}
```

---

## Testing Checklist

Before committing any attack-related changes:

- [ ] No new `p.charName ===` checks added
- [ ] New attacks use descriptor system
- [ ] FX routing checks descriptor first
- [ ] Trade logging shows correct priorities
- [ ] All characters still playable
- [ ] No regression in dance battle/match end

---

## Debugging Tools

### Trade Logging
```javascript
// Enable in console for debugging:
AttackCatalog.enableTradeLogging(true);
// Shows: [AttackTrade] win: r2 (tier=SMASH, prio=85) vs l1 (tier=COMBO, prio=55)
```

### Descriptor Inspection
```javascript
// Check descriptor in console:
const desc = AttackCatalog.getDescriptor(player, "r2");
console.log(desc); // Shows tier, priority, FX, metadata
```

---

## Migration History

- **Before**: 20+ hardcoded character checks in attack logic
- **After**: Data-driven system with 3 intentional exceptions
- **Result**: Maintainable, extensible, consistent attack system

---

## ⚠️ WARNING

**Any deviation from these guidelines will result in:**
- Technical debt accumulation
- Inconsistent attack behavior
- Difficult character additions
- Regression in priority/FX systems

**When in doubt**: Add to descriptor, don't add to code.

---

*This document is living - update when new patterns emerge, but never remove these core principles.*
