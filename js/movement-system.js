window.MovementSystem = (() => {
  /**
   * Centralized movement and physics system.
   * Handles all player movement, physics, jumping, walljumping, and collision.
   *
   * This system provides a clean separation of movement logic from the main
   * physics engine, making it easier to maintain and extend.
   */

  /**
   * Apply physics to a player (gravity, velocity, position updates)
   * @param {number} dt - Delta time
   * @param {Object} p - Player object
   * @param {Object} pconf - Physics configuration (fallback)
   */
  function applyPhysics(dt, p, pconf) {
    // Use CharacterCatalog physics config instead of global state
    const physics = p.config?.physics || pconf;

    // Detect knockback state once for use in both air resistance and gravity calculations
    // Consider player in knockback if they have high velocity (above normal movement speed)
    // and are airborne. This allows natural arc trajectories.
    const horizontalSpeed = Math.abs(p.vel.x);
    const verticalSpeed = Math.abs(p.vel.y);
    const totalSpeed = Math.sqrt(horizontalSpeed * horizontalSpeed + verticalSpeed * verticalSpeed);
    const isInKnockback = !p.grounded && totalSpeed > (physics.moveSpeed || 520) * 1.5;

    if (p.walljumpBoost?.active) {
      p.walljumpBoost.elapsed += dt;
      const t = Math.min(1, p.walljumpBoost.elapsed / p.walljumpBoost.duration);
      const easeOut = 1 - Math.pow(1 - t, 2);

      const currentHorizontal =
        p.walljumpBoost.startHorizontal -
        (p.walljumpBoost.startHorizontal - p.walljumpBoost.endHorizontal) *
          easeOut;
      const currentVertical =
        p.walljumpBoost.startVertical -
        (p.walljumpBoost.startVertical - p.walljumpBoost.endVertical) * easeOut;

      p.vel.x = p.walljumpBoost.direction * currentHorizontal;
      p.vel.y = -currentVertical;

      const maxHorizontal = physics.moveSpeed * 2.6;
      p.vel.x = Math.max(-maxHorizontal, Math.min(maxHorizontal, p.vel.x));

      if (p.walljumpBoost.elapsed >= p.walljumpBoost.duration) {
        p.walljumpBoost.active = false;
        p.vel.x = p.walljumpBoost.direction * p.walljumpBoost.endHorizontal;
        p.vel.y = -p.walljumpBoost.endVertical;
      }
    } else if (!p.grounded || (p.stunT || 0) > 0) {
      // Apply air resistance based on knockback state

      if (horizontalSpeed > 0) {
        if (isInKnockback) {
          // During knockback: minimal air resistance to maintain momentum for natural arc
          // Only apply very light resistance (0.995 = 0.5% loss per frame) so player
          // maintains horizontal velocity longer, creating a proper parabolic trajectory
          p.vel.x *= 0.995;
        } else {
          // Normal air resistance: scales with velocity (quadratic drag)
          // Higher speed = more resistance (feels heavier, more realistic)
          // Base air resistance + velocity-dependent component
          // At low speeds: ~0.98 (2% loss), at high speeds: ~0.94-0.96 (4-6% loss)
          const baseResistance = physics.airResistance || 0.98;
          const speedFactor = Math.min(horizontalSpeed / 800, 1.0); // Normalize to 0-1
          const velocityDrag = 0.04 * speedFactor; // Up to 4% additional drag at high speeds
          const effectiveResistance = baseResistance - velocityDrag;
          p.vel.x *= effectiveResistance;
        }
      } else {
        // Apply base resistance when stationary
        p.vel.x *= physics.airResistance || 0.98;
      }
    }

    // Enhanced gravity: stronger and more dynamic
    // Apply gravity with slight acceleration curve for more realistic feel
    const baseGravity = physics.gravity || 2400;

    // Increase gravity when falling (characters feel heavier)
    // During knockback: apply stronger gravity to make character feel weighted
    // Rising during knockback: 1.3x gravity (30% stronger) to counteract upward momentum faster
    // Falling during knockback: 1.25x gravity (25% stronger) for natural arc
    // Normal rising: 1.0x gravity, Normal falling: 1.15x gravity
    let gravityMultiplier;
    if (isInKnockback) {
      gravityMultiplier = p.vel.y > 0 ? 1.25 : 1.3; // Stronger gravity during knockback
    } else {
      gravityMultiplier = p.vel.y > 0 ? 1.15 : 1.0; // Normal gravity when not in knockback
    }
    const effectiveGravity = baseGravity * gravityMultiplier;

    p.vel.y += effectiveGravity * dt;

    // Terminal velocity: realistic max fall speed based on air resistance
    // Higher terminal velocity for faster falling (more momentum)
    const baseMaxFall = physics.maxFall || 2600;
    // Slightly increase terminal velocity for more dynamic feel
    const terminalVelocity = baseMaxFall * 1.1; // 10% faster terminal velocity

    if (p.vel.y > terminalVelocity) {
      p.vel.y = terminalVelocity;
    }

    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
  }

  /**
   * Handle player movement input and physics
   * @param {number} dt - Delta time
   * @param {Object} p - Player object
   * @param {Object} inputs - Input state
   * @param {Object} state - Game state
   */
  function handleMovement(dt, p, inputs, state) {
    const pconf = p.config.physics;
    if (p.stunT && p.stunT > 0) p.stunT = Math.max(0, p.stunT - dt);

    // EDGE CASE: Block movement if player is frozen (during slow-motion freeze)
    if (p.attack?.isFrozen) {
      p.vel.x = 0;
      p.vel.y = 0;
      return; // Completely block movement during freeze
    }

    const cyboardL2AirborneLock =
      p.charName?.toLowerCase?.() === "cyboard" &&
      p.attack?.type === "l2" &&
      (p.attack.phase === "jump" ||
        p.attack.phase === "hover" ||
        p.attack.phase === "fall" ||
        p.attack.phase === "impact");

    const controlsLocked =
      (p.stunT || 0) > 0 ||
      (p.attack?.type === "l2" && p.attack.phase === "release") || // Lock on *any* L2 release
      (p.attack?.type === "r2" && p.attack.phase === "release") || // Lock during R2 release dash
      (p.attack?.type === "r1_dash_attack" && p.attack.phase === "active") || // Lock during R1 dash attacks
      (p.attack?.type === "l1_ranged_grab" &&
        (p.attack.phase === "cast" || p.attack.phase === "pull")) ||
      (p.attack?.type === "l1_ranged_grab_combo" &&
        p.attack.phase === "active") ||
      p.attack?.type === "r2_combo" ||
      p.attack?.type === "r2_hit_followup" ||
      p.attack?.type === "r1_circle_attack" ||
      ((p.charName.toLowerCase() === "hp" || p.charName.toLowerCase() === "ernst") && p.ultiPhase === "start") ||
      cyboardL2AirborneLock; // Lock movement during HP/ernst bike mount and Cyboard L2 aerial phases

    if (p.decelerate) {
      p.vel.x *= 0.85; // Slow down to a halt
      if (Math.abs(p.vel.x) < 10) {
        p.vel.x = 0;
        p.decelerate = false; // Stop decelerating
      }
    } else if (!p.roll?.active) {
      // Progressive movement slowdown during charge attacks
      if (
        p.attack?.type &&
        (p.attack.type === "l2" || p.attack.type === "r2") &&
        (p.attack.phase === "start" ||
          p.attack.phase === "charge" ||
          p.attack.phase === "loop")
      ) {
        // During charge/loop phases we freeze horizontal movement so that
        // dash range depends purely on the release dash speed, not on any
        // pre-charge drift or left-stick input.
        p.vel.x = 0;
      } else {
        // Check if player is movable (not during respawn)
        const canMove = p.isMovable !== false; // Default true, false only during respawn
        const target =
          controlsLocked || !canMove ? p.vel.x : inputs.axis * pconf.moveSpeed;
        const accel = p.grounded ? pconf.accel : pconf.accel * pconf.airControl;
        const deltaV = target - p.vel.x;
        const maxStep = accel * dt;

        if (Math.abs(deltaV) <= maxStep) {
          p.vel.x = target;
        } else {
          p.vel.x += Math.sign(deltaV) * maxStep;
        }

        // Apply friction when grounded and not moving
        if (p.grounded && Math.abs(inputs.axis) < 0.1) {
          p.vel.x *= pconf.friction;
        }
      }
    }

    // Handle jumping
    if (inputs.jump && !p.jumpPressed) {
      p.jumpPressed = true;
      handleJump(p, inputs, state);
    } else if (!inputs.jump) {
      p.jumpPressed = false;
    }

    // Handle walljumping
    handleWalljump(p, inputs, state);
  }

  /**
   * Handle jump input and logic
   * @param {Object} p - Player object
   * @param {Object} inputs - Input state
   * @param {Object} state - Game state
   */
  function handleJump(p, inputs, state) {
    const pconf = p.config.physics;

    // Check cooldown only for double jump (when not grounded)
    if (!p.grounded && p.jumpsLeft === 1) {
      if (canUseAbility(p, "doubleJump")) {
        p.vel.y = -pconf.jumpSpeed;
        startCooldown(p, "doubleJump", state);
        // Use bike animations during HP/ernst ultimate
        if ((p.charName.toLowerCase() === "hp" || p.charName.toLowerCase() === "ernst") && p.ultiPhase === "active") {
          setAnim(p, "bike_double_jump", false, state);
        } else {
          setAnim(p, "double_jump", false, state);
        }
        p.jumpsLeft = 0;
      }
    } else {
      // Normal jump (no cooldown)
      p.vel.y = -pconf.jumpSpeed;
      // Use bike animations during HP/ernst ultimate
      if ((p.charName.toLowerCase() === "hp" || p.charName.toLowerCase() === "ernst") && p.ultiPhase === "active") {
        setAnim(p, "bike_jump_up", false, state);
      } else {
        setAnim(p, "jump_up", false, state);
      }
      p.jumpsLeft = 1;
    }
  }

  /**
   * Handle walljump logic
   * @param {Object} p - Player object
   * @param {Object} inputs - Input state
   * @param {Object} state - Game state
   */
  function handleWalljump(p, inputs, state) {
    const pconf = p.config.physics;

    // Walljump logic - check for wall contact and jump input
    if (p.walljumpBoost?.active) {
      // Continue walljump boost
      return;
    }

    if (!p.grounded && p.jumpsLeft === 0 && inputs.jump && !p.jumpPressed) {
      // Check for wall contact
      const hb = Renderer.getHurtbox(p);
      const leftWall = isWalljumpPixel(
        hb.left - 1,
        hb.top + hb.h / 2,
        state.walljumpData,
        state
      );
      const rightWall = isWalljumpPixel(
        hb.left + hb.w + 1,
        hb.top + hb.h / 2,
        state.walljumpData,
        state
      );

      if (leftWall || rightWall) {
        const wallSide = leftWall ? -1 : 1;
        const launchDir = -wallSide; // Launch away from wall

        // Calculate walljump velocity
        const gravity = Math.max(
          pconf?.gravity ?? state.physics?.gravity ?? 2400,
          1
        );
        const baseMove = pconf?.moveSpeed ?? 520;
        const baseJump = pconf?.jumpSpeed ?? 880;
        const targetDistance = 256;
        const desiredHorizontal = Math.max(baseMove, 480);

        let horizontalSpeed = desiredHorizontal;
        let timeToTarget = targetDistance / Math.max(horizontalSpeed, 1);
        let verticalSpeed = (gravity * timeToTarget) / 2;

        const maxVertical = baseJump * 0.95;
        const minVertical = baseJump * 0.55;

        if (verticalSpeed > maxVertical) {
          verticalSpeed = maxVertical;
          timeToTarget = (2 * verticalSpeed) / gravity;
          horizontalSpeed = targetDistance / Math.max(timeToTarget, 0.08);
        } else if (verticalSpeed < minVertical) {
          verticalSpeed = minVertical;
          timeToTarget = (2 * verticalSpeed) / gravity;
          horizontalSpeed = targetDistance / Math.max(timeToTarget, 0.08);
        }

        // Apply walljump
        p.walljumpBoost = {
          active: true,
          direction: launchDir,
          startHorizontal: horizontalSpeed,
          endHorizontal: horizontalSpeed * 0.3,
          startVertical: verticalSpeed,
          endVertical: verticalSpeed * 0.5,
          duration: 0.25,
          elapsed: 0,
        };

        p.facing = launchDir;
        p.jumpsLeft = 1; // Reset jumps for potential double jump

        console.log(
          `🚀 Walljump triggered: wallSide=${wallSide}, launchDir=${launchDir}, vel.x will be=${horizontalSpeed}, vel.y will be=${-verticalSpeed}`
        );
        setAnim(p, "walljump", false, state);
        console.log(
          `🚀 Walljump applied: facing=${launchDir}, vel.x=${horizontalSpeed}, vel.y=${-verticalSpeed}`
        );
      }
    }
  }

  /**
   * Check if a pixel is solid (for collision detection)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {ImageData} data - Ground data
   * @returns {boolean} Whether pixel is solid
   */
  function isPixelSolid(x, y, data) {
    if (!data || x < 0 || y < 0 || x >= data.width || y >= data.height)
      return false;
    const index = (y * data.width + x) * 4;
    const r = data.data[index];
    const g = data.data[index + 1];
    const b = data.data[index + 2];
    return r === 0 && g === 0 && b === 0; // Black pixels are solid
  }

  /**
   * Check if a pixel is a walljump pixel
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {ImageData} walljumpData - Walljump data
   * @returns {boolean} Whether pixel is walljumpable
   */
  function isWalljumpPixel(x, y, walljumpData, state = null) {
    if (!walljumpData) return false;

    // Scale coordinates if camera bounds provided (scaled stages)
    let pixelX, pixelY;
    if (state?.cameraBounds) {
      const cameraBounds = state.cameraBounds;
      const stageWidth = cameraBounds.width ?? GameState.CONSTANTS.NATIVE_WIDTH;
      const stageHeight = cameraBounds.height ?? GameState.CONSTANTS.NATIVE_HEIGHT;
      const stageX = cameraBounds.x ?? 0;
      const stageY = cameraBounds.y ?? 0;

      const scaleX = walljumpData.width / stageWidth;
      const scaleY = walljumpData.height / stageHeight;

      pixelX = (x - stageX) * scaleX;
      pixelY = (y - stageY) * scaleY;
    } else {
      pixelX = x;
      pixelY = y;
    }

    if (
      pixelX < 0 ||
      pixelY < 0 ||
      pixelX >= walljumpData.width ||
      pixelY >= walljumpData.height
    )
      return false;

    const index = (Math.floor(pixelY) * walljumpData.width + Math.floor(pixelX)) * 4;
    const r = walljumpData.data[index];
    const g = walljumpData.data[index + 1];
    const b = walljumpData.data[index + 2];
    return r === 255 && g === 0 && b === 0; // Red pixels are walljumpable
  }

  // Helper functions that need to be available (these will be imported from physics.js)
  let canUseAbility, startCooldown, setAnim;

  /**
   * Initialize the movement system with required dependencies
   * @param {Object} dependencies - Required functions from physics.js
   */
  function init(dependencies) {
    canUseAbility = dependencies.canUseAbility;
    startCooldown = dependencies.startCooldown;
    setAnim = dependencies.setAnim;
  }

  return {
    applyPhysics,
    handleMovement,
    handleJump,
    handleWalljump,
    isPixelSolid,
    isWalljumpPixel,
    init,
  };
})();
