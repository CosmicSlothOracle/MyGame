window.AttackAnimationCatalog = (() => {
  /**
   * Centralized attack animation configuration with optional per-frame durations and offsets,
   * similar to DanceCatalog. Defaults to character atlas frames if not overridden here.
   */

  function buildFrames(state, charName, animName, asObjects = false) {
    const charData = state?.characterConfigs?.[charName];
    const raw = charData?.animations?.[animName] || [];
    if (!Array.isArray(raw) || raw.length === 0) return [];
    if (!asObjects) return raw.slice();
    return raw.map((f) => ({ frame: f, d: 1.0 }));
  }

  // Helpers to adjust frame durations
  function slowStart(frames, factor = 1.25, count = 1) {
    if (!Array.isArray(frames) || frames.length === 0) return frames;
    const n = Math.min(count, frames.length);
    for (let i = 0; i < n; i++) {
      const f = frames[i];
      if (f && typeof f === "object") {
        f.d = (f.d || 1) * factor;
      }
    }
    return frames;
  }

  function slowAll(frames, factor = 1.25) {
    if (!Array.isArray(frames) || frames.length === 0) return frames;
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      if (f && typeof f === "object") {
        f.d = (f.d || 1) * factor;
      }
    }
    return frames;
  }

  // Seed configs for key attacks; you can fine-tune durations (d) and offsets here
  // If an anim is not listed, we fall back to atlas frames automatically
  const CONFIGS = {
    // Character-specific overrides
    hp: {
      // R1 core
      r1start: (state) => ({
        frames: buildFrames(state, "HP", "r1start", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r1loop: (state) => ({
        frames: buildFrames(state, "HP", "r1loop", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r1release: (state) => ({
        frames: buildFrames(state, "HP", "r1release", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),

      // R1 variants
      r1_dash_attack: (state) => ({
        frames: buildFrames(state, "HP", "r1_dash_attack", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r1_jump_attack: (state) => ({
        frames: buildFrames(state, "HP", "r1_jump_attack", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),

      // R2 sequences
      r2_start: (state) => ({
        frames: buildFrames(state, "HP", "r2_start", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r2_loop: (state) => ({
        frames: buildFrames(state, "HP", "r2_loop", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r2_loop_max: (state) => ({
        frames: buildFrames(state, "HP", "r2_loop_max", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r2_release: (state) => ({
        frames: buildFrames(state, "HP", "r2_release", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),

      // L2 (ranged)
      l2_ranged_start: (state) => ({
        frames: buildFrames(state, "HP", "l2_ranged_start", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      l2_ranged_hold: (state) => ({
        frames: buildFrames(state, "HP", "l2_ranged_hold", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      l2_ranged_release: (state) => ({
        frames: buildFrames(state, "HP", "l2_ranged_release", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),

      // L1 (ranged grab)
      l1_ranged_grab: (state) => ({
        frames: buildFrames(state, "HP", "l1_ranged_grab", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      l1_ranged_grab_detect: (state) => ({
        frames: buildFrames(state, "HP", "l1_ranged_grab_detect", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      l1_ranged_grab_combo: (state) => ({
        frames: buildFrames(state, "HP", "l1_ranged_grab_combo", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),

      // Ultimate
      r2_l2_ulti_start: (state) => ({
        frames: buildFrames(state, "HP", "r2_l2_ulti_start", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r2_l2_ulti: (state) => ({
        frames: buildFrames(state, "HP", "r2_l2_ulti", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
    },

    ernst: {
      // R1 core
      r1start: (state) => ({
        frames: buildFrames(state, "ernst", "r1start", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r1loop: (state) => ({
        frames: buildFrames(state, "ernst", "r1loop", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r1release: (state) => ({
        frames: buildFrames(state, "ernst", "r1release", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),

      // R1 variants
      r1_dash_attack: (state) => ({
        frames: buildFrames(state, "ernst", "r1_dash_attack", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r1_jump_attack: (state) => {
        const frames = buildFrames(state, "ernst", "r1_jump_attack", true);
        // Double the duration of the last frame
        if (frames.length > 0) {
          frames[frames.length - 1].d =
            (frames[frames.length - 1].d || 1.0) * 2.0;
        }
        return {
          frames,
          loop: false,
          useFrameDurations: true,
          skipLastDouble: true,
        };
      },
      r1_combo_3: (state) => {
        const frames = buildFrames(state, "ernst", "r1_combo_3", true);
        if (frames.length > 0) {
          const count = Math.min(3, frames.length);
          for (let i = frames.length - count; i < frames.length; i++) {
            const frame = frames[i];
            if (frame && typeof frame === "object") {
              frame.d = (frame.d || 1) * 2;
            }
          }
        }
        return {
          frames,
          loop: false,
          useFrameDurations: true,
          skipLastDouble: true,
        };
      },

      // R2 sequences
      r2_start: (state) => ({
        frames: buildFrames(state, "ernst", "r2_start", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r2_loop: (state) => ({
        frames: buildFrames(state, "ernst", "r2_loop", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r2_loop_max: (state) => ({
        frames: buildFrames(state, "ernst", "r2_loop_max", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r2_release: (state) => ({
        frames: buildFrames(state, "ernst", "r2_release", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),

      // L2 (ranged)
      l2_ranged_start: (state) => ({
        frames: buildFrames(state, "ernst", "l2_ranged_start", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      l2_ranged_hold: (state) => ({
        frames: buildFrames(state, "ernst", "l2_ranged_hold", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      l2_ranged_release: (state) => ({
        frames: buildFrames(state, "ernst", "l2_ranged_release", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),

      // L1 (ranged grab)
      l1_ranged_grab: (state) => ({
        frames: buildFrames(state, "ernst", "l1_ranged_grab", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      l1_ranged_grab_detect: (state) => ({
        frames: buildFrames(state, "ernst", "l1_ranged_grab_detect", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      l1_ranged_grab_combo: (state) => ({
        frames: buildFrames(state, "ernst", "l1_ranged_grab_combo", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),

      // Ultimate
      r2_l2_ulti_start: (state) => ({
        frames: buildFrames(state, "ernst", "r2_l2_ulti_start", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r2_l2_ulti: (state) => ({
        frames: buildFrames(state, "ernst", "r2_l2_ulti", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      // Ultimate Impact: dedicated projectile impact effect
      ulti_impact: (state) => ({
        frames: buildFrames(state, "ernst", "ulti_impact", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
    },

    fritz: {
      // L2 path: give object frames to allow offsets if desired
      l2_smash_charge: (state) => ({
        frames: buildFrames(state, "fritz", "l2_smash_charge", true),
        loop: false,
        useFrameDurations: true,
      }),
      l2_smash_charge_loop: (state) => {
        const frames = buildFrames(
          state,
          "fritz",
          "l2_smash_charge_loop",
          true
        );
        // Extend last frame duration for release anticipation
        if (frames.length > 0) {
          frames[frames.length - 1].d = 2.5; // Last frame held 2.5x longer before release
        }
        return {
          frames,
          loop: true,
          useFrameDurations: true,
        };
      },
      l2_smash_jump: (state) => ({
        frames: buildFrames(state, "fritz", "l2_smash_jump", true),
        loop: false,
        useFrameDurations: true,
      }),
      l2_smash_hover: (state) => ({
        frames: buildFrames(state, "fritz", "l2_smash_hover", true),
        loop: false,
        useFrameDurations: true,
      }),
      l2_smash_fall: (state) => ({
        frames: buildFrames(state, "fritz", "l2_smash_fall", true),
        loop: false,
        useFrameDurations: true,
      }),
      l2_impact_low: (state) => ({
        frames: buildFrames(state, "fritz", "l2_impact_low", true),
        loop: false,
        useFrameDurations: true,
      }),
      l2_impact_high: (state) => ({
        frames: buildFrames(state, "fritz", "l2_impact_high", true),
        loop: false,
        useFrameDurations: true,
      }),
      // R1 dash
      r1_dash_attack: (state) => {
        const frames = buildFrames(state, "fritz", "r1_dash_attack", true);
        slowStart(frames, 1.25, 1); // Start frames slower, rest unchanged
        return { frames, loop: false, useFrameDurations: true };
      },
      // R2 with extended last frame for release anticipation
      r2_start: (state) => {
        const frames = buildFrames(state, "fritz", "r2_start", true);
        // Extend last frame duration for release anticipation
        if (frames.length > 0) {
          frames[frames.length - 1].d = 2.5; // Last frame held 2.5x longer before release
        }
        slowStart(frames, 1.25, 4); // Slow down first 4 frames, then return to normal
        return {
          frames,
          loop: false,
          useFrameDurations: true,
        };
      },
      r2_loop: (state) => {
        const frames = buildFrames(state, "fritz", "r2_loop", true);
        // Extend last frame duration for release anticipation
        if (frames.length > 0) {
          frames[frames.length - 1].d = 2.5; // Last frame held 2.5x longer before release
        }
        return {
          frames,
          loop: true,
          useFrameDurations: true,
        };
      },
      r2_release: (state) => ({
        frames: buildFrames(state, "fritz", "r2_release", true),
        loop: false,
        useFrameDurations: true,
      }),
      r2_recovery: (state) => ({
        frames: buildFrames(state, "fritz", "r2_recovery", true),
        loop: false,
        useFrameDurations: true,
      }),
    },

    cyboard: {
      // R1 core (start/loop/release)
      r1start: (state) => ({
        frames: buildFrames(state, "cyboard", "r1start", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r1loop: (state) => ({
        frames: buildFrames(state, "cyboard", "r1loop", true),
        loop: true,
        useFrameDurations: true,
        skipLastDouble: true,
      }),
      r1release: (state) => ({
        frames: buildFrames(state, "cyboard", "r1release", true),
        loop: false,
        useFrameDurations: true,
        skipLastDouble: true,
      }),

      // R1 dash - uses r1_dash_attack animation (all 10 frames)
      r1_dash_attack: (state) => {
        const frames = buildFrames(state, "cyboard", "r1_dash_attack", true);
        slowStart(frames, 1.25, 1); // Start frames slower, rest unchanged
        const slowFactor = 0.4; // 2.5x faster
        slowAll(frames, slowFactor);
        const avgDuration =
          frames.reduce((sum, frame) => sum + (frame.d || 1), 0) /
          Math.max(frames.length, 1);
        console.log("[AnimCatalog] cyboard r1_dash_attack durations", {
          slowFactor,
          frames: frames.map((frame) => frame.d),
          avgDuration,
        });
        return { frames, loop: false, useFrameDurations: true };
      },
      // R2 with extended last frame for release anticipation
      r2_start: (state) => {
        const frames = buildFrames(state, "cyboard", "r2_start", true);
        // Extend last frame duration for release anticipation
        if (frames.length > 0) {
          frames[frames.length - 1].d = 2.5; // Last frame held 2.5x longer before release
        }
        slowStart(frames, 1.25, 4); // Slow down first 4 frames, then return to normal (same as Fritz)
        return {
          frames,
          loop: false,
          useFrameDurations: true,
        };
      },
      r2_loop: (state) => {
        const frames = buildFrames(state, "cyboard", "r2_loop", true);
        // Extend last frame duration for release anticipation
        if (frames.length > 0) {
          frames[frames.length - 1].d = 2.5; // Last frame held 2.5x longer before release
        }
        return {
          frames,
          loop: true,
          useFrameDurations: true,
        };
      },
      r2_release: (state) => ({
        frames: buildFrames(state, "cyboard", "r2_release", true),
        loop: false,
        useFrameDurations: true,
      }),
      // L2 (portal/teleport may use different names; we still provide placeholders if present)
      l2_smash_charge: (state) => ({
        frames: buildFrames(state, "cyboard", "l2_smash_charge"),
        loop: false,
      }),
      l2_smash_charge_loop: (state) => {
        const frames = buildFrames(
          state,
          "cyboard",
          "l2_smash_charge_loop",
          true
        );
        // Extend last frame duration for release anticipation
        if (frames.length > 0) {
          frames[frames.length - 1].d = 2.5; // Last frame held 2.5x longer before release
        }
        return {
          frames,
          loop: true,
          useFrameDurations: true,
        };
      },
      l2_smash_jump: (state) => ({
        frames: buildFrames(state, "cyboard", "l2_smash_jump"),
        loop: false,
      }),
      l2_smash_hover: (state) => ({
        frames: buildFrames(state, "cyboard", "l2_smash_hover"),
        loop: false,
      }),
      l2_smash_fall: (state) => ({
        frames: buildFrames(state, "cyboard", "l2_smash_fall"),
        loop: false,
      }),
      l2_impact_low: (state) => ({
        frames: buildFrames(state, "cyboard", "l2_impact_low"),
        loop: false,
      }),
      l2_impact_high: (state) => ({
        frames: buildFrames(state, "cyboard", "l2_impact_high"),
        loop: false,
      }),
    },
  };

  function getAnimation(charName, animName, state) {
    if (!charName || !animName) return null;
    const key = charName.toLowerCase();
    const charCfg = CONFIGS[key];
    if (charCfg && typeof charCfg[animName] === "function") {
      const cfg = charCfg[animName](state);
      if (cfg && Array.isArray(cfg.frames) && cfg.frames.length > 0) {
        // If this animation uses frame-specific durations, ensure the last frame
        // has double the duration of the other frames (as requested).
        if (cfg.useFrameDurations && !cfg.skipLastDouble) {
          try {
            const frames = cfg.frames;
            // compute average d of all frames except last (fallback to 1)
            const others = frames
              .slice(0, -1)
              .filter((f) => f && typeof f.d === "number");
            const avg =
              others.length > 0
                ? others.reduce((s, f) => s + (f.d || 1), 0) / others.length
                : 1;
            const last = frames[frames.length - 1];
            if (last && typeof last === "object") {
              last.d = (avg || 1) * 2;
            }
          } catch (e) {
            // ignore and return cfg as-is
            console.warn(
              "AttackAnimationCatalog: failed to apply last-frame doubling",
              e
            );
          }
        }
        return cfg;
      }
    }
    // Fallback: build from atlas frames (strings)
    const frames = buildFrames(state, charName, animName, false);
    if (frames.length > 0) {
      // For simple string-frame fallbacks we don't set frame durations here
      return { frames, loop: false };
    }
    return null;
  }

  // Helpers to allow live tuning like in DanceCatalog
  function updateAttackAnimation(charName, animName, config) {
    if (!charName || !animName) return;
    const key = charName.toLowerCase();
    CONFIGS[key] = CONFIGS[key] || {};
    CONFIGS[key][animName] = () => ({ ...config });
  }

  return {
    getAnimation,
    updateAttackAnimation,
  };
})();
npm;
