window.CharacterCatalog = (() => {
  /**
   * Centralized character configuration system.
   * Single source of truth for all character data including physics, attacks, and abilities.
   *
   * This system provides a unified interface for accessing character-specific data,
   * replacing the scattered configuration across JSON files and hardcoded values.
   */

  const DEFAULT_PHYSICS = {
    gravity: 2800, // Increased from 2400 for heavier feel (17% stronger)
    moveSpeed: 520,
    airControl: 0.6,
    accel: 3200,
    jumpSpeed: 880,
    maxFall: 3000, // Increased from 2600 for more dynamic falling (15% faster)
    friction: 0.85,
    airResistance: 0.98, // Base air resistance (now enhanced with velocity-dependent drag)
  };

  /**
   * Get physics configuration for a character
   * @param {string} charName - Character name
   * @param {Object} state - Game state object
   * @returns {Object} Physics configuration
   */
  function getPhysicsConfig(charName, state = {}) {
    const charData = state?.characterConfigs?.[charName];
    const config = charData?.config?.physics;

    if (!config) {
      console.warn(
        `[CharacterCatalog] No physics config for ${charName}, using defaults`
      );
      return { ...DEFAULT_PHYSICS };
    }

    return {
      gravity: config.gravity ?? DEFAULT_PHYSICS.gravity,
      moveSpeed: config.moveSpeed ?? DEFAULT_PHYSICS.moveSpeed,
      airControl: config.airControl ?? DEFAULT_PHYSICS.airControl,
      accel: config.accel ?? DEFAULT_PHYSICS.accel,
      jumpSpeed: config.jumpSpeed ?? DEFAULT_PHYSICS.jumpSpeed,
      maxFall: config.maxFall ?? DEFAULT_PHYSICS.maxFall,
      friction: DEFAULT_PHYSICS.friction, // Global, not per-character
      airResistance: DEFAULT_PHYSICS.airResistance, // Global, not per-character
    };
  }

  /**
   * Get attack descriptor for a character and attack type
   * @param {Object} attacker - Attacker object with charName
   * @param {string} attackType - Type of attack
   * @param {Object} context - Additional context for attack calculation
   * @returns {Object} Attack descriptor
   */
  function getAttackDescriptor(attacker, attackType, context = {}) {
    // Delegate to existing AttackCatalog if available
    if (window.AttackCatalog && window.AttackCatalog.getDescriptor) {
      return window.AttackCatalog.getDescriptor(attacker, attackType, context);
    }

    // Fallback if AttackCatalog not available
    console.warn(
      `[CharacterCatalog] AttackCatalog not available, using fallback for ${attacker?.charName}:${attackType}`
    );
    return {
      id: `${attacker?.charName || "unknown"}:${attackType || "unknown"}`,
      attackType: attackType || "unknown",
      charName: attacker?.charName || null,
      tier: "BASIC",
      priority: 40,
      chargeRank: 0,
      clankable: true,
      fx: {},
      baseDamage: 4,
      baseKnockback: 125,
      knockbackExponent: 1.2,
      stunDuration: 0.15,
      knockbackType: "standard",
      knockbackAngle: 45,
      activeFrame: 2,
      metadata: {
        basePriority: 40,
        tierPriority: 40,
        chargePriorityBonus: 0,
        maxCharge: null,
        guardBreak: false,
      },
    };
  }

  /**
   * Get complete character data including physics and attack methods
   * @param {string} charName - Character name
   * @param {Object} state - Game state object
   * @returns {Object} Complete character data object
   */
  function getCharacterData(charName, state = {}) {
    return {
      physics: getPhysicsConfig(charName, state),
      attackDescriptor: (attackType, context = {}) =>
        getAttackDescriptor({ charName }, attackType, context),
      charName: charName,
      attackConfig: getAttackConfig(charName, state),
    };
  }

  /**
   * Get character-specific ability cooldowns
   * @param {string} charName - Character name
   * @param {Object} state - Game state object
   * @returns {Object} Cooldown configuration
   */
  function getCooldownConfig(charName, state = {}) {
    // For now, use global cooldown config
    // TODO: Add character-specific cooldowns in the future
    return (
      state?.cooldownConfig || {
        r1: 0,
        r2: 0,
        l1: 0,
        l2: 0,
        ultimate: 0,
        roll: 0,
        shield: 0,
        doubleJump: 0,
        beatReduction: 0.5,
      }
    );
  }

  /**
   * Check if a character has a specific ability
   * @param {string} charName - Character name
   * @param {string} ability - Ability name
   * @returns {boolean} Whether character has the ability
   */
  function hasAbility(charName, ability) {
    // TODO: Add character-specific ability definitions
    // For now, all characters have all abilities
    return true;
  }

  /**
   * Get character-specific animation configuration
   * @param {string} charName - Character name
   * @param {Object} state - Game state object
   * @returns {Object} Animation configuration
   */
  function getAnimationConfig(charName, state = {}) {
    const charData = state?.characterConfigs?.[charName];
    return {
      fps: charData?.fps ?? 12,
      animations: charData?.animations ?? {},
      frames: charData?.frames ?? {},
    };
  }

  /**
   * Get character-specific move damage values
   * @param {string} charName - Character name
   * @param {Object} state - Game state object
   * @returns {Object} Move damage configuration
   */
  function getMoveConfig(charName, state = {}) {
    const charData = state?.characterConfigs?.[charName];
    const moves = charData?.config?.moves || {};

    return {
      r1_jump_damage: moves.r1_jump_damage ?? 10,
      r1_dash_attack_damage: moves.r1_dash_attack_damage ?? 8,
      l1_bomb_damage: moves.l1_bomb_damage ?? 15,
      // Add more move damage values as needed
    };
  }

  /**
   * Get character-specific attack configuration
   * @param {string} charName - Character name
   * @param {Object} state - Game state object
   * @returns {Object} Attack configuration
   */
  function getAttackConfig(charName, state = {}) {
    const configs = {
      fritz: {
        r1: {
          dashTapWindow: 0.2,
          animSpeed: 1.0,
          loopTickDamage: 4,
          releaseDamage: 5,
          comboWindowStartFrame: 1,
        },
        r1_dash_attack: {
          animSpeed: 0.85,
          horizontalSpeedMultiplier: 1.3,
          landingFriction: 0.7,
        },
        r1_jump: {
          horizontalSpeedMultiplier: 2.7,
          landingFriction: 0.8,
        },
        r1_combo: {
          animSpeed: 2.0,
          dashDistance: 193,
          dragOffset: 60,
        },
        r2: {
          baseDashSpeed: 1800, // Reduced from 3200 to 1800 for dodgeable dash attacks
          maxCharge: 2.0,
          comboWindowFrames: 2,
          chargeThresholds: [0.8, 1.5, 2.0],
          dashMultipliers: [0.6, 0.8, 1.0], // Adjusted to maintain same ranges (was 1.2, 1.6, 2.0)
          animSpeed: 0.75,
        },
        l1_smash: {
          maxCharge: 2.0,
          maxChargeThreshold: 0.9,
          chargeThresholds: [0.3, 0.8, 1.5],
          damageStages: [8, 12, 16, 20],
        },
        l1_jab: {
          animSpeed: 1.0,
          queueWindowFrame: 2,
          dashMultipliers: [0.6, 0.7],
        },
        l1_jab_combo: {
          animSpeed: 1.0,
          maxSteps: 2,
          dashMultipliers: [0.6, 0.7],
          queueWindowFrames: [1, 0],
          stepDamage: [6, 10],
        },
        l2: {
          maxCharge: 2.5,
          releaseSlowdown: 0.3,
          releaseMaxDistance: 220,
          dotInterval: 0.15,
          dotDamagePerTick: 6,
        },
        r1_jump: {
          horizontalSpeedMultiplier: 2.7,
          landingFriction: 0.8,
          purelyHorizontal: true,
        },
        r1_dash_attack: {
          horizontalSpeedMultiplier: 2.0, // Reduced from 4.0 to 2.0 for dodgeable dash attacks
          landingFriction: 0.7,
          animSpeed: 0.525,
        },
        ultimate: {
          duration: 6.0, // Standard duration
        },
      },
      cyboard: {
        r1: {
          animSpeed: 2.5,
          maxCharge: 2.0,
          chargeThresholds: [0.6, 1.2, 1.8],
          damageTiers: [2, 5, 7, 10],
          stunTiers: [0.18, 0.22, 0.27, 0.32],
          knockbackTiers: [120, 160, 200, 240],
          releaseActiveFrames: [2, 7],
          releaseKnockbackFrame: 7,
          releaseRecoveryFrames: [8, 9],
          maxChargeStunDuration: 0.45,
          dashTapWindow: 0.2,
        },
        r2: {
          baseDashSpeed: 1500, // Reduced from 1600 to 1500 for dodgeable dash attacks
          maxCharge: 2.0,
          comboWindowFrames: 2,
          chargeThresholds: [0.8, 1.5, 2.0],
          dashMultipliers: [0.6, 1.0, 1.5], // Adjusted to maintain same ranges (was 1.2, 1.6, 2.0)
          animSpeed: 0.75,
        },
        l1: {
          bombDamage: 6,
          maxCharge: 1.5,
          chargeThresholds: [0.3, 0.7, 1.2],
        },
        l2_smash: {
          explosionRadius: 140,
          explosionHeight: 180,
          forwardOffset: 50,
          verticalOffset: -30,
        },
        r1_jump: {
          horizontalSpeedMultiplier: 2.7,
          landingFriction: 0.8,
          purelyHorizontal: true,
        },
        r1_dash_attack: {
          horizontalSpeedMultiplier: 2.0,
          landingFriction: 0.7,
          animSpeed: 1.05,
        },
        ultimate: {
          duration: 6.0, // Standard duration
        },
      },
      hp: {
        r1: {
          dashTapWindow: 0.2,
          animSpeed: 1.0,
          loopTickDamage: 4,
          releaseDamage: 5,
          releaseDashFrames: [4, 5, 6],
          releaseDashMultiplier: 2.0,
          loopTimeTracking: true,
        },
        l1_ranged_grab: {
          grabRange: 120,
          grabHeight: 80,
          comboWindow: 0,
          detectFrame: 5,
          effectOffsetX: 148,
          effectOffsetY: 0,
          effectScale: 0.75,
        },
        l1_ranged_grab_combo: {
          finalKnockupFrame: 6,
          finalKnockupDamage: 8,
          lockTargetPosition: true,
        },
        l2_ranged: {
          mushroomDamage: 8,
          maxCharge: 2.0,
          chargeThresholds: [0.3, 0.8, 1.5],
        },
        r2: {
          baseDashSpeed: 1800, // Reduced from 3200 to 1800 for dodgeable dash attacks
          maxCharge: 2.0,
          comboWindowFrames: 2,
          chargeThresholds: [0.8, 1.5, 2.0],
          dashMultipliers: [0.6, 0.8, 1.0], // Adjusted to maintain same ranges (was 1.2, 1.6, 2.0)
          animSpeed: 0.75,
        },
        l2: {
          baseDashSpeed: 1800, // Reduced from 3200 to 1800 for dodgeable dash attacks
          maxCharge: 2.0,
          comboWindowFrames: 2,
          chargeThresholds: [0.8, 1.5, 2.0],
          dashMultipliers: [0.6, 0.8, 1.0], // Adjusted to maintain same ranges (was 1.2, 1.6, 2.0)
          animSpeed: 1.0,
        },
        r1_jump: {
          horizontalSpeedMultiplier: 2.7,
          landingFriction: 0.8,
          purelyHorizontal: true,
        },
        r1_dash_attack: {
          horizontalSpeedMultiplier: 3.25,
          landingFriction: 0.7,
          animSpeed: 0.8,
        },
        ultimate: {
          duration: 20.0, // Long duration for HP's bike ultimate
        },
      },
      ernst: {
        r1: {
          dashTapWindow: 0.2,
          animSpeed: 1.0,
          loopTickDamage: 4,
          releaseDamage: 5,
          releaseDashFrames: [4, 5, 6],
          releaseDashMultiplier: 4.0,
          loopTimeTracking: true,
        },
        l1_ranged_grab: {
          grabRange: 120,
          grabHeight: 80,
          comboWindow: 0,
          detectFrame: 5,
          effectOffsetX: 188,
          effectOffsetY: 0,
          effectScale: 0.75,
        },
        l1_ranged_grab_combo: {
          finalKnockupFrame: 6,
          finalKnockupDamage: 8,
          lockTargetPosition: true,
        },
        l2_ranged: {
          mushroomDamage: 8,
          maxCharge: 2.0,
          chargeThresholds: [0.3, 0.8, 1.5],
        },
        r2: {
          baseDashSpeed: 1800, // Reduced from 3200 to 1800 for dodgeable dash attacks
          maxCharge: 2.0,
          comboWindowFrames: 2,
          chargeThresholds: [0.8, 1.5, 2.0],
          dashMultipliers: [0.6, 0.8, 1.0], // Adjusted to maintain same ranges (was 1.2, 1.6, 2.0)
          animSpeed: 0.75,
        },
        l2: {
          baseDashSpeed: 1800, // Reduced from 3200 to 1800 for dodgeable dash attacks
          maxCharge: 2.0,
          comboWindowFrames: 2,
          chargeThresholds: [0.8, 1.5, 2.0],
          dashMultipliers: [0.6, 0.8, 1.0], // Adjusted to maintain same ranges (was 1.2, 1.6, 2.0)
          animSpeed: 1.0,
        },
        r1_jump: {
          horizontalSpeedMultiplier: 2.7,
          landingFriction: 0.8,
          purelyHorizontal: true,
        },
        r1_dash_attack: {
          horizontalSpeedMultiplier: 1.3,
          landingFriction: 0.7,
          animSpeed: 0.8,
        },
        ultimate: {
          duration: 12.0, // Long duration for Ernst's projectile ultimate
        },
      },
    };

    return configs[charName] || {};
  }

  /**
   * Helper function to get dash range info for an attack
   * @param {string} charName - Character name
   * @param {string} attackType - Attack type (e.g., "r1_jump", "r1_dash_attack")
   * @param {Object} state - Game state object
   * @returns {Object} Dash range calculation info
   */
  function getDashRangeInfo(charName, attackType, state = null) {
    // Auto-detect state from window if not provided
    const gameState =
      state || (typeof window !== "undefined" ? window.state : null) || {};
    const charKey = charName.toLowerCase();
    const attackConfig = getAttackConfig(charKey, gameState);
    const attackTuning = attackConfig[attackType] || {};
    const physics = getPhysicsConfig(charKey, gameState);

    // Get descriptor if available
    const descriptor =
      window.AttackCatalog?.getDescriptor?.({ charName }, attackType) || null;

    // Priority: descriptor.movement > attackTuning > descriptor fallback
    const multiplier =
      descriptor?.movement?.horizontalSpeedMultiplier ||
      attackTuning.horizontalSpeedMultiplier ||
      null;

    const landingFriction =
      descriptor?.movement?.landingFriction ||
      attackTuning.landingFriction ||
      1.0;

    // Calculate final speed
    const baseSpeed = physics.moveSpeed;
    const finalSpeed = multiplier ? baseSpeed * multiplier : null;

    // Get animation duration if available
    let animationDuration = null;
    let animationFrames = null;
    let foundAnimationName = null;
    let frameDurationSum = null;
    const animConfig = getAnimationConfig(charKey, gameState);

    // First check if AttackAnimationCatalog has a special config
    let attackAnimConfig = null;
    if (window.AttackAnimationCatalog?.getAnimation) {
      const animNames = [
        `${attackType}_attack`, // r1_jump -> r1_jump_attack
        attackType, // r1_jump -> r1_jump
        `r1_jump_attack`, // explicit fallback
      ];

      for (const animName of animNames) {
        const config = window.AttackAnimationCatalog.getAnimation(
          charName,
          animName,
          gameState
        );
        if (config && config.frames && config.frames.length > 0) {
          attackAnimConfig = config;
          foundAnimationName = animName;
          animationFrames = config.frames;

          // Check if frames have duration modifiers (frame objects with .d property)
          if (config.useFrameDurations && Array.isArray(config.frames)) {
            frameDurationSum = config.frames.reduce((sum, f) => {
              if (typeof f === "object" && f.d) {
                return sum + f.d;
              }
              return sum + 1; // Default duration of 1 frame
            }, 0);
          } else {
            frameDurationSum = config.frames.length;
          }

          const fps = animConfig.fps || 12;
          animationDuration = frameDurationSum / fps;
          break;
        }
      }
    }

    // Fallback: check raw atlas animations
    if (!foundAnimationName) {
      const animNames = [
        `${attackType}_attack`, // r1_jump -> r1_jump_attack
        attackType, // r1_jump -> r1_jump
        `r1_jump_attack`, // explicit fallback
      ];

      for (const animName of animNames) {
        if (animConfig.animations && animConfig.animations[animName]) {
          animationFrames = animConfig.animations[animName];
          foundAnimationName = animName;
          const fps = animConfig.fps || 12;
          frameDurationSum = Array.isArray(animationFrames)
            ? animationFrames.length
            : null;
          animationDuration = frameDurationSum ? frameDurationSum / fps : null;
          break;
        }
      }
    }

    // Calculate estimated dash range
    const estimatedRange =
      finalSpeed && animationDuration ? finalSpeed * animationDuration : null;

    return {
      charName: charName,
      attackType: attackType,
      baseSpeed: baseSpeed,
      multiplier: multiplier,
      finalSpeed: finalSpeed,
      landingFriction: landingFriction,
      animation: {
        foundName: foundAnimationName,
        frameCount: Array.isArray(animationFrames)
          ? animationFrames.length
          : null,
        frameDurationSum: frameDurationSum, // Sum of frame durations (may include .d modifiers)
        animationDuration: animationDuration, // Total duration in seconds
        useFrameDurations: attackAnimConfig?.useFrameDurations || false,
        isLooped: attackAnimConfig?.loop || false,
        source: attackAnimConfig ? "AttackAnimationCatalog" : "atlas",
      },
      estimatedDashRange: estimatedRange,
      source: {
        multiplierFrom: multiplier
          ? descriptor?.movement?.horizontalSpeedMultiplier
            ? "descriptor.movement"
            : "characterCatalog.attackConfig"
          : "none",
        landingFrictionFrom:
          landingFriction !== 1.0
            ? descriptor?.movement?.landingFriction
              ? "descriptor.movement"
              : "characterCatalog.attackConfig"
            : "default",
      },
      raw: {
        descriptor: descriptor,
        attackConfig: attackTuning,
        physics: physics,
        animationConfig: animConfig,
        attackAnimConfig: attackAnimConfig,
      },
    };
  }

  const api = {
    getPhysicsConfig,
    getAttackDescriptor,
    getCharacterData,
    getCooldownConfig,
    hasAbility,
    getAnimationConfig,
    getMoveConfig,
    getAttackConfig,
    getDashRangeInfo,
    DEFAULT_PHYSICS,
  };

  if (typeof window !== "undefined") {
    window.__modDebug = window.__modDebug || {};
    window.__modDebug.characterCatalog = api;
  }

  return api;
})();
