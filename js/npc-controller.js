// NPC Controller - Simulates inputs for Player 2 with full ability support
window.NPCController = (() => {
  let enabled = false;
  let lastRollTime = 0;
  let beatCounter = 0;
  let dodgeCooldown = 0;

  // NPC State Management
  let npcState = {
    targetDistance: 150,
    lastAttackType: null,
    comboStep: 0,
    lastHitTime: 0,
    lastR1Time: 0, // For double-tap detection
    attackCooldowns: {},
    lastActionTime: 0,
    preferredRange: 150,
    l2ChargeStart: 0, // Track when L2 charge started
    l2Charging: false, // Track if currently charging L2
    lastDanceTime: 0, // Track last dance move
    lastJumpTime: 0, // Track last jump to avoid spam
    doubleJumpUsed: false, // Track if double jump was consumed this airtime
    doubleJumpPlanned: false, // Track if we plan to use double jump mid-gap
    doubleJumpPlanDirection: 1,
    doubleJumpPlanLanding: null,
    doubleJumpPlanStartX: 0,
    doubleJumpPlanTime: 0,
    incomingAttackCounter: 0,
    nextDodgeAttempt: 3 + Math.floor(Math.random() * 3),
    shouldDodgeThisAttack: false,
    dodgeAttemptedForCurrentAttack: false,
    lastTrackedAttackRef: null,
    lastOpponentAttackPhase: "none",
    // Tutorial-specific deterministic beat-charge behavior
    beatChargeCollecting: false,
    beatChargeTarget: 4, // Number of perfect beats to collect deterministically
    lastBeatDanceAttempt: 0,
    beatAggressiveMode: false,
    // Double-tap dash tracking
    doubleDashState: {
      waitingForSecondTap: false,
      queuedAt: 0,
      lastUsedAt: 0,
    },
    lastAttackChoice: null,
    // --- Strategy Layer ---
    strategy: {
      currentMode: "ZONE_DEFENSE", // "ZONE_DEFENSE", "COMBAT_AGGRO", "RESOURCE_GATHER", "SURVIVAL"
      confidence: 1.0,
      lastChange: 0,
      modeStartTime: 0,
    },
    playerProfile: {
      aggressionScore: 0,
      rhythmSkill: 0,
      recentActions: [], // { type: "attack"|"hit", time: number }
    },
    resources: {
      beatCharges: 0,
      ultReady: false,
      healthState: "high",
    },
    // Attack cooldowns per type
    attackCooldowns: {
      r1: 0,
      r2: 0,
      l1: 0,
      l2: 0,
      grab: 0,
    },
    lastAttackAnim: null, // Track last attack animation to prevent spam
  };

  // Proximity threshold (in pixels) at which mere closeness counts as a threat.
  // Used to (1) bypass strategy hysteresis, (2) switch to COMBAT_AGGRO even in-zone,
  // and (3) stop beatmatching when the player is too close, regardless of aggression.
  const PROX_THREAT_DISTANCE = 140;

  function toggle() {
    enabled = !enabled;
    console.log(`🤖 NPC ${enabled ? "ENABLED" : "DISABLED"}`);
    return enabled;
  }

  function enable() {
    enabled = true;
    console.log(`🤖 NPC ENABLED`);
    return enabled;
  }

  function disable() {
    enabled = false;
    console.log(`🤖 NPC DISABLED`);
    return enabled;
  }

  function isEnabled() {
    return enabled;
  }

  // Helper: Check if ability can be used (replicates Physics.canUseAbility logic)
  function canUseAbility(p, ability) {
    return !p.cooldowns || p.cooldowns[ability] <= 0;
  }

  // Helper: Get distance category
  function getDistanceCategory(distance) {
    if (distance < 120) return "close";
    if (distance < 200) return "mid";
    return "far";
  }

  // Heatmap Helpers ---------------------------------------------------------
  function scaleToHeatmap(x, y, data, state) {
    if (!data) return { x: 0, y: 0 };

    const cameraBounds = state?.cameraBounds;
    if (!cameraBounds) {
      return { x: x | 0, y: y | 0 };
    }

    const stageWidth =
      cameraBounds.width ??
      window.GameState?.CONSTANTS?.NATIVE_WIDTH ??
      data.width;
    const stageHeight =
      cameraBounds.height ??
      window.GameState?.CONSTANTS?.NATIVE_HEIGHT ??
      data.height;
    const stageX = cameraBounds.x ?? 0;
    const stageY = cameraBounds.y ?? 0;

    const scaleX = data.width / stageWidth;
    const scaleY = data.height / stageHeight;

    const hx = (x - stageX) * scaleX;
    const hy = (y - stageY) * scaleY;

    return { x: hx | 0, y: hy | 0 };
  }

  function isHeatmapSolid(x, y, data, state) {
    if (!data) return false;
    const coords = scaleToHeatmap(x, y, data, state);
    const ix = Math.max(0, Math.min(data.width - 1, coords.x));
    const iy = Math.max(0, Math.min(data.height - 1, coords.y));
    const index = (iy * data.width + ix) * 4 + 3; // Alpha channel
    return data.data[index] > 128;
  }

  function isGroundPixel(x, y, state) {
    if (!state) return false;
    return (
      isHeatmapSolid(x, y, state.groundData, state) ||
      isHeatmapSolid(x, y, state.semisolidData, state)
    );
  }

  function isOnSemisolidPlatform(p, state) {
    if (!state?.semisolidData || !p.grounded) return false;
    const hb = window.Renderer?.getHurtbox?.(p);
    if (!hb) return false;

    // Check if standing on semisolid (but not on regular ground)
    const footX = hb.left + hb.w / 2;
    const footY = hb.top + hb.h + 2; // Just below feet

    const onSemisolid = isHeatmapSolid(
      footX,
      footY,
      state.semisolidData,
      state
    );
    const onRegularGround = isHeatmapSolid(
      footX,
      footY,
      state.groundData,
      state
    );

    // On semisolid but NOT on regular ground = can drop through
    return onSemisolid && !onRegularGround;
  }

  function hasGroundBelow(x, y, state, maxDrop = 48, step = 6) {
    if (!state) return false;
    for (let dy = 0; dy <= maxDrop; dy += step) {
      if (isGroundPixel(x, y + dy, state)) {
        return true;
      }
    }
    return false;
  }

  function scanForLanding(p, direction, state, options = {}) {
    const {
      maxDistance = 160,
      step = 12,
      dropDistance = 64,
      footY = p.pos.y,
    } = options;

    if (!direction) return null;

    for (let offset = step; offset <= maxDistance; offset += step) {
      const sampleX = p.pos.x + direction * offset;
      if (hasGroundBelow(sampleX, footY, state, dropDistance)) {
        return offset;
      }
    }

    return null;
  }

  function getEdgeInfo(p, axis, state, options = {}) {
    if (!state || !axis) {
      return { isGap: false };
    }

    const direction = axis > 0 ? 1 : -1;
    const footY = options.footY ?? p.pos.y + 2;
    const lookAhead = options.lookAhead ?? 32;
    const dropDistance = options.dropDistance ?? 54;

    const hasSupportAhead = hasGroundBelow(
      p.pos.x + direction * lookAhead,
      footY,
      state,
      dropDistance
    );

    if (hasSupportAhead) {
      return { isGap: false };
    }

    const landingDistance = scanForLanding(p, direction, state, {
      footY,
      dropDistance,
      maxDistance: options.maxLandingDistance ?? 160,
      step: options.step ?? 12,
    });

    return {
      isGap: true,
      direction,
      landingDistance,
    };
  }

  function canAttemptJump(p, grounded, currentTime) {
    if (!grounded) return false;
    if (typeof currentTime !== "number") return false;
    if (typeof p.jumpsLeft === "number" && p.jumpsLeft <= 0) return false;
    return currentTime - npcState.lastJumpTime > 0.35;
  }

  function getRandomDodgeInterval() {
    return 3 + Math.floor(Math.random() * 3);
  }

  function finalizeInputs(inputs, currentTime) {
    if (!inputs) return inputs;

    if (inputs.jump || inputs.jumpPressed) {
      inputs.jump = true;
      if (typeof inputs.jumpHeld !== "boolean") {
        inputs.jumpHeld = true;
      }
      npcState.lastJumpTime = currentTime;
    }

    return inputs;
  }

  // Helper: Get optimal range for character (using AttackCatalog if available)
  function getOptimalRange(p2, attackType = "r1") {
    if (window.AttackCatalog && window.AttackCatalog.getDescriptor) {
      const descriptor = window.AttackCatalog.getDescriptor(p2, attackType);
      // Estimate range from descriptor or use defaults
      if (descriptor) {
        // Use character-specific range if available
        return 150; // Default optimal range
      }
    }
    // Default ranges based on attack type
    switch (attackType) {
      case "r1":
        return 120;
      case "r2":
        return 180;
      case "l1":
        return 250;
      case "l2":
        return 150;
      default:
        return 150;
    }
  }

  function chooseWeightedCandidate(candidates) {
    if (!candidates || candidates.length === 0) return null;
    const totalWeight = candidates.reduce(
      (sum, candidate) => sum + (candidate.weight ?? 1),
      0
    );
    let roll = Math.random() * totalWeight;
    for (const candidate of candidates) {
      roll -= candidate.weight ?? 1;
      if (roll <= 0) {
        return candidate;
      }
    }
    return candidates[candidates.length - 1];
  }

  function isInActiveDanceZone(p, state) {
    const spot = state.danceMode?.currentActiveSpot;
    if (!spot) return false;
    const hb = window.Renderer?.getHurtbox?.(p);
    const playerX = hb ? hb.left + hb.w / 2 : p.pos.x;
    const playerY = hb ? hb.top + hb.h : p.pos.y;
    const dx = spot.pos.x - playerX;
    const dy = spot.pos.y - playerY;
    const dist = Math.hypot(dx, dy);
    const radius = state.danceMode?.beatMatchRadius ?? 400;
    return dist <= radius * 0.5; // Inside half-radius = "in zone"
  }

  function getDanceSpotGuardAxis(p, state) {
    const spot = state.danceMode?.currentActiveSpot;
    if (!spot)
      return {
        axis: 0,
        weight: 0,
        distance: Infinity,
        dy: 0,
        needsVertical: false,
      };
    const hb = window.Renderer?.getHurtbox?.(p);
    const playerX = hb ? hb.left + hb.w / 2 : p.pos.x;
    const playerY = hb ? hb.top + hb.h : p.pos.y;
    const dx = spot.pos.x - playerX;
    const dy = spot.pos.y - playerY;
    const dist = Math.hypot(dx, dy);
    const radius = state.danceMode?.beatMatchRadius ?? 400;

    // If already in zone, no movement needed
    if (dist <= radius * 0.5) {
      return {
        axis: 0,
        weight: 0,
        distance: dist,
        dy: dy,
        needsVertical: Math.abs(dy) > 40,
      };
    }

    // Strong pull towards zone (full axis value)
    const axis = dx > 0 ? 1.0 : -1.0;
    // Weight increases with distance (stronger pull when far)
    const weight = Math.min(1.0, dist / Math.max(radius, 200));
    // Needs vertical movement if zone is significantly above/below
    const needsVertical = Math.abs(dy) > 40;
    return {
      axis,
      weight,
      distance: dist,
      dy: dy,
      needsVertical: needsVertical,
    };
  }

  function shouldCollectBeatCharges(p, distance, state) {
    if (!state.danceMode?.active) return false;
    const charges = p.perfectBeatCount || 0;
    if (charges >= 9) return false; // Max charges
    const inZone = isInActiveDanceZone(p, state);
    return inZone; // Always collect if in zone
  }

  function isPlayerThreatening(p1, p2, distance, state) {
    // Check if player is attacking
    const attackInfo = detectIncomingAttack(p1, p2);
    if (attackInfo && attackInfo.phase !== "none") {
      return true;
    }

    // Check if player is directly in front/behind at same height (threatening position)
    const hb1 = window.Renderer?.getHurtbox?.(p1);
    const hb2 = window.Renderer?.getHurtbox?.(p2);
    if (!hb1 || !hb2) {
      // Fallback to pos-based check
      const dy = Math.abs(p1.pos.y - p2.pos.y);
      const dx = Math.abs(p1.pos.x - p2.pos.x);
      return dy < 60 && dx < 120; // Same height, close horizontal
    }

    const p1CenterY = hb1.top + hb1.h / 2;
    const p2CenterY = hb2.top + hb2.h / 2;
    const verticalOverlap = Math.abs(p1CenterY - p2CenterY);
    const horizontalDist = Math.abs(
      hb1.left + hb1.w / 2 - (hb2.left + hb2.w / 2)
    );

    // Threatening if: same height (within 60px) AND close horizontally (within 120px)
    return verticalOverlap < 60 && horizontalDist < 120;
  }

  function queueDoubleDashTap(currentTime) {
    const dd = npcState.doubleDashState;
    if (dd.waitingForSecondTap) return;
    dd.waitingForSecondTap = true;
    dd.queuedAt = currentTime;
  }

  function applyPendingDoubleDash(inputs, p, currentTime) {
    const dd = npcState.doubleDashState;
    if (
      !dd.waitingForSecondTap ||
      !p.attack ||
      p.attack.type !== "r1" ||
      p.attack.phase !== "start"
    ) {
      return;
    }
    inputs.r1Down = true;
    dd.waitingForSecondTap = false;
    dd.lastUsedAt = currentTime;
    npcState.lastAttackType = "r1_dash";
  }

  function canAttemptUltimateSafely(p, opponent, state) {
    if (!opponent) return false;
    const charKey = (p.charName || "").toLowerCase();
    const dx = opponent.pos.x - p.pos.x;
    const dy = opponent.pos.y - p.pos.y;
    const facing = typeof p.facing === "number" ? p.facing : 1;

    // HP: Always safe (bike ultimate can chase)
    if (charKey === "hp") {
      return true;
    }

    // Cyboard: Always safe (teleport ultimate)
    if (charKey === "cyboard") {
      return true;
    }

    // Fritz & Ernst: Only if player is in facing direction AND at same height
    // Bonus if opponent is stunned
    if (charKey === "ernst" || charKey === "fritz") {
      const hb1 = window.Renderer?.getHurtbox?.(opponent);
      const hb2 = window.Renderer?.getHurtbox?.(p);

      // Check if opponent is stunned (highly favorable)
      const isStunned = (opponent.stunT || 0) > 0.5;

      if (hb1 && hb2) {
        const p1CenterY = hb1.top + hb1.h / 2;
        const p2CenterY = hb2.top + hb2.h / 2;
        const verticalOverlap = Math.abs(p1CenterY - p2CenterY);
        const inFacingDirection = dx * facing > 0; // Player is ahead in facing direction
        // Stricter height check if not stunned
        const heightThreshold = isStunned ? 120 : 60;
        const sameHeight = verticalOverlap < heightThreshold;
        const inRange = Math.abs(dx) < 900;
        return inFacingDirection && sameHeight && inRange;
      }
      // Fallback to pos-based check
      const heightThreshold = isStunned ? 120 : 60;
      const sameHeight = Math.abs(dy) < heightThreshold;
      const inFacingDirection = dx * facing > 0;
      return sameHeight && inFacingDirection && Math.abs(dx) < 900;
    }

    return Math.abs(dx) < 900;
  }

  function isHPUltimateActive(p) {
    return (
      p.attack?.type === "r2_l2_ulti" ||
      p.ultiPhase === "active" ||
      (p.anim && (p.anim.includes("r2_l2_ulti") || p.anim.includes("bike")))
    );
  }

  // --- Strategy & Analysis Helpers ---

  function analyzePlayerBehavior(p1, state, currentTime) {
    const profile = npcState.playerProfile;

    // Track aggression (attacks per second in recent history)
    // Only track start of attacks to avoid counting every frame
    if (
      p1.attack &&
      p1.attack.type !== "none" &&
      p1.attack.phase === "active"
    ) {
      const lastAction =
        profile.recentActions[profile.recentActions.length - 1];
      // Debounce: 0.5s between distinct attacks
      if (!lastAction || currentTime - lastAction.time > 0.5) {
        profile.recentActions.push({ type: "attack", time: currentTime });
      }
    }

    // Prune old actions (> 5s ago)
    profile.recentActions = profile.recentActions.filter(
      (a) => currentTime - a.time < 5.0
    );

    // Calculate scores
    const attackCount = profile.recentActions.length;
    // >3 attacks in 5s = full aggro (normalized 0-1)
    profile.aggressionScore = Math.min(1.0, attackCount / 3.0);

    // Rhythm skill: based on opponent's charge count (normalized 0-1)
    profile.rhythmSkill = Math.min(1.0, (p1.perfectBeatCount || 0) / 5.0);
  }

  function evaluateStrategicNeeds(p2, state) {
    const charges = p2.perfectBeatCount || 0;
    const health = p2.percent || 0; // 0% is healthy, higher is worse
    const ultReady = window.UltimeterManager?.canUseUltimate(p2) || false;

    npcState.resources.beatCharges = charges;
    npcState.resources.ultReady = ultReady;

    if (health > 100) npcState.resources.healthState = "low";
    else if (health > 50) npcState.resources.healthState = "mid";
    else npcState.resources.healthState = "high";
  }

  function updateStrategy(p1, p2, state, currentTime) {
    // 1. Analysis
    analyzePlayerBehavior(p1, state, currentTime);
    evaluateStrategicNeeds(p2, state);

    // Update attack cooldowns (decay per frame, assuming 60fps)
    const dt = 1 / 60; // Frame time
    for (const key in npcState.attackCooldowns) {
      if (npcState.attackCooldowns[key] > 0) {
        npcState.attackCooldowns[key] = Math.max(
          0,
          npcState.attackCooldowns[key] - dt
        );
      }
    }

    // Track attack animation state
    const currentAnim = p2.anim || "";
    const isInAttackAnim =
      currentAnim.includes("r1") ||
      currentAnim.includes("r2") ||
      currentAnim.includes("l1") ||
      currentAnim.includes("l2") ||
      currentAnim.includes("jab") ||
      currentAnim.includes("smash") ||
      currentAnim.includes("dash") ||
      currentAnim.includes("circle");

    // If we were in an attack anim and now we're not, ensure cooldown is set
    if (npcState.lastAttackAnim && !isInAttackAnim) {
      // Attack animation just finished
      const attackType = npcState.lastAttackAnim.includes("l1")
        ? "l1"
        : npcState.lastAttackAnim.includes("l2")
        ? "l2"
        : npcState.lastAttackAnim.includes("r2")
        ? "r2"
        : "r1";
      // Ensure minimum cooldown to prevent immediate re-selection
      const minCooldown = attackType === "l1" ? 1.5 : 0.5;
      if (npcState.attackCooldowns[attackType] < minCooldown) {
        npcState.attackCooldowns[attackType] = minCooldown;
      }
    }
    npcState.lastAttackAnim = isInAttackAnim ? currentAnim : null;

    const dist = Math.abs(p1.pos.x - p2.pos.x);
    const inZone = isInActiveDanceZone(p2, state);

    // Check for critical situations that bypass hysteresis
    const isBeingAttacked = detectIncomingAttack(p1, p2)?.phase !== "none";
    const proximityThreat = dist < PROX_THREAT_DISTANCE;
    const isInDanger =
      isBeingAttacked ||
      proximityThreat || // Proximity alone is considered dangerous
      (npcState.resources.healthState === "low" &&
        npcState.playerProfile.aggressionScore > 0.6) ||
      (p2.stunT && p2.stunT > 0.3);

    // Hysteresis: Don't switch too fast (min 1.0s in a mode)
    // BUT: Bypass hysteresis for critical situations
    const timeSinceLastChange = currentTime - npcState.strategy.lastChange;
    const canSwitchMode = timeSinceLastChange >= 1.0 || isInDanger;

    if (!canSwitchMode) return;

    // Default new mode
    let newMode = "ZONE_DEFENSE";

    // LOGIC MATRIX

    // A. SURVIVAL: Low health + aggressive player -> Run away / Dodge focus
    if (
      npcState.resources.healthState === "low" &&
      npcState.playerProfile.aggressionScore > 0.7
    ) {
      newMode = "SURVIVAL";
    }
    // B. COMBAT_AGGRO: Player is aggressive OR we are close and not in zone
    // OR: Being attacked (critical - bypasses hysteresis)
    else if (
      isBeingAttacked ||
      npcState.playerProfile.aggressionScore > 0.5 ||
      (dist < 200 && !inZone) ||
      proximityThreat // Proximity forces aggro even in-zone
    ) {
      newMode = "COMBAT_AGGRO";
    }
    // C. RESOURCE_GATHER: In zone, safe, and need charges
    // Only if NOT being attacked (safety check)
    else if (
      !isBeingAttacked &&
      inZone &&
      npcState.resources.beatCharges < 9 &&
      npcState.playerProfile.aggressionScore < 0.3
    ) {
      newMode = "RESOURCE_GATHER";
    }
    // D. ZONE_DEFENSE (Default): Prioritize getting to/holding zone
    else {
      newMode = "ZONE_DEFENSE";
    }

    // Apply Change
    if (newMode !== npcState.strategy.currentMode) {
      const previousMode = npcState.strategy.currentMode;
      npcState.strategy.currentMode = newMode;
      npcState.strategy.lastChange = currentTime;
      npcState.strategy.modeStartTime = currentTime;

      if (state.debug?.devMode && isInDanger) {
        console.log(
          `[NPC Strategy] CRITICAL MODE SWITCH: ${previousMode} → ${newMode} (bypassed hysteresis: ${timeSinceLastChange.toFixed(
            2
          )}s, prox=${proximityThreat ? "YES" : "NO"})`
        );
      }
    }
  }

  // Phase 1: Smart Movement Decision
  function decideMovement(p1, p2, distance, grounded, state, currentTime) {
    const inputs = {
      axis: 0,
      jumpPressed: false,
      jump: false,
      jumpHeld: false,
    };

    // Don't move if locked in attack or stunned
    if (
      p2.attack?.type !== "none" ||
      (p2.stunT && p2.stunT > 0) ||
      p2.roll?.active
    ) {
      return inputs;
    }

    const mode = npcState.strategy.currentMode;
    const danceZoneInfo = getDanceSpotGuardAxis(p2, state);
    const inZone = isInActiveDanceZone(p2, state);
    let jumpingForZone = false; // Track if we're jumping for vertical zone navigation

    // --- STRATEGY-BASED MOVEMENT ---

    if (mode === "SURVIVAL") {
      // Run away from player
      inputs.axis = p2.pos.x < p1.pos.x ? -1 : 1;
    } else if (mode === "COMBAT_AGGRO") {
      // Aggressive spacing
      const optimalRange = getOptimalRange(p2, "r1") * 0.8; // 20% closer
      if (distance > optimalRange + 20) {
        inputs.axis = p2.pos.x < p1.pos.x ? 1 : -1;
      } else if (distance < optimalRange - 20) {
        inputs.axis = p2.pos.x < p1.pos.x ? -1 : 1;
      } else {
        // Micro-movement
        if (Math.random() < 0.1) {
          inputs.axis = Math.random() < 0.5 ? 0.3 : -0.3;
        }
      }
    } else if (mode === "ZONE_DEFENSE" || mode === "RESOURCE_GATHER") {
      // Prioritize Zone
      if (!inZone && danceZoneInfo.weight > 0) {
        inputs.axis = danceZoneInfo.axis;

        // VERTICAL NAVIGATION: Jump if zone is above, drop if zone is below
        if (
          danceZoneInfo.needsVertical &&
          grounded &&
          canAttemptJump(p2, grounded, currentTime)
        ) {
          const zoneAbove = danceZoneInfo.dy < -40; // Zone is above NPC
          const zoneBelow = danceZoneInfo.dy > 40; // Zone is below NPC
          const verticalDist = Math.abs(danceZoneInfo.dy);

          if (zoneAbove) {
            // Zone is above: Check if we can reach it via semisolid platforms
            const hasSemisolid = !!state?.semisolidData;
            let shouldJump = false;

            if (hasSemisolid) {
              // Dynamic height checking based on vertical distance to zone
              // Check from 40px up to zone height (max 250px), in steps
              const minCheckHeight = 40;
              const maxCheckHeight = Math.min(verticalDist + 50, 250); // Check up to zone + buffer
              const stepSize = Math.max(20, Math.floor(verticalDist / 8)); // Adaptive step size

              // Also check standard platform heights (60, 100, 140, 180) for intermediate platforms
              const standardHeights = [60, 100, 140, 180];
              const dynamicHeights = [];
              for (let h = minCheckHeight; h <= maxCheckHeight; h += stepSize) {
                dynamicHeights.push(h);
              }

              // Combine and deduplicate (sort and remove duplicates)
              const allHeights = [
                ...new Set([...standardHeights, ...dynamicHeights]),
              ].sort((a, b) => a - b);

              let foundPlatform = false;
              let platformHeight = null;

              for (const height of allHeights) {
                // Check multiple X positions: center, slightly ahead, slightly behind
                const checkXPositions = [
                  p2.pos.x, // Center
                  p2.pos.x + danceZoneInfo.axis * 20, // Ahead in movement direction
                  p2.pos.x + danceZoneInfo.axis * 40, // Further ahead
                ];

                for (const checkX of checkXPositions) {
                  const checkY = p2.pos.y - height;
                  if (hasGroundBelow(checkX, checkY, state, 80, 6)) {
                    foundPlatform = true;
                    platformHeight = height;
                    break;
                  }
                }
                if (foundPlatform) break;
              }

              // Jump if: platform found OR zone is within reasonable jump distance
              shouldJump =
                foundPlatform || (verticalDist < 250 && verticalDist > 50);

              if (state.debug?.devMode && shouldJump && Math.random() < 0.15) {
                console.log(
                  `[NPC Vertical] Jumping UP: dy=${Math.round(
                    danceZoneInfo.dy
                  )}, platform=${foundPlatform}, platformHeight=${
                    platformHeight || "N/A"
                  }, dist=${Math.round(verticalDist)}, checkedHeights=${
                    allHeights.length
                  }`
                );
              }
            } else {
              // No semisolid data, but zone is within jump range
              shouldJump = verticalDist < 200 && verticalDist > 40;
            }

            if (shouldJump) {
              inputs.jump = true;
              inputs.jumpPressed = true;
              inputs.jumpHeld = true;
              jumpingForZone = true; // Mark that we're jumping for zone navigation
            }
          } else if (zoneBelow && grounded && verticalDist > 60) {
            // Zone is significantly below: Check if we're on a semisolid platform
            // If so, drop through the platform
            const onSemisolid = isOnSemisolidPlatform(p2, state);

            if (onSemisolid) {
              // Drop through semisolid platform
              inputs.down = true;
              inputs.axis = danceZoneInfo.axis; // Continue moving towards zone

              if (state.debug?.devMode && Math.random() < 0.2) {
                console.log(
                  `[NPC Vertical] DROP-THROUGH: dy=${Math.round(
                    danceZoneInfo.dy
                  )}, onSemisolid=true, moving towards zone`
                );
              }
            } else {
              // Not on semisolid, just move towards edge (will fall naturally)
              if (state.debug?.devMode && Math.random() < 0.1) {
                console.log(
                  `[NPC Vertical] Zone BELOW: dy=${Math.round(
                    danceZoneInfo.dy
                  )}, moving towards edge`
                );
              }
            }
          }
        }
      } else {
        // In zone (or no zone info)
        // If ZONE_DEFENSE, maybe adjust slightly to player if they are close?
        // But primarily stay in zone.
        if (distance < 150) {
          // Too close even for zone defense, make some space but try to stay in zone
          // This logic was previously "PRIORITY 2" blended
          const retreatDir = p2.pos.x < p1.pos.x ? -1 : 1;
          // Only retreat if it doesn't push us out of zone?
          // Simplified: blend retreat with zone pull
          inputs.axis = retreatDir * 0.6 + danceZoneInfo.axis * 0.4;
        } else {
          // Just center in zone
          if (danceZoneInfo.distance > 50) {
            inputs.axis = danceZoneInfo.axis * 0.5;
          }
        }
      }
    }

    // Edge detection: stop at gaps, decide on running jump if landing is possible
    // Skip if we're already jumping for vertical navigation (zone above)
    if (
      grounded &&
      inputs.axis !== 0 &&
      !jumpingForZone && // Don't interfere with vertical navigation jumps
      (state?.groundData || state?.semisolidData)
    ) {
      const edgeInfo = getEdgeInfo(p2, inputs.axis, state);
      if (edgeInfo.isGap) {
        const landingDistance = edgeInfo.landingDistance;
        const canJumpNow = canAttemptJump(p2, grounded, currentTime);
        const safeJumpDistance = 115;
        const maxDoubleJumpDistance = 280;
        const hasLanding =
          landingDistance !== null && landingDistance <= maxDoubleJumpDistance;
        const hasDoubleAvailable =
          typeof p2.jumpsLeft !== "number" || p2.jumpsLeft >= 2;
        const requiresDoubleJump =
          landingDistance !== null &&
          landingDistance > safeJumpDistance &&
          landingDistance <= maxDoubleJumpDistance &&
          hasDoubleAvailable;

        // Strategy override: If in SURVIVAL or ZONE_DEFENSE (and trying to reach zone), maybe risk jumps?
        // Standard logic is fairly safe.

        if (!hasLanding) {
          inputs.axis = 0;
          npcState.doubleJumpPlanned = false;
          npcState.doubleJumpPlanLanding = null;
        } else if (landingDistance <= safeJumpDistance && canJumpNow) {
          inputs.jump = true;
          inputs.jumpPressed = true;
          inputs.jumpHeld = true;
          inputs.axis = edgeInfo.direction;
          npcState.doubleJumpPlanned = false;
          npcState.doubleJumpPlanLanding = null;
          npcState.doubleJumpPlanStartX = p2.pos.x;
        } else if (requiresDoubleJump && canJumpNow) {
          inputs.jump = true;
          inputs.jumpPressed = true;
          inputs.jumpHeld = true;
          inputs.axis = edgeInfo.direction;
          npcState.doubleJumpPlanned = true;
          npcState.doubleJumpPlanDirection = edgeInfo.direction;
          npcState.doubleJumpPlanLanding = landingDistance;
          npcState.doubleJumpPlanStartX = p2.pos.x;
          npcState.doubleJumpPlanTime = currentTime;
        } else {
          inputs.axis = 0;
          npcState.doubleJumpPlanned = false;
          npcState.doubleJumpPlanLanding = null;
        }
      } else {
        npcState.doubleJumpPlanned = false;
        npcState.doubleJumpPlanLanding = null;
        npcState.doubleJumpPlanStartX = p2.pos.x;
      }
    }

    // Jump logic: jump if opponent is above and we're grounded
    // Only if we're not already jumping for zone navigation
    if (
      !jumpingForZone &&
      grounded &&
      canAttemptJump(p2, grounded, currentTime) &&
      p1.pos.y < p2.pos.y - 30 &&
      distance < 150
    ) {
      if (Math.random() < 0.3) {
        inputs.jump = true;
        inputs.jumpPressed = true;
        inputs.jumpHeld = true;
      }
    }

    // Airborne double jump logic for clearing wide gaps
    if (
      !grounded &&
      !inputs.jump &&
      !inputs.jumpPressed &&
      !npcState.doubleJumpUsed &&
      typeof p2.jumpsLeft === "number" &&
      p2.jumpsLeft > 0 &&
      canUseAbility(p2, "doubleJump")
    ) {
      const timeSinceJump = currentTime - npcState.lastJumpTime;
      if (timeSinceJump > 0.12) {
        const hasHeatmap = !!(state?.groundData || state?.semisolidData);
        const noGroundBelow =
          hasHeatmap && !hasGroundBelow(p2.pos.x, p2.pos.y + 24, state, 96);
        const planActive = npcState.doubleJumpPlanned;
        const plannedLanding = npcState.doubleJumpPlanLanding ?? null;
        const startX = npcState.doubleJumpPlanStartX ?? p2.pos.x;
        const horizontalProgress = Math.abs(p2.pos.x - startX);
        const progressRatio =
          planActive && plannedLanding
            ? horizontalProgress / Math.max(1, plannedLanding)
            : 0;
        const verticalVel = p2.vel?.y ?? 0;
        const falling = verticalVel >= -120;

        let direction = npcState.doubleJumpPlanDirection;
        if (!direction || direction === 0) {
          if (Math.abs(inputs.axis) > 0.1) {
            direction = inputs.axis > 0 ? 1 : -1;
          } else if (Math.abs(p2.vel?.x ?? 0) > 20) {
            direction = Math.sign(p2.vel.x);
          } else {
            direction = p2.facing >= 0 ? 1 : -1;
          }
        }

        let shouldDoubleJump = false;

        if (planActive) {
          shouldDoubleJump =
            timeSinceJump > 0.18 ||
            progressRatio >= 0.45 ||
            (falling && (progressRatio >= 0.3 || noGroundBelow));
        } else if (hasHeatmap && noGroundBelow && falling) {
          shouldDoubleJump = true;
        }

        if (shouldDoubleJump && hasHeatmap) {
          const edgeInfo = getEdgeInfo(p2, direction, state, {
            footY: p2.pos.y + 2,
            lookAhead: 56,
            dropDistance: 140,
            maxLandingDistance:
              plannedLanding !== null ? plannedLanding + 40 : 320,
          });

          if (edgeInfo.isGap && edgeInfo.landingDistance !== null) {
            const remaining = edgeInfo.landingDistance;
            const required =
              plannedLanding !== null ? Math.max(85, plannedLanding - 30) : 120;
            shouldDoubleJump = remaining > required;
          }
        }

        if (shouldDoubleJump) {
          inputs.jump = true;
          inputs.jumpPressed = true;
          if (typeof inputs.jumpHeld !== "boolean") {
            inputs.jumpHeld = false;
          }
          inputs.axis =
            inputs.axis !== 0
              ? inputs.axis
              : direction || (p2.facing >= 0 ? 1 : -1);
          npcState.doubleJumpUsed = true;
          npcState.doubleJumpPlanned = false;
          npcState.doubleJumpPlanLanding = null;
          npcState.doubleJumpPlanStartX = p2.pos.x;
        }
      }
    }

    return inputs;
  }

  // Phase 2: Basic Attack Decision
  function decideAttack(p1, p2, distance, grounded, state, currentTime) {
    const inputs = {
      r1Down: false,
      r2Down: false,
      l1Down: false,
      l2Down: false,
    };
    const timeSinceLastAction = currentTime - (npcState.lastActionTime || 0);
    const isInBeatWindow = Physics.isInBeatWindow
      ? Physics.isInBeatWindow(state)
      : false;
    const beatCharges = p2.perfectBeatCount || 0;
    const currentAnim = p2.anim || "";

    // CRITICAL: Don't attack if already in an attack animation
    const isInAttackAnim =
      currentAnim.includes("r1") ||
      currentAnim.includes("r2") ||
      currentAnim.includes("l1") ||
      currentAnim.includes("l2") ||
      currentAnim.includes("jab") ||
      currentAnim.includes("smash") ||
      currentAnim.includes("dash") ||
      currentAnim.includes("circle");

    // Don't attack if busy, stunned, or in attack animation
    if (
      p2.attack?.type !== "none" ||
      p2.stunT > 0 ||
      p2.roll?.active ||
      isInAttackAnim
    ) {
      if (state.debug?.devMode && isInAttackAnim && Math.random() < 0.1) {
        console.log(
          `[NPC Attack] BLOCKED - In attack anim: ${currentAnim}, attack.type: ${p2.attack?.type}`
        );
      }
      return inputs;
    }

    // Don't attack during beat window (unless we specifically want to disrupt?)
    // Usually we want to dance.
    if (isInBeatWindow) {
      return inputs;
    }

    const mode = npcState.strategy.currentMode;
    const attackCandidates = [];

    // Helper to check if attack is available (cooldown + ability check)
    const canAttack = (attackType, minCooldown = 0.3) => {
      return (
        canUseAbility(p2, attackType) &&
        npcState.attackCooldowns[attackType] <= 0 &&
        timeSinceLastAction > minCooldown
      );
    };

    // --- STRATEGY-BASED ATTACK SELECTION ---

    if (mode === "COMBAT_AGGRO") {
      // Aggressive: Prioritize R1 dash, R2, Combos
      if (distance < 180 && grounded && canAttack("r1", 0.25)) {
        attackCandidates.push({
          id: "r1",
          inputs: { r1Down: true },
          weight: 4,
        });
      }
      if (
        grounded &&
        beatCharges >= 2 &&
        distance < 250 &&
        canAttack("r1", 0.5)
      ) {
        attackCandidates.push({
          id: "double_dash",
          inputs: { r1Down: true },
          weight: 6,
          doubleDash: true,
        });
      }
      if (distance < 220 && grounded && canAttack("r2", 0.4)) {
        attackCandidates.push({
          id: "r2",
          inputs: { r2Down: true },
          weight: 3,
        });
      }
      // Air attacks
      if (!grounded && canAttack("r1", 0.3)) {
        attackCandidates.push({
          id: "air_r1",
          inputs: { r1Down: true },
          weight: 3,
        });
      }
    } else if (mode === "ZONE_DEFENSE") {
      // Defensive: Keep away (L1), Punish approaches (L2), quick get-off-me (R1)
      if (distance < 120 && grounded && canAttack("r1", 0.3)) {
        attackCandidates.push({
          id: "r1",
          inputs: { r1Down: true },
          weight: 5,
        }); // Get off me
      }
      // L1 only if far away AND with longer cooldown to prevent spam
      if (distance > 200 && canAttack("l1", 2.0)) {
        attackCandidates.push({
          id: "l1",
          inputs: { l1Down: true },
          weight: 4,
        }); // Ranged/Special harass
      }
      if (
        distance > 150 &&
        distance < 300 &&
        canAttack("l2", 1.5) &&
        !npcState.l2Charging
      ) {
        attackCandidates.push({
          id: "l2",
          inputs: { l2Down: true },
          weight: 3,
        }); // Charge attack zoning
      }
    } else if (mode === "RESOURCE_GATHER") {
      // Minimal attacks, only self-defense
      if (distance < 100 && grounded && canAttack("r1", 0.3)) {
        attackCandidates.push({
          id: "r1",
          inputs: { r1Down: true },
          weight: 5,
        });
      }
    } else if (mode === "SURVIVAL") {
      // Desperate measures (L1, maybe R1 to interrupt)
      if (distance < 150 && canAttack("r1", 0.2)) {
        attackCandidates.push({
          id: "r1",
          inputs: { r1Down: true },
          weight: 5,
        });
      }
      if (canAttack("l1", 0.5)) {
        attackCandidates.push({
          id: "l1",
          inputs: { l1Down: true },
          weight: 2,
        });
      }
    }

    // Fallback/General: L1 is usually good if far away (with long cooldown)
    if (distance > 400 && canAttack("l1", 3.0)) {
      attackCandidates.push({
        id: "l1",
        inputs: { l1Down: true },
        weight: 1,
      });
    }

    if (attackCandidates.length === 0) {
      return inputs;
    }

    const chosen = chooseWeightedCandidate(attackCandidates);
    if (!chosen) {
      return inputs;
    }

    // Set cooldown based on attack type
    const cooldownMap = {
      r1: 0.8,
      r2: 1.2,
      l1: 2.5, // Longer cooldown for L1 to prevent spam
      l2: 2.0,
      air_r1: 0.6,
      double_dash: 1.5,
    };
    const attackType =
      chosen.id === "double_dash" || chosen.id === "air_r1" ? "r1" : chosen.id;
    npcState.attackCooldowns[attackType] = cooldownMap[chosen.id] || 1.0;

    npcState.lastAttackType = chosen.id;
    npcState.lastActionTime = currentTime;
    if (chosen.id === "l2") {
      npcState.l2Charging = true;
      npcState.l2ChargeStart = currentTime;
    }

    // Logging for attack decisions
    if (state.debug?.devMode) {
      console.log(
        `[NPC Attack] Selected: ${
          chosen.id
        } | Mode: ${mode} | Dist: ${Math.round(distance)} | Cooldowns:`,
        {
          r1: npcState.attackCooldowns.r1.toFixed(2),
          r2: npcState.attackCooldowns.r2.toFixed(2),
          l1: npcState.attackCooldowns.l1.toFixed(2),
          l2: npcState.attackCooldowns.l2.toFixed(2),
          anim: currentAnim,
          attackType: p2.attack?.type,
        }
      );
    }

    return { ...chosen.inputs, doubleDash: !!chosen.doubleDash };
  }

  // Phase 3: Special Attack Decision
  function decideSpecialAttack(p1, p2, distance, grounded, state) {
    const inputs = {};
    const currentTime = performance.now() * 0.001;

    if (
      p2.attack?.type !== "none" ||
      !canUseAbility(p2, "r1") ||
      currentTime - npcState.lastActionTime < 0.3
    ) {
      return inputs;
    }

    // R1 Circle Attack (close range, grounded)
    if (distance < 100 && grounded && Math.random() < 0.3) {
      inputs.r1CircleDown = true;
      npcState.lastAttackType = "r1_circle";
      npcState.lastActionTime = currentTime;
      return inputs;
    }

    // R1 Up Attack (aerial advantage)
    if (
      !grounded &&
      p2.pos.y < p1.pos.y - 20 &&
      distance < 150 &&
      Math.random() < 0.2
    ) {
      inputs.l3UpR1Down = true;
      inputs.r1Down = true; // Required for l3UpR1Down
      npcState.lastAttackType = "r1_up";
      npcState.lastActionTime = currentTime;
      return inputs;
    }

    // R1 Dash Attack (double-tap detection)
    if (
      distance < 150 &&
      grounded &&
      currentTime - npcState.lastR1Time < 0.2 &&
      npcState.lastR1Time > 0
    ) {
      let nearEdge = false;
      if (state?.groundData || state?.semisolidData) {
        const dashDir = p2.facing >= 0 ? 1 : -1;
        const edgeInfo = getEdgeInfo(p2, dashDir, state, {
          lookAhead: 48,
          dropDistance: 64,
          maxLandingDistance: 220,
        });
        nearEdge =
          edgeInfo.isGap &&
          (edgeInfo.landingDistance === null || edgeInfo.landingDistance < 120);
      }

      if (!nearEdge) {
        inputs.r1Down = true;
        npcState.lastAttackType = "r1_dash";
        npcState.lastActionTime = currentTime;
        npcState.lastR1Time = 0; // Reset
        return inputs;
      }

      // Unsafe to dash near edge; reset detection window to prevent spam
      npcState.lastR1Time = 0;
    }

    // Track R1 presses for dash detection
    if (inputs.r1Down) {
      npcState.lastR1Time = currentTime;
    }

    return inputs;
  }

  // Phase 4: Combo Detection
  function isInComboWindow(p2, state) {
    if (!p2.attack || p2.attack.type === "none") return false;

    // Check if in combo state
    if (p2.attack.comboStep && p2.attack.comboStep > 0) {
      return true;
    }

    // Check combo window from character config
    if (window.CharacterCatalog && window.CharacterCatalog.getAttackConfig) {
      const charKey = p2.charName?.toLowerCase();
      const cfg = window.CharacterCatalog.getAttackConfig(charKey, state);
      if (cfg && cfg.r1 && cfg.r1.comboWindowStartFrame) {
        // Check if in combo window based on frame index
        const frameIndex = p2.frameIndex || 0;
        const comboWindowStart = cfg.r1.comboWindowStartFrame || 0;
        if (
          frameIndex >= comboWindowStart &&
          frameIndex < comboWindowStart + 10
        ) {
          return true;
        }
      }
    }

    return false;
  }

  // Phase 5: Ultimate Decision (kept for backwards compatibility, but now handled directly in getInputs)
  // Ultimate is now always used when full (handled in Priority 2 of getInputs)
  function shouldUseUltimate(p1, p2, state) {
    // This function is now deprecated - ultimate is handled directly in getInputs
    // when canUseUltimate returns true
    return false;
  }

  // Improved attack detection - check for different attack phases
  function detectIncomingAttack(p1, p2) {
    if (!p1.attack || p1.attack.type === "none") return null;

    const distance = Math.abs(p1.pos.x - p2.pos.x);
    const attackInfo = {
      type: p1.attack.type,
      phase: p1.attack.phase,
      distance: distance,
      direction: p1.facing,
      isClose: distance < 120, // Close range threshold
      isFar: distance > 200, // Far range threshold
    };

    return attackInfo;
  }

  // Smart dodge direction based on attack type and position
  function getDodgeDirection(attackInfo, p1, p2) {
    if (!attackInfo) return 0;

    // For close attacks, dodge away from attacker
    if (attackInfo.isClose) {
      return p2.pos.x < p1.pos.x ? -1 : 1;
    }

    // For ranged attacks, dodge towards attacker to close distance
    if (
      attackInfo.isFar &&
      (attackInfo.type.includes("r1") || attackInfo.type.includes("l1"))
    ) {
      return p2.pos.x < p1.pos.x ? 1 : -1;
    }

    // Default: dodge away
    return p2.pos.x < p1.pos.x ? -1 : 1;
  }

  // Generate fake inputs for Player 2
  function getInputs(state, playerIndex) {
    if (!enabled || playerIndex !== 1) {
      return null; // Only control P2
    }

    const p2 = state.players?.[1];
    const p1 = state.players?.[0];
    if (!p2 || !p1) return null;

    const currentTime = performance.now() * 0.001;
    const dt = 1 / 60; // Assume 60fps

    // --- Update Strategy ---
    updateStrategy(p1, p2, state, currentTime);

    const distance = Math.abs(p1.pos.x - p2.pos.x);
    const grounded = !!p2.grounded;
    const danceSpotGuard = getDanceSpotGuardAxis(p2, state);
    const beatChargeOpportunity = shouldCollectBeatCharges(p2, distance, state);

    if (grounded) {
      npcState.doubleJumpUsed = false;
      npcState.doubleJumpPlanned = false;
      npcState.doubleJumpPlanLanding = null;
      npcState.doubleJumpPlanDirection = p2.facing >= 0 ? 1 : -1;
      npcState.doubleJumpPlanStartX = p2.pos.x;
      npcState.doubleJumpPlanTime = 0;
    }

    const opponentAttack = p1.attack;
    const opponentType = opponentAttack?.type ?? "none";
    const opponentPhase = opponentAttack?.phase ?? "none";

    if (!opponentAttack || opponentType === "none") {
      if (npcState.lastTrackedAttackRef !== null) {
        npcState.lastTrackedAttackRef = null;
      }
      npcState.lastOpponentAttackPhase = "none";
      npcState.dodgeAttemptedForCurrentAttack = false;
      npcState.shouldDodgeThisAttack = false;
    } else {
      const attackRefChanged = npcState.lastTrackedAttackRef !== opponentAttack;
      const previousPhase = npcState.lastOpponentAttackPhase ?? "none";
      const newAttackDetected =
        attackRefChanged ||
        previousPhase === "none" ||
        previousPhase === undefined;

      if (newAttackDetected) {
        npcState.lastTrackedAttackRef = opponentAttack;
        npcState.dodgeAttemptedForCurrentAttack = false;
        npcState.shouldDodgeThisAttack = false;
        npcState.incomingAttackCounter =
          (npcState.incomingAttackCounter || 0) + 1;

        if (!npcState.nextDodgeAttempt || npcState.nextDodgeAttempt < 1) {
          npcState.nextDodgeAttempt = getRandomDodgeInterval();
        }

        if (npcState.incomingAttackCounter >= npcState.nextDodgeAttempt) {
          npcState.shouldDodgeThisAttack = true;
          npcState.incomingAttackCounter = 0;
          npcState.nextDodgeAttempt = getRandomDodgeInterval();
        }
      }

      npcState.lastOpponentAttackPhase = opponentPhase;
    }

    // Update dodge cooldown
    if (dodgeCooldown > 0) {
      dodgeCooldown -= dt;
    }

    // Update combo step tracking
    if (p2.attack && p2.attack.comboStep) {
      npcState.comboStep = p2.attack.comboStep;
    } else if (p2.attack?.type === "none") {
      npcState.comboStep = 0;
    }

    // Track last hit time (if p2 successfully hit p1)
    if (p2.attack?.didHitThisFrame) {
      npcState.lastHitTime = currentTime;
    }

    const inputs = {
      axis: 0,
      jumpPressed: false,
      jump: false,
      jumpHeld: false,
      l1Held: false,
      l1Down: false,
      l1Up: false,
      l2Held: false,
      l2Down: false,
      l2Up: false,
      r1Held: false,
      r1Down: false,
      r1Up: false,
      r2Held: false,
      r2Down: false,
      rollDown: false,
      downHeld: false,
      grabDown: false, // Formerly danceBattleDown
      ultiDown: false,
      r1CircleDown: false,
      l3UpR1Down: false,
      danceDown: false,
    };

    applyPendingDoubleDash(inputs, p2, currentTime);

    // Phase 6: Recovery handling - wait if stunned or recovering
    if ((p2.stunT && p2.stunT > 0) || p2.isInvincible) {
      // Only allow movement during recovery
      const movement = decideMovement(
        p1,
        p2,
        distance,
        grounded,
        state,
        currentTime
      );
      if (danceSpotGuard.weight > 0.25 && Math.abs(danceSpotGuard.axis) > 0.1) {
        movement.axis = danceSpotGuard.axis;
      }
      Object.assign(inputs, movement);
      return finalizeInputs(inputs, currentTime);
    }

    // Priority 1: DODGE LOGIC (if incoming attack detected)
    const attackInfo = detectIncomingAttack(p1, p2);
    const canDodge =
      dodgeCooldown <= 0 && !p2.roll?.active && !p2.shield?.active;

    let shouldDodge = false;
    let dodgeDirectionOverride = null;

    if (attackInfo && canDodge) {
      // Different dodge strategies based on attack type
      switch (attackInfo.type) {
        case "r1":
        case "r1_combo":
        case "r1_combo_active": {
          // Quick attacks - dodge during startup/active, even at mid range occasionally
          const threatPhase =
            attackInfo.phase === "active" || attackInfo.phase === "startup";
          if (threatPhase) {
            shouldDodge =
              attackInfo.distance < 150 ||
              (attackInfo.distance < 180 && Math.random() < 0.2);
          }
          break;
        }

        case "r2":
        case "r2_combo": {
          // Heavy attacks - give more buffer; dodge during startup or active
          const threatPhase =
            attackInfo.phase === "active" || attackInfo.phase === "startup";
          if (threatPhase) {
            shouldDodge =
              attackInfo.distance < 170 ||
              (attackInfo.distance < 210 && Math.random() < 0.2);
          }
          break;
        }

        case "l1":
        case "l1_ranged_grab": {
          // Ranged attacks - dodge when close or to close space with some randomness
          if (attackInfo.phase === "active") {
            shouldDodge = attackInfo.distance < 170;
          }
          break;
        }

        case "l2": {
          // Charged heavies - dodge as soon as they go active, even mid range
          if (attackInfo.phase === "active" || attackInfo.phase === "startup") {
            shouldDodge =
              attackInfo.distance < 180 ||
              (attackInfo.distance < 220 && Math.random() < 0.2);
          }
          break;
        }

        default:
          // Generic dodge for unknown attacks
          if (attackInfo.phase === "active") {
            shouldDodge = attackInfo.distance < 180 && attackInfo.isClose;
          }
      }
    }

    const attemptThisAttack =
      attackInfo &&
      npcState.shouldDodgeThisAttack &&
      !npcState.dodgeAttemptedForCurrentAttack;

    if (attemptThisAttack && canDodge) {
      if (!shouldDodge) {
        const phaseName = attackInfo.phase;
        if (
          phaseName === "start" ||
          phaseName === "startup" ||
          phaseName === "charge" ||
          phaseName === "active"
        ) {
          shouldDodge = true;
        }
      }
    } else {
      shouldDodge = false;
    }

    shouldDodge = shouldDodge && attemptThisAttack && canDodge;

    if (shouldDodge) {
      let axisDir =
        (dodgeDirectionOverride ?? getDodgeDirection(attackInfo, p1, p2)) ||
        (p2.pos.x < p1.pos.x ? -1 : 1);

      if (state?.groundData || state?.semisolidData) {
        const edgeInfo = getEdgeInfo(p2, axisDir, state, {
          lookAhead: 32,
          dropDistance: 60,
        });
        if (edgeInfo.isGap) {
          const opposite = -axisDir;
          const oppositeSafe = getEdgeInfo(p2, opposite, state, {
            lookAhead: 28,
            dropDistance: 60,
          });
          if (!oppositeSafe.isGap) {
            axisDir = opposite;
          } else {
            axisDir = 0;
          }
        }
      }

      if (axisDir === 0) {
        axisDir = p2.pos.x < p1.pos.x ? -1 : 1;
      }

      inputs.rollDown = true;
      inputs.axis = axisDir;
      dodgeCooldown = 1.2; // 1.2s cooldown between dodges
      lastRollTime = currentTime;
      npcState.dodgeAttemptedForCurrentAttack = true;
      npcState.shouldDodgeThisAttack = false;
      return finalizeInputs(inputs, currentTime); // Dodge takes priority, return immediately
    }

    // Priority 2: ULTIMATE (if ready - ALWAYS use when full, highest priority!)
    // Check if ultimeter is full first (most important)
    if (window.UltimeterManager && window.UltimeterManager.canUseUltimate) {
      // Prevent NPC from using ultimate automatically during Tutorial Part 2
      const inTutorialPart2 =
        state.tutorial?.active && state.tutorial.part === 2;
      const safeUlt = canAttemptUltimateSafely(p2, p1, state);

      if (
        window.UltimeterManager.canUseUltimate(p2) &&
        canUseAbility(p2, "ultimate") &&
        safeUlt &&
        !inTutorialPart2
      ) {
        // Always use ultimate when full (except during tutorial part 2)
        inputs.ultiDown = true;
        npcState.lastActionTime = currentTime;
        npcState.lastDecision = "ULTIMATE";
        return finalizeInputs(inputs, currentTime); // Ultimate takes highest priority when full
      }
    }

    // Priority 2.1: HP ULTIMATE ACTIVE - Full Aggro Mode (ignore zone, chase player)
    const charKey = (p2.charName || "").toLowerCase();
    if (charKey === "hp" && isHPUltimateActive(p2)) {
      // Full aggressive movement towards player, ignore zone behavior
      const dx = p1.pos.x - p2.pos.x;
      inputs.axis = dx > 0 ? 1.0 : -1.0;
      // Try to jump if player is above
      if (
        p1.pos.y < p2.pos.y - 40 &&
        grounded &&
        canAttemptJump(p2, grounded, currentTime)
      ) {
        inputs.jump = true;
        inputs.jumpPressed = true;
        inputs.jumpHeld = true;
      }
      // Attack aggressively if in range
      if (
        distance < 200 &&
        p2.attack?.type === "none" &&
        canUseAbility(p2, "r1")
      ) {
        inputs.r1Down = true;
      }
      npcState.lastDecision = "HP_ULTI_AGGRO";
      return finalizeInputs(inputs, currentTime);
    }

    // Priority 2.25: ANTI-CHARGE GRAB (steal opponent's beat charges immediately)
    // If the opponent has accumulated 3+ perfect beat charges, attempt a close-range grab
    // Conditions: grounded, not performing another action, in melee range, grab available
    const opponentBeatCharges = p1.perfectBeatCount || 0;
    if (
      opponentBeatCharges >= 3 &&
      p2.attack?.type === "none" &&
      !p2.roll?.active &&
      grounded &&
      canUseAbility(p2, "grab") &&
      currentTime - (npcState.lastActionTime || 0) > 0.3
    ) {
      // Approximate melee grab reach: horizontal < ~120, vertical overlap small
      const dx = Math.abs(p1.pos.x - p2.pos.x);
      const dy = Math.abs(p1.pos.y - p2.pos.y);
      const inMeleeRange = dx < 120 && dy < 80;
      if (inMeleeRange) {
        inputs.grabDown = true;
        npcState.lastActionTime = currentTime;
        npcState.lastDecision = "ANTI_CHARGE_GRAB";
        return finalizeInputs(inputs, currentTime);
      }
    }

    // Priority 2.5: BEAT CHARGE COLLECTION (if in zone and not threatened)
    const inZone = isInActiveDanceZone(p2, state);
    const isThreatened =
      isPlayerThreatening(p1, p2, distance, state) ||
      distance < PROX_THREAT_DISTANCE; // Distance alone can threaten
    const isInBeatWindow = Physics.isInBeatWindow
      ? Physics.isInBeatWindow(state)
      : false;

    // If in zone, not threatened, and in beat window -> collect charges
    if (
      inZone &&
      !isThreatened &&
      isInBeatWindow &&
      p2.attack?.type === "none" &&
      !p2.roll?.active &&
      (p2.perfectBeatCount || 0) < 9
    ) {
      inputs.danceDown = true;
      // Still allow movement to stay in zone center, but prioritize dancing
      // Don't return - let movement blend with dance
    }

    // Priority 3: DANCE MOVES (only during active dance battle - reduced frequency)
    // NPC should only REACT to dance battles, not trigger them
    if (state.danceBattle?.active) {
      const isInBeatWindow = Physics.isInBeatWindow
        ? Physics.isInBeatWindow(state)
        : false;
      const beatQuality = Physics.getBeatWindowQuality
        ? Physics.getBeatWindowQuality(state)
        : null;

      // Reduced dance frequency - only dance occasionally during dance battle
      if (isInBeatWindow && (!p2.attack || p2.attack.type === "none")) {
        const isDancing = p2.anim?.includes("dance");
        if (!isDancing && !p2.roll?.active) {
          // Lower chance - only dance 20% of time (reduced from higher values)
          const danceChance = beatQuality === "perfect" ? 0.3 : 0.15;
          if (Math.random() < danceChance) {
            inputs.danceDown = true;
            npcState.lastDanceTime = currentTime;
            return finalizeInputs(inputs, currentTime);
          }
        }
      }
    }

    // Handle L2 Charge state (if currently charging)
    if (npcState.l2Charging) {
      if (p2.attack?.type === "l2" || p2.attack?.type === "l2_ranged") {
        // Keep holding L2 during charge
        inputs.l2Held = true;
        // Release after 0.5-1.0 seconds of charge (randomized)
        const chargeDuration = currentTime - npcState.l2ChargeStart;
        const maxChargeTime = 0.6 + Math.random() * 0.4; // 0.6-1.0 seconds
        if (chargeDuration > maxChargeTime || p2.attack.phase === "release") {
          inputs.l2Up = true;
          npcState.l2Charging = false;
          npcState.l2ChargeStart = 0;
        }
      } else {
        // Attack ended, reset charging state
        npcState.l2Charging = false;
        npcState.l2ChargeStart = 0;
      }
    }
    // Tutorial deterministic beat-charge collection (Part 2: beat charge task)
    if (
      state.tutorial?.active &&
      state.tutorial.part === 2 &&
      state.tutorial.part2?.currentStep === "beat_charge_task"
    ) {
      // If NPC hasn't reached the desired perfect-beat count, attempt to dance
      const target = npcState.beatChargeTarget || 4;
      const currentCharges = p2.perfectBeatCount || 0;
      const inBeatWindow = Physics.isInBeatWindow
        ? Physics.isInBeatWindow(state)
        : false;

      // If we haven't reached target, dance on beat windows deterministically
      if (!npcState.beatAggressiveMode && currentCharges < target) {
        if (
          inBeatWindow &&
          currentTime - (npcState.lastBeatDanceAttempt || 0) > 0.12 &&
          (!p2.attack || p2.attack.type === "none") &&
          !p2.roll?.active
        ) {
          inputs.danceDown = true;
          npcState.lastBeatDanceAttempt = currentTime;
          return finalizeInputs(inputs, currentTime);
        }
        // not in beat window or cooldown, fall through to movement/other logic
      }

      // If we've reached the target, enter aggressive mode: spam attacks until hit or grabbed
      if (!npcState.beatAggressiveMode && currentCharges >= target) {
        npcState.beatAggressiveMode = true;
      }

      if (npcState.beatAggressiveMode) {
        // If player grabbed NPC or charges were stolen, stop aggressive mode
        if (p2.isGrabbed || (p2.perfectBeatCount || 0) < target) {
          npcState.beatAggressiveMode = false;
        } else {
          // Try to attack repeatedly until we hit the player (or get grabbed)
          if (p2.attack?.type === "none" && canUseAbility(p2, "r1")) {
            inputs.r1Down = true;
            npcState.lastActionTime = currentTime;
            return finalizeInputs(inputs, currentTime);
          }
        }
      }
    }

    // Priority 4: ATTACKS (only if threatened OR not in zone)
    // In zone + not threatened = passive (collect beats)
    // Outside zone OR threatened = aggressive
    const isDancing = p2.anim?.includes("dance");
    const shouldBeAggressive = !inZone || isThreatened;

    if (
      shouldBeAggressive &&
      p2.attack?.type === "none" &&
      !p2.roll?.active &&
      !p2.shield?.active &&
      !npcState.l2Charging &&
      !isDancing // Don't attack while dancing
    ) {
      // Phase 4: Check for combo followup first
      if (isInComboWindow(p2, state)) {
        // Continue combo
        if (npcState.lastAttackType === "r1" && canUseAbility(p2, "r1")) {
          inputs.r1Down = true;
          npcState.lastActionTime = currentTime;
          return finalizeInputs(inputs, currentTime);
        }
      }

      // Phase 3: Try special attacks first (higher priority)
      const specialAttack = decideSpecialAttack(
        p1,
        p2,
        distance,
        grounded,
        state
      );
      if (Object.keys(specialAttack).length > 0) {
        Object.assign(inputs, specialAttack);
        return finalizeInputs(inputs, currentTime);
      }

      // Phase 2: Basic attacks
      const attack = decideAttack(
        p1,
        p2,
        distance,
        grounded,
        state,
        currentTime
      );
      if (Object.keys(attack).length > 0) {
        const doubleDashFlag = attack.doubleDash;
        const attackInputs = { ...attack };
        delete attackInputs.doubleDash;
        Object.assign(inputs, attackInputs);
        if (doubleDashFlag) {
          queueDoubleDashTap(currentTime);
        }
        // Track R1 for dash detection
        if (attackInputs.r1Down) {
          npcState.lastR1Time = currentTime;
        }
        return finalizeInputs(inputs, currentTime);
      }
    }

    // Priority 5: MOVEMENT (always active if not in attack/locked)
    // decideMovement now handles zone navigation internally with higher priority
    const movement = decideMovement(
      p1,
      p2,
      distance,
      grounded,
      state,
      currentTime
    );

    Object.assign(inputs, movement);

    // Logging for Behavior Tracking
    if (state.debug?.devMode && Math.random() < 0.02) {
      const inZone = isInActiveDanceZone(p2, state);
      const currentAnim = p2.anim || "";
      const isInAttackAnim =
        currentAnim.includes("r1") ||
        currentAnim.includes("r2") ||
        currentAnim.includes("l1") ||
        currentAnim.includes("l2") ||
        currentAnim.includes("jab") ||
        currentAnim.includes("smash") ||
        currentAnim.includes("dash");

      const decision = inputs.rollDown
        ? "DODGE"
        : inputs.ultiDown
        ? "ULTIMATE"
        : inputs.grabDown
        ? "GRAB"
        : inputs.r1Down || inputs.r2Down || inputs.l1Down || inputs.l2Down
        ? `ATTACK_${npcState.lastAttackType}`
        : inputs.danceDown
        ? "CHARGE_BEAT"
        : Math.abs(inputs.axis) > 0
        ? `MOVE_${inputs.axis > 0 ? "RIGHT" : "LEFT"}`
        : "IDLE";

      const zoneDy = danceSpotGuard.dy ? Math.round(danceSpotGuard.dy) : 0;
      const verticalAction =
        inputs.jump || inputs.jumpPressed ? "JUMP" : "GROUND";

      console.log(
        `[NPC] Mode: ${npcState.strategy.currentMode} | State: ${decision} | ${verticalAction}`,
        {
          aggro: npcState.playerProfile.aggressionScore.toFixed(2),
          dist: Math.round(distance),
          charges: p2.perfectBeatCount || 0,
          inZone: inZone ? "YES" : "NO",
          guard: danceSpotGuard.weight.toFixed(2),
          zoneDy: zoneDy,
          needsVertical: danceSpotGuard.needsVertical ? "YES" : "NO",
          anim: currentAnim.substring(0, 20),
          inAttackAnim: isInAttackAnim ? "YES" : "NO",
          attackType: p2.attack?.type || "none",
          grounded: grounded ? "YES" : "NO",
          cooldowns: {
            r1: npcState.attackCooldowns.r1.toFixed(1),
            l1: npcState.attackCooldowns.l1.toFixed(1),
          },
        }
      );
    }

    // REMOVED: NPC no longer triggers dance battles - only reacts to them
    // Dance battle logic is now only in Priority 3 (during active dance battle)

    return finalizeInputs(inputs, currentTime);
  }

  return {
    toggle,
    enable,
    disable,
    isEnabled,
    getInputs,
  };
})();
