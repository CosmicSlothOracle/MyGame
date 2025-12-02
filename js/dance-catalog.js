/**
 * Dance Catalog System
 * Centralized management of dance animations for all characters
 * Provides intelligent animation selection based on beatmatch quality and combo state
 *
 * CHARACTER ATLAS MAPPING:
 * - dance_a_000 to dance_a_015: Available in ALL character atlases (charly, fritz, HP, cyboard)
 * - dance_b_000 to dance_b_015: Available in ALL character atlases (charly, fritz, HP, cyboard)
 * - dance_c_000 to dance_c_015: Available in ALL character atlases (charly, fritz, HP, cyboard)
 *
 * All characters share the same dance frame naming convention, making this catalog universal.
 */
window.DanceCatalog = (() => {
  const BEAT_QUALITY = {
    OFF: "off",
    GOOD: "good",
    PERFECT: "perfect",
  };

  const DEFAULT_CONFIG = {
    fps: 6, // EMERGENCY FALLBACK: Halved from 12 to 6 for slower dance animations
    duration: 1.0, // Default duration
    loop: false, // Don't loop by default
  };

  // Centralized Dance Animation Configuration
  // All dance animations can now use frame-specific offsets and durations per character
  const DANCE_ANIMATION_CONFIGS = {
    // Perfect Beat Animations (dance_a) - 16 frames with individual timing and offsets
    // FRAMES: dance_a_000 to dance_a_015 (Available in: charly, fritz, HP, cyboard atlases)
    perfect_beat: {
      frames: [
        { frame: "dance_a_000", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_001", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_002", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_003", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_004", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_005", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_006", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_007", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_008", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_009", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_010", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_011", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_012", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_013", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_014", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_015", d: 1.0, offsetX: 0, offsetY: 0 },
      ],
      loop: false,
      fps: 6,
      useFrameDurations: true,
    },

    // Good Beat Animations (first 8 frames of dance_a) - individual timing and offsets
    // FRAMES: dance_a_000 to dance_a_007 (Available in: charly, fritz, HP, cyboard atlases)
    good_beat: {
      frames: [
        { frame: "dance_a_000", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_001", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_002", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_003", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_004", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_005", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_006", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_007", d: 1.0, offsetX: 0, offsetY: 0 },
      ],
      loop: false,
      fps: 6,
      useFrameDurations: true,
    },

    // Off Beat Animations (4 random frames from dance_a) - individual timing and offsets
    // FRAMES: Random selection from dance_a_000 to dance_a_015 (Available in: charly, fritz, HP, cyboard atlases)
    off_beat: {
      frames: [], // Will be generated dynamically with individual timing and offsets
      loop: false,
      fps: 6,
      useFrameDurations: true,
    },

    // Combo Animations (dance_b) - 16 frames with individual timing and offsets
    // FRAMES: dance_b_000 to dance_b_015 (Available in: charly, fritz, HP, cyboard atlases)
    combo_3_6: {
      frames: [
        { frame: "dance_b_000", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_001", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_002", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_003", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_004", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_005", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_006", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_007", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_008", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_009", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_010", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_011", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_012", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_013", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_014", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_015", d: 1.0, offsetX: 0, offsetY: 0 },
      ],
      loop: false,
      fps: 6,
      useFrameDurations: true,
    },

    // High Combo Animations (dance_c) - 16 frames with individual timing and offsets
    // FRAMES: dance_c_000 to dance_c_015 (Available in: charly, fritz, HP, cyboard atlases)
    combo_10_plus: {
      frames: [
        { frame: "dance_c_000", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_001", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_002", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_003", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_004", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_005", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_006", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_007", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_008", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_009", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_010", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_011", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_012", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_013", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_014", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_015", d: 1.0, offsetX: 0, offsetY: 0 },
      ],
      loop: false,
      fps: 6,
      useFrameDurations: true,
    },

    // Dance Mode Animations - individual timing and offsets for each frame
    // FRAMES: dance_a_000 to dance_a_015 (Available in: charly, fritz, HP, cyboard atlases)
    dance_mode_1_3: {
      frames: [
        { frame: "dance_a_000", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_001", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_002", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_003", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_004", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_005", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_006", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_007", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_008", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_009", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_010", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_011", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_012", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_013", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_014", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_a_015", d: 1.0, offsetX: 0, offsetY: 0 },
      ],
      loop: false,
      fps: 6,
      useFrameDurations: true,
    },

    // FRAMES: dance_b_000 to dance_b_015 (Available in: charly, fritz, HP, cyboard atlases)
    dance_mode_4_7: {
      frames: [
        { frame: "dance_b_000", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_001", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_002", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_003", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_004", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_005", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_006", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_007", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_008", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_009", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_010", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_011", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_012", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_013", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_014", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_b_015", d: 1.0, offsetX: 0, offsetY: 0 },
      ],
      loop: false,
      fps: 6,
      useFrameDurations: true,
    },

    // FRAMES: dance_c_000 to dance_c_015 (Available in: charly, fritz, HP, cyboard atlases)
    dance_mode_8_9: {
      frames: [
        { frame: "dance_c_000", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_001", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_002", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_003", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_004", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_005", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_006", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_007", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_008", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_009", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_010", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_011", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_012", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_013", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_014", d: 1.0, offsetX: 0, offsetY: 0 },
        { frame: "dance_c_015", d: 1.0, offsetX: 0, offsetY: 0 },
      ],
      loop: false,
      fps: 6,
      useFrameDurations: true,
    },

    // Character-specific Perfect Beatmatch Dances
    // Each character has 3 different 16-frame dance animations for different combo counts
    perfect_beatmatch: {
      // HP's perfect beatmatch dances (3 variations)
      hp: {
        // Combo 0-2: Original perfect beatmatch dance
        level_1: {
          frames: [
            { frame: "dance_c_000", d: 4.0, offsetY: -48 },
            { frame: "dance_c_001", d: 2.0, offsetY: -24 },
            { frame: "dance_c_002", d: 2.0 },
            { frame: "dance_c_003", d: 2.0 },
            { frame: "dance_c_004", d: 2.0 },
            { frame: "dance_c_005", d: 2.0, offsetX: 25 },
            { frame: "dance_c_006", d: 4.0, offsetX: 50 },
            { frame: "dance_c_007", d: 4.0, offsetX: 100 },
            { frame: "dance_c_008", d: 2.0, offsetX: 15 },
            { frame: "dance_c_009", d: 2.0, offsetX: 0 },
            { frame: "dance_c_010", d: 1.0, offsetY: -48 },
            { frame: "dance_c_011", d: 6.0, offsetY: -64 },
            { frame: "dance_c_012", d: 2.0, offsetY: -32 },
            { frame: "dance_c_013", d: 3.0 },
            { frame: "dance_c_014", d: 4.0, offsetX: 16 },
            { frame: "dance_c_015", d: 2.0, offsetX: 0, offsetY: 0 }, // Added missing frame
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
        // Combo 3-9: Second dance variation (to be customized)
        level_2: {
          frames: [
            { frame: "dance_b_000", d: 1.0, offsetX: 0, offsetY: 30 },
            { frame: "dance_b_001", d: 1.0, offsetX: 5, offsetY: -10 },
            { frame: "dance_b_002", d: 2.0, offsetX: 0, offsetY: 2 },
            { frame: "dance_b_003", d: 4.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_004", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_005", d: 2.0, offsetX: 20, offsetY: 0 },
            { frame: "dance_b_006", d: 3.0, offsetX: 40, offsetY: 0 },
            { frame: "dance_b_007", d: 2.0, offsetX: -50, offsetY: 0 },
            { frame: "dance_b_008", d: 3.0, offsetX: -100, offsetY: 0 },
            { frame: "dance_b_009", d: 2.0, offsetX: -20, offsetY: -80 },
            { frame: "dance_b_010", d: 3.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_011", d: 4.0, offsetX: 0, offsetY: 2 },
            { frame: "dance_b_012", d: 3.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_013", d: 2.0, offsetX: 0, offsetY: -10 },
            { frame: "dance_b_014", d: 4.0, offsetX: 0, offsetY: 5 },
            { frame: "dance_b_015", d: 9.0, offsetX: 0, offsetY: 6 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
        // Combo 10+: Third dance variation (to be customized)
        level_3: {
          frames: [
            { frame: "dance_a_000", d: 1.0, offsetX: 0, offsetY: 30 },
            { frame: "dance_a_001", d: 1.0, offsetX: 5, offsetY: -10 },
            { frame: "dance_a_002", d: 2.0, offsetX: 0, offsetY: 2 },
            { frame: "dance_a_003", d: 4.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_004", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_005", d: 2.0, offsetX: 20, offsetY: 0 },
            { frame: "dance_a_006", d: 3.0, offsetX: 40, offsetY: 0 },
            { frame: "dance_a_007", d: 2.0, offsetX: -50, offsetY: 0 },
            { frame: "dance_a_008", d: 3.0, offsetX: -100, offsetY: 0 },
            { frame: "dance_a_009", d: 2.0, offsetX: -20, offsetY: -80 },
            { frame: "dance_a_010", d: 3.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_011", d: 4.0, offsetX: 0, offsetY: 2 },
            { frame: "dance_a_012", d: 3.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_013", d: 2.0, offsetX: 0, offsetY: -10 },
            { frame: "dance_a_014", d: 4.0, offsetX: 0, offsetY: 5 },
            { frame: "dance_a_015", d: 9.0, offsetX: 0, offsetY: 6 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
      },
      // Charly's perfect beatmatch dances (3 variations)
      charly: {
        // Combo 0-2: Original perfect beatmatch dance
        level_1: {
          frames: [
            { frame: "dance_a_000", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_001", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_002", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_003", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_004", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_005", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_006", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_007", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_008", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_009", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_010", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_011", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_012", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_013", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_014", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_015", d: 1.0, offsetX: 0, offsetY: 0 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
        // Combo 3-9: Second dance variation (to be customized)
        level_2: {
          frames: [
            { frame: "dance_b_000", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_001", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_002", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_003", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_004", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_005", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_006", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_007", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_008", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_009", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_010", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_011", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_012", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_013", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_014", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_015", d: 1.0, offsetX: 0, offsetY: 0 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
        // Combo 10+: Third dance variation (to be customized)
        level_3: {
          frames: [
            { frame: "dance_c_000", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_001", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_002", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_003", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_004", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_005", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_006", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_007", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_008", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_009", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_010", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_011", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_012", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_013", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_014", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_015", d: 1.0, offsetX: 0, offsetY: 0 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
      },
      // Ernst's perfect beatmatch dances (3 variations) - 1:1 copy of HP for initial testing
      ernst: {
        // Combo 0-2: Original perfect beatmatch dance
        level_1: {
          frames: [
            { frame: "dance_c_000", d: 4.0, offsetY: -48 },
            { frame: "dance_c_001", d: 2.0, offsetY: -24 },
            { frame: "dance_c_002", d: 2.0 },
            { frame: "dance_c_003", d: 2.0 },
            { frame: "dance_c_004", d: 2.0 },
            { frame: "dance_c_005", d: 2.0, offsetX: 25 },
            { frame: "dance_c_006", d: 4.0, offsetX: 50 },
            { frame: "dance_c_007", d: 4.0, offsetX: 100 },
            { frame: "dance_c_008", d: 2.0, offsetX: 15 },
            { frame: "dance_c_009", d: 2.0, offsetX: 0 },
            { frame: "dance_c_010", d: 1.0, offsetY: -48 },
            { frame: "dance_c_011", d: 6.0, offsetY: -64 },
            { frame: "dance_c_012", d: 2.0, offsetY: -32 },
            { frame: "dance_c_013", d: 3.0 },
            { frame: "dance_c_014", d: 4.0, offsetX: 16 },
            { frame: "dance_c_015", d: 2.0, offsetX: 0, offsetY: 0 }, // Added missing frame
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
        // Combo 3-9: Second dance variation (to be customized)
        level_2: {
          frames: [
            { frame: "dance_b_000", d: 1.0, offsetX: 0, offsetY: 30 },
            { frame: "dance_b_001", d: 1.0, offsetX: 5, offsetY: -10 },
            { frame: "dance_b_002", d: 2.0, offsetX: 0, offsetY: 2 },
            { frame: "dance_b_003", d: 4.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_004", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_005", d: 2.0, offsetX: 20, offsetY: 0 },
            { frame: "dance_b_006", d: 3.0, offsetX: 40, offsetY: 0 },
            { frame: "dance_b_007", d: 2.0, offsetX: -50, offsetY: 0 },
            { frame: "dance_b_008", d: 3.0, offsetX: -100, offsetY: 0 },
            { frame: "dance_b_009", d: 2.0, offsetX: -20, offsetY: -80 },
            { frame: "dance_b_010", d: 3.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_011", d: 4.0, offsetX: 0, offsetY: 2 },
            { frame: "dance_b_012", d: 3.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_013", d: 2.0, offsetX: 0, offsetY: -10 },
            { frame: "dance_b_014", d: 4.0, offsetX: 0, offsetY: 5 },
            { frame: "dance_b_015", d: 9.0, offsetX: 0, offsetY: 6 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
        // Combo 10+: Third dance variation (to be customized)
        level_3: {
          frames: [
            { frame: "dance_a_000", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_001", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_002", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_003", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_004", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_005", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_006", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_007", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_008", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_009", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_010", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_011", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_012", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_013", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_014", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_015", d: 1.0, offsetX: 0, offsetY: 0 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
      },
      // Fritz's perfect beatmatch dances (3 variations)
      fritz: {
        // Combo 0-2: Original perfect beatmatch dance
        level_1: {
          frames: [
            { frame: "dance_a_000", d: 2.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_001", d: 3.0, offsetX: -2, offsetY: 0 },
            { frame: "dance_a_002", d: 3.0, offsetX: -5, offsetY: 0 },
            { frame: "dance_a_003", d: 2.0, offsetX: -2, offsetY: 0 },
            { frame: "dance_a_004", d: 4.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_005", d: 3.0, offsetX: 15, offsetY: 0 },
            { frame: "dance_a_006", d: 2.0, offsetX: 25, offsetY: 0 },
            { frame: "dance_a_007", d: 4.0, offsetX: 15, offsetY: 0 },
            { frame: "dance_a_008", d: 1.0, offsetX: 2, offsetY: 0 },
            { frame: "dance_a_009", d: 2.0, offsetX: 10, offsetY: 0 },
            { frame: "dance_a_010", d: 2.0, offsetX: 6, offsetY: 0 },
            { frame: "dance_a_011", d: 2.0, offsetX: 1, offsetY: 0 },
            { frame: "dance_a_012", d: 6.0, offsetX: -25, offsetY: 0 },
            { frame: "dance_a_013", d: 2.0, offsetX: -30, offsetY: 0 },
            { frame: "dance_a_014", d: 1.0, offsetX: -15, offsetY: 0 },
            { frame: "dance_a_015", d: 2.0, offsetX: 0, offsetY: 0 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
        // Combo 3-9: Second dance variation (to be customized)
        level_2: {
          frames: [
            { frame: "dance_b_000", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_001", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_002", d: 1.0, offsetX: -10, offsetY: 0 },
            { frame: "dance_b_003", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_004", d: 1.0, offsetX: -20, offsetY: 0 },
            { frame: "dance_b_005", d: 2.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_006", d: 2.0, offsetX: -40, offsetY: 0 },
            { frame: "dance_b_007", d: 3.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_008", d: 3.0, offsetX: -50, offsetY: 0 },
            { frame: "dance_b_009", d: 4.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_010", d: 4.0, offsetX: -55, offsetY: 0 },
            { frame: "dance_b_011", d: 5.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_012", d: 8.0, offsetX: -20, offsetY: 0 },
            { frame: "dance_b_013", d: 3.0, offsetX: -50, offsetY: 0 },
            { frame: "dance_b_014", d: 2.0, offsetX: -25, offsetY: 0 },
            { frame: "dance_b_015", d: 4.0, offsetX: 0, offsetY: 0 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
        // Combo 10+: Third dance variation (to be customized)
        level_3: {
          frames: [
            { frame: "dance_c_000", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_001", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_002", d: 1.0, offsetX: -10, offsetY: 0 },
            { frame: "dance_c_003", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_004", d: 1.0, offsetX: -20, offsetY: 0 },
            { frame: "dance_c_005", d: 2.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_006", d: 2.0, offsetX: -40, offsetY: 0 },
            { frame: "dance_c_007", d: 3.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_008", d: 3.0, offsetX: -50, offsetY: 0 },
            { frame: "dance_c_009", d: 4.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_010", d: 4.0, offsetX: -55, offsetY: 0 },
            { frame: "dance_c_011", d: 5.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_012", d: 8.0, offsetX: -20, offsetY: 0 },
            { frame: "dance_c_013", d: 3.0, offsetX: -50, offsetY: 0 },
            { frame: "dance_c_014", d: 2.0, offsetX: -25, offsetY: 0 },
            { frame: "dance_c_015", d: 4.0, offsetX: 0, offsetY: 0 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
      },
      // Cyboard's perfect beatmatch dances (3 variations)
      cyboard: {
        // Combo 0-2: Original perfect beatmatch dance
        level_1: {
          frames: [
            { frame: "dance_a_000", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_001", d: 1.0, offsetX: 25, offsetY: 0 },
            { frame: "dance_a_002", d: 3.0, offsetX: 50, offsetY: 0 },
            { frame: "dance_a_003", d: 3.0, offsetX: -50, offsetY: 0 },
            { frame: "dance_a_004", d: 2.0, offsetX: 30, offsetY: 0 },
            { frame: "dance_a_005", d: 3.0, offsetX: 0, offsetY: 25 },
            { frame: "dance_a_006", d: 2.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_007", d: 4.0, offsetX: 0, offsetY: -90 },
            { frame: "dance_a_008", d: 5.0, offsetX: 0, offsetY: -100 },
            { frame: "dance_a_009", d: 6.0, offsetX: 10, offsetY: -110 },
            { frame: "dance_a_010", d: 3.0, offsetX: 5, offsetY: -50 },
            { frame: "dance_a_011", d: 2.0, offsetX: 0, offsetY: -20 },
            { frame: "dance_a_012", d: 1.0, offsetX: 0, offsetY: -10 },
            { frame: "dance_a_013", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_014", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_a_015", d: 4.0, offsetX: 0, offsetY: 0 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
        // Combo 3-9: Second dance variation (to be customized)
        level_2: {
          frames: [
            { frame: "dance_b_000", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_001", d: 2.0, offsetX: 20, offsetY: -10 },
            { frame: "dance_b_002", d: 2.0, offsetX: -30, offsetY: 0 },
            { frame: "dance_b_003", d: 5.0, offsetX: -40, offsetY: 0 },
            { frame: "dance_b_004", d: 6.0, offsetX: -20, offsetY: 0 },
            { frame: "dance_b_005", d: 4.0, offsetX: -5, offsetY: -20 },
            { frame: "dance_b_006", d: 3.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_007", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_b_008", d: 6.0, offsetX: 10, offsetY: 10 },
            { frame: "dance_b_009", d: 2.0, offsetX: 5, offsetY: -0 },
            { frame: "dance_b_010", d: 3.0, offsetX: 0, offsetY: -100 },
            { frame: "dance_b_011", d: 2.0, offsetX: 0, offsetY: -140 },
            { frame: "dance_b_012", d: 3.0, offsetX: 0, offsetY: -155 },
            { frame: "dance_b_013", d: 9.0, offsetX: 0, offsetY: -160 },
            { frame: "dance_b_014", d: 2.0, offsetX: 0, offsetY: -100 },
            { frame: "dance_b_015", d: 1.0, offsetX: 0, offsetY: -2 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
        // Combo 10+: Third dance variation (to be customized)
        level_3: {
          frames: [
            { frame: "dance_c_000", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_001", d: 2.0, offsetX: 20, offsetY: -10 },
            { frame: "dance_c_002", d: 2.0, offsetX: -30, offsetY: 0 },
            { frame: "dance_c_003", d: 5.0, offsetX: -40, offsetY: 0 },
            { frame: "dance_c_004", d: 6.0, offsetX: -20, offsetY: 0 },
            { frame: "dance_c_005", d: 4.0, offsetX: -5, offsetY: -20 },
            { frame: "dance_c_006", d: 3.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_007", d: 1.0, offsetX: 0, offsetY: 0 },
            { frame: "dance_c_008", d: 6.0, offsetX: 10, offsetY: 10 },
            { frame: "dance_c_009", d: 2.0, offsetX: 5, offsetY: -0 },
            { frame: "dance_c_010", d: 3.0, offsetX: 0, offsetY: -100 },
            { frame: "dance_c_011", d: 2.0, offsetX: 0, offsetY: -140 },
            { frame: "dance_c_012", d: 3.0, offsetX: 0, offsetY: -155 },
            { frame: "dance_c_013", d: 9.0, offsetX: 0, offsetY: -160 },
            { frame: "dance_c_014", d: 2.0, offsetX: 0, offsetY: -100 },
            { frame: "dance_c_015", d: 1.0, offsetX: 0, offsetY: -2 },
          ],
          loop: false,
          fps: 6,
          useFrameDurations: true,
        },
      },
    },
  };

  const CELEBRATION_TYPES = {
    DANCE_MODE_SCORE: "dance_mode_score",
    DANCE_BATTLE_VICTORY: "dance_battle_victory",
  };

  const DEFAULT_CELEBRATIONS = {
    [CELEBRATION_TYPES.DANCE_MODE_SCORE]: {
      animName: "dance_aimation",
      fps: 6,
      loop: false,
      allowOverride: true,
    },
    [CELEBRATION_TYPES.DANCE_BATTLE_VICTORY]: {
      animName: "dance_victory",
      fps: 6,
      loop: true,
      minDuration: 1.0,
      allowOverride: false,
    },
  };

  function resolveCelebrationConfig(type, characterName) {
    const base = DEFAULT_CELEBRATIONS[type];
    if (!base) return null;

    const charKey = characterName ? characterName.toLowerCase() : null;
    const override =
      charKey &&
      window.state?.characterConfigs?.[charKey]?.danceCelebrations?.[type];

    return override ? { ...base, ...override } : base;
  }

  function getCelebrationAnimation(type, characterName, options = {}) {
    const resolved = resolveCelebrationConfig(type, characterName);
    if (!resolved) {
      console.warn(`[DanceCatalog] Unknown celebration type: ${type}`);
      return null;
    }

    const charKey = characterName ? characterName.toLowerCase() : null;
    const charData =
      charKey && window.state?.characterConfigs
        ? window.state.characterConfigs[charKey]
        : null;

    const animName = resolved.animName || options.fallbackAnim;
    const useFrameObjects = Array.isArray(resolved.frames);
    let frames = null;

    if (useFrameObjects) {
      frames = resolved.frames;
    } else if (charData?.animations) {
      frames =
        charData.animations[animName] ||
        (options.fallbackAnim
          ? charData.animations[options.fallbackAnim]
          : null);
    }

    if (!frames || frames.length === 0) {
      console.warn(
        `[DanceCatalog] Celebration animation ${animName} missing for ${characterName}`
      );
      return null;
    }

    const metadata = {
      celebrationType: type,
      minDuration: resolved.minDuration,
      startedAt: options.startedAt,
      name: options.name || `${type}_${charKey || "unknown"}`,
    };

    return {
      frames,
      loop: resolved.loop ?? false,
      fps: resolved.fps ?? DEFAULT_CONFIG.fps,
      useFrameDurations: useFrameObjects,
      allowOverride: resolved.allowOverride ?? false,
      metadata,
    };
  }

  /**
   * Get 4 random frames from dance_a (0-15) for off-beat animations
   * Now returns frame objects with individual timing and offset support like HP's special dance
   */
  function getOffBeatFrames() {
    const allFrames = Array.from({ length: 16 }, (_, i) => i);
    const shuffled = allFrames.sort(() => Math.random() - 0.5);
    const randomFrames = shuffled.slice(0, 4).map((i) => ({
      frame: `dance_a_${String(i).padStart(3, "0")}`,
      d: 1.0, // Default duration multiplier
      offsetX: 0, // Default X offset
      offsetY: 0, // Default Y offset
    }));
    // Debug: Reduced spam - only log when starting
    console.log(
      `[DanceCatalog] Generated ${randomFrames.length} random off-beat frames with individual timing and offset support`
    );
    return randomFrames;
  }

  /**
   * Get first 8 frames of dance_a for good beat animations
   * Now uses centralized configuration with offset and duration support
   */
  function getGoodBeatAnimation() {
    const config = DANCE_ANIMATION_CONFIGS.good_beat;
    // Debug: Reduced spam
    console.log(
      `[DanceCatalog] Generated ${config.frames.length} frames for good beat with offset/duration support`
    );
    return {
      frames: config.frames,
      loop: config.loop,
      fps: config.fps,
      useFrameDurations: config.useFrameDurations,
    };
  }

  /**
   * Get all 16 frames of dance_a for perfect beat animations
   * Now uses centralized configuration with offset and duration support
   */
  function getPerfectBeatAnimation() {
    const config = DANCE_ANIMATION_CONFIGS.perfect_beat;
    // Debug: Reduced spam
    console.log(
      `[DanceCatalog] Generated ${config.frames.length} frames for perfect beat with offset/duration support`
    );
    return {
      frames: config.frames,
      loop: config.loop,
      fps: config.fps,
      useFrameDurations: config.useFrameDurations,
    };
  }

  /**
   * Get character-specific perfect beatmatch dance with frame offsets and duration modifiers
   * @param {string} characterName - Name of the character
   * @param {number} comboCount - Current combo count to determine which level to use
   * @returns {Object} Animation configuration
   */
  function getCharacterPerfectBeatmatchDance(characterName, comboCount = 0) {
    const charKey = characterName ? characterName.toLowerCase() : "charly";
    const charConfig = DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey];

    if (!charConfig) {
      console.warn(
        `[DanceCatalog] No perfect beatmatch config found for ${charKey}, using charly as fallback`
      );
      return getCharacterPerfectBeatmatchDance("charly", comboCount);
    }

    // Determine which level to use based on combo count
    let levelKey;
    if (comboCount >= 10) {
      levelKey = "level_3";
    } else if (comboCount >= 3) {
      levelKey = "level_2";
    } else {
      levelKey = "level_1";
    }

    const config = charConfig[levelKey];
    if (!config) {
      console.warn(
        `[DanceCatalog] No ${levelKey} config found for ${charKey}, using level_1 as fallback`
      );
      return getCharacterPerfectBeatmatchDance(characterName, 0);
    }

    console.log(
      `[DanceCatalog] Generated ${charKey} perfect beatmatch dance (${levelKey}, combo ${comboCount}) with ${config.frames.length} frames and custom offsets`
    );
    return {
      frames: config.frames,
      loop: config.loop,
      fps: config.fps,
      useFrameDurations: config.useFrameDurations,
    };
  }

  function cloneFrameList(frames = []) {
    return frames.map((frame) =>
      typeof frame === "object" && frame !== null ? { ...frame } : frame
    );
  }

  function getCharacterDanceShowcaseAnimation(characterName) {
    const level1 = getCharacterPerfectBeatmatchDance(characterName, 0);
    const level2 = getCharacterPerfectBeatmatchDance(characterName, 3);
    const level3 = getCharacterPerfectBeatmatchDance(characterName, 10);

    const segments = [level1, level2, level3].filter(Boolean);
    const frames = segments.flatMap((segment) =>
      cloneFrameList(segment.frames)
    );

    if (frames.length === 0) {
      console.warn(
        `[DanceCatalog] Could not build dance showcase for ${characterName}`
      );
      return null;
    }

    const charKey = characterName ? characterName.toLowerCase() : "unknown";
    const useFrameDurations = segments.some(
      (segment) => segment.useFrameDurations
    );
    const fps =
      segments.find((segment) => typeof segment.fps === "number")?.fps ||
      DEFAULT_CONFIG.fps;

    console.log(
      `[DanceCatalog] Built match-end dance showcase for ${charKey}: ${frames.length} frames`
    );

    return {
      frames,
      loop: false,
      fps,
      useFrameDurations,
      allowOverride: true,
      metadata: {
        name: `dance_showcase_${charKey}`,
        celebrationType: "match_end_showcase",
      },
    };
  }

  /**
   * Get combo animation based on combo count
   * Now uses character-specific perfect beatmatch dances with different levels
   * 3-9: level_2 (dance_b frames)
   * 10+: level_3 (dance_c frames)
   */
  function getComboAnimation(comboCount, characterName = null) {
    console.log(
      `[DanceCatalog] getComboAnimation called with comboCount: ${comboCount}, character: ${characterName}`
    );

    if (comboCount >= 3 && comboCount < 10) {
      // Use level_2 animation for combo 3-9
      if (characterName) {
        const result = getCharacterPerfectBeatmatchDance(
          characterName,
          comboCount
        );
        console.log(
          `[DanceCatalog] Combo ${comboCount}: returning ${characterName} level_2 with ${result.frames.length} frames`
        );
        return result;
      } else {
        // Fallback to generic dance_b
        const config = DANCE_ANIMATION_CONFIGS.combo_3_6;
        console.log(
          `[DanceCatalog] Combo ${comboCount}: returning generic dance_b with ${config.frames.length} frames`
        );
        return {
          frames: config.frames,
          loop: config.loop,
          fps: config.fps,
          useFrameDurations: config.useFrameDurations,
        };
      }
    }

    if (comboCount >= 10) {
      // Use level_3 animation for combo 10+
      if (characterName) {
        const result = getCharacterPerfectBeatmatchDance(
          characterName,
          comboCount
        );
        console.log(
          `[DanceCatalog] Combo ${comboCount}: returning ${characterName} level_3 with ${result.frames.length} frames`
        );
        return result;
      } else {
        // Fallback to generic dance_c
        const config = DANCE_ANIMATION_CONFIGS.combo_10_plus;
        console.log(
          `[DanceCatalog] Combo ${comboCount}: returning generic dance_c with ${config.frames.length} frames`
        );
        return {
          frames: config.frames,
          loop: config.loop,
          fps: config.fps,
          useFrameDurations: config.useFrameDurations,
        };
      }
    }

    // Default: level_1 for combo < 3
    console.log(
      `[DanceCatalog] Combo ${comboCount}: falling back to level_1 animation`
    );
    if (characterName) {
      return getCharacterPerfectBeatmatchDance(characterName, comboCount);
    } else {
      return getPerfectBeatAnimation();
    }
  }

  /**
   * Get dance mode animation based on points
   * Now uses centralized configuration with offset and duration support
   * 1-3: dance_a
   * 4-7: dance_b
   * 8-9: dance_c
   * 10: dance_a + dance_b + dance_c sequence
   */
  function getDanceModeAnimation(points) {
    if (points <= 3) {
      const config = DANCE_ANIMATION_CONFIGS.dance_mode_1_3;
      return {
        frames: config.frames,
        loop: config.loop,
        fps: config.fps,
        useFrameDurations: config.useFrameDurations,
      };
    }
    if (points <= 7) {
      const config = DANCE_ANIMATION_CONFIGS.dance_mode_4_7;
      return {
        frames: config.frames,
        loop: config.loop,
        fps: config.fps,
        useFrameDurations: config.useFrameDurations,
      };
    }
    if (points <= 9) {
      const config = DANCE_ANIMATION_CONFIGS.dance_mode_8_9;
      return {
        frames: config.frames,
        loop: config.loop,
        fps: config.fps,
        useFrameDurations: config.useFrameDurations,
      };
    }
    // Match point (10): play a-b-c sequentially
    const config1 = DANCE_ANIMATION_CONFIGS.dance_mode_1_3;
    const config2 = DANCE_ANIMATION_CONFIGS.dance_mode_4_7;
    const config3 = DANCE_ANIMATION_CONFIGS.dance_mode_8_9;

    return {
      frames: [...config1.frames, ...config2.frames, ...config3.frames],
      loop: false,
      fps: 6,
      useFrameDurations: true,
    };
  }

  /**
   * Main API: Get animation for beatmatch (Classic Mode)
   * @param {string} beatQuality - "off", "good", or "perfect"
   * @param {number} comboCount - Number of consecutive perfects
   * @returns {Object} Animation configuration
   */
  function getClassicModeAnimation(
    beatQuality,
    comboCount,
    characterName = null
  ) {
    console.log(`[DanceCatalog] getClassicModeAnimation called:`, {
      beatQuality,
      comboCount,
      characterName,
      BEAT_QUALITY,
    });

    let result;
    if (beatQuality === BEAT_QUALITY.OFF) {
      result = {
        frames: getOffBeatFrames(),
        loop: false,
        ...DEFAULT_CONFIG,
        // Allow overriding any currently playing dance animation on miss
        allowOverride: true,
      };
      console.log(`[DanceCatalog] OFF beat: 4 random frames`, result.frames);
    } else if (beatQuality === BEAT_QUALITY.GOOD) {
      result = getGoodBeatAnimation();
      console.log(`[DanceCatalog] GOOD beat: 8 frames dance_a`);
    } else if (beatQuality === BEAT_QUALITY.PERFECT) {
      if (comboCount >= 3) {
        result = getComboAnimation(comboCount, characterName);
        console.log(
          `[DanceCatalog] PERFECT combo (${comboCount}): character-specific combo animation`
        );
      } else {
        // Special case: Use character-specific perfect beatmatch dance with offsets
        if (characterName) {
          result = getCharacterPerfectBeatmatchDance(characterName, comboCount);
          console.log(
            `[DanceCatalog] PERFECT beat: ${characterName} special beatmatch dance (combo ${comboCount}) with custom offsets`
          );
        } else {
          result = getPerfectBeatAnimation();
          console.log(
            `[DanceCatalog] PERFECT beat: 16 frames dance_a (no character specified)`
          );
        }
      }
    } else {
      result = getGoodBeatAnimation(); // fallback
      console.log(`[DanceCatalog] FALLBACK: good beat animation`);
    }

    console.log(`[DanceCatalog] Returning animation config:`, result);
    return result;
  }

  function cloneFxConfig(fx) {
    if (!fx) return null;
    return {
      type: fx.type,
      id: fx.id,
      options: fx.options ? { ...fx.options } : undefined,
    };
  }

  /**
   * Apply animation configuration to player object
   * @param {Object} player - Player object
   * @param {Object} animConfig - Animation configuration from catalog
   * @param {string} animName - Name for the animation
   */
  function applyAnimation(player, animConfig, animName) {
    const now = Date.now();

    // Throttle repeated calls: ignore re-applies within 40ms to avoid spamming when callers fire repeatedly
    if (player._lastDanceApply && now - player._lastDanceApply < 40) {
      console.log(
        `[DanceCatalog] Throttling applyAnimation ${animName} for P${player.padIndex}`
      );
      return;
    }

    const celebrationActive =
      player._activeCelebration &&
      (!player._celebrationStartedAt ||
        now - player._celebrationStartedAt <
          (player._celebrationMinDuration || 0));

    // Avoid interrupting an active dance animation unless caller explicitly overrides
    if (
      animConfig?.allowOverride !== true &&
      player.anim &&
      player.anim.includes("dance") &&
      !player.animFinished &&
      !celebrationActive
    ) {
      console.log(
        `[DanceCatalog] Skipping applyAnimation for ${animName} because player P${player.padIndex} is already in active dance ${player.anim}`
      );
      return;
    }

    console.log(`[DanceCatalog] applyAnimation called:`, {
      animName,
      animConfig,
      playerChar: player.charName,
      playerPadIndex: player.padIndex,
    });

    // If the exact animation is already playing and not finished, skip re-applying
    if (
      animConfig?.allowOverride !== true &&
      player.anim === animName &&
      !player.animFinished &&
      !celebrationActive
    ) {
      console.log(
        `[DanceCatalog] Skipping apply: ${animName} already playing for P${player.padIndex}`
      );
      return;
    }

    // Check if character data is available
    if (window.state?.characterConfigs) {
      const charData = window.state.characterConfigs[player.charName];
      if (charData) {
        console.log(
          `[DanceCatalog] Character data found for ${player.charName}:`,
          {
            availableAnimations: Object.keys(charData.animations),
            hasDanceA: !!charData.animations.dance_a,
            hasDanceB: !!charData.animations.dance_b,
            hasDanceC: !!charData.animations.dance_c,
            hasDanceE: !!charData.animations.dance_e,
          }
        );
      } else {
        console.error(
          `[DanceCatalog] ❌ No character data found for ${player.charName}`
        );
      }
    } else {
      console.error(
        `[DanceCatalog] ❌ Window state or characterConfigs not available`
      );
    }

    if (animConfig.frames && animConfig.frames.length > 0) {
      if (
        typeof animConfig.frames[0] === "object" &&
        animConfig.frames[0].frame
      ) {
        // Special frames with offsets and duration modifiers (like HP's perfect beatmatch dance)
        player.frames = animConfig.frames;
        console.log(
          `[DanceCatalog] Applied special frame objects with offsets and duration modifiers`
        );
      } else {
        // Regular frame strings
        player.frames = animConfig.frames;
      }

      player.loop = animConfig.loop;
      player.anim = animName;
      player._activeCelebration = animConfig?.metadata?.celebrationType || null;
      player._celebrationStartedAt = animConfig?.metadata?.startedAt ?? now;
      player._celebrationMinDuration =
        animConfig?.metadata?.minDuration ??
        (player._activeCelebration
          ? DEFAULT_CELEBRATIONS[player._activeCelebration]?.minDuration || 0
          : 0);
      // Reset start-log flag so renderer/physics prints start once
      player._danceStartedLogged = false;
      player.frameIndex = 0;
      player.frameTime = 0;
      player.animFinished = false;

      // Special handling for animations with frame-specific durations
      if (animConfig.useFrameDurations) {
        player.useFrameDurations = true;
        player.animSpeed = 1; // Use frame-specific durations, no speed multiplier
        console.log(`[DanceCatalog] Animation uses frame-specific durations`);
      } else {
        player.useFrameDurations = false;
        // Convert FPS to speed multiplier (animSpeed is a multiplier, not absolute FPS)
        const baseFps =
          window.state?.characterConfigs?.[player.charName]?.fps || 6;
        const targetFps = animConfig.fps || DEFAULT_CONFIG.fps;
        player.animSpeed = targetFps / baseFps;
        console.log(
          `[DanceCatalog] Speed multiplier: ${player.animSpeed} (target: ${targetFps}fps, base: ${baseFps}fps)`
        );
      }

      // Pass through optional FX configuration
      if (animConfig.fx) {
        player.fx = {
          hit: cloneFxConfig(animConfig.fx.hit),
          clank: cloneFxConfig(animConfig.fx.clank),
        };
      }

      // Mark last apply timestamp to prevent rapid re-applications
      player._lastDanceApply = now;

      const framePreview = animConfig.frames
        .slice(0, 4)
        .map((f) => (typeof f === "object" ? f.frame : f))
        .join(", ");
      console.log(
        `[DanceCatalog] ✅ Applied ${animName} to P${player.padIndex}: ${
          animConfig.frames.length
        } frames, loop=${animConfig.loop}, useFrameDurations=${
          animConfig.useFrameDurations || false
        }, preview: [${framePreview}${
          animConfig.frames.length > 4 ? "..." : ""
        }]`
      );
    } else {
      console.error(
        `[DanceCatalog] ❌ Failed to apply ${animName}: no frames provided`,
        animConfig
      );
    }
  }

  /**
   * Get the centralized dance animation configuration
   * This allows external access to modify dance animations
   * @returns {Object} The DANCE_ANIMATION_CONFIGS object
   */
  function getDanceConfigs() {
    return DANCE_ANIMATION_CONFIGS;
  }

  /**
   * Update a specific dance animation configuration
   * @param {string} configName - Name of the configuration to update
   * @param {Object} newConfig - New configuration object
   */
  function updateDanceConfig(configName, newConfig) {
    if (DANCE_ANIMATION_CONFIGS[configName]) {
      DANCE_ANIMATION_CONFIGS[configName] = {
        ...DANCE_ANIMATION_CONFIGS[configName],
        ...newConfig,
      };
      console.log(
        `[DanceCatalog] Updated dance config: ${configName}`,
        newConfig
      );
    } else {
      console.warn(`[DanceCatalog] Unknown dance config: ${configName}`);
    }
  }

  /**
   * Update frame-specific properties for a dance animation
   * @param {string} configName - Name of the configuration to update
   * @param {number} frameIndex - Index of the frame to update
   * @param {Object} frameProperties - Properties to update (d, offsetX, offsetY)
   */
  function updateDanceFrame(configName, frameIndex, frameProperties) {
    if (
      DANCE_ANIMATION_CONFIGS[configName] &&
      DANCE_ANIMATION_CONFIGS[configName].frames[frameIndex]
    ) {
      DANCE_ANIMATION_CONFIGS[configName].frames[frameIndex] = {
        ...DANCE_ANIMATION_CONFIGS[configName].frames[frameIndex],
        ...frameProperties,
      };
      console.log(
        `[DanceCatalog] Updated frame ${frameIndex} in ${configName}:`,
        frameProperties
      );
    } else {
      console.warn(
        `[DanceCatalog] Invalid frame update: ${configName}[${frameIndex}]`
      );
    }
  }

  /**
   * Update frame-specific properties for a character's perfect beatmatch dance
   * @param {string} characterName - Name of the character
   * @param {string} level - Level to update ("level_1", "level_2", or "level_3")
   * @param {number} frameIndex - Index of the frame to update
   * @param {Object} frameProperties - Properties to update (d, offsetX, offsetY)
   */
  function updateCharacterPerfectBeatmatchFrame(
    characterName,
    level,
    frameIndex,
    frameProperties
  ) {
    const charKey = characterName ? characterName.toLowerCase() : "charly";

    if (
      DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey] &&
      DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey][level] &&
      DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey][level].frames[
        frameIndex
      ]
    ) {
      DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey][level].frames[
        frameIndex
      ] = {
        ...DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey][level].frames[
          frameIndex
        ],
        ...frameProperties,
      };
      console.log(
        `[DanceCatalog] Updated frame ${frameIndex} in ${charKey} perfect beatmatch ${level}:`,
        frameProperties
      );
    } else {
      console.warn(
        `[DanceCatalog] Invalid character frame update: ${charKey}[${level}][${frameIndex}]`
      );
    }
  }

  /**
   * Get character-specific perfect beatmatch configuration
   * @param {string} characterName - Name of the character
   * @param {string} level - Level to get ("level_1", "level_2", or "level_3")
   * @returns {Object} Character's perfect beatmatch configuration for the specified level
   */
  function getCharacterPerfectBeatmatchConfig(
    characterName,
    level = "level_1"
  ) {
    const charKey = characterName ? characterName.toLowerCase() : "charly";
    const charConfig = DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey];
    return charConfig ? charConfig[level] || null : null;
  }

  /**
   * Update entire character perfect beatmatch configuration
   * @param {string} characterName - Name of the character
   * @param {string} level - Level to update ("level_1", "level_2", or "level_3")
   * @param {Object} newConfig - New configuration object
   */
  function updateCharacterPerfectBeatmatchConfig(
    characterName,
    level,
    newConfig
  ) {
    const charKey = characterName ? characterName.toLowerCase() : "charly";

    if (
      DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey] &&
      DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey][level]
    ) {
      DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey][level] = {
        ...DANCE_ANIMATION_CONFIGS.perfect_beatmatch[charKey][level],
        ...newConfig,
      };
      console.log(
        `[DanceCatalog] Updated ${charKey} perfect beatmatch ${level} config:`,
        newConfig
      );
    } else {
      console.warn(
        `[DanceCatalog] Unknown character or level: ${charKey}[${level}]`
      );
    }
  }

  /**
   * Export dance configurations as JSON string for backup/editing
   * @returns {string} JSON string of all dance configurations
   */
  function exportDanceConfigs() {
    return JSON.stringify(DANCE_ANIMATION_CONFIGS, null, 2);
  }

  /**
   * Import dance configurations from JSON string
   * @param {string} jsonString - JSON string containing dance configurations
   */
  function importDanceConfigs(jsonString) {
    try {
      const importedConfigs = JSON.parse(jsonString);
      Object.assign(DANCE_ANIMATION_CONFIGS, importedConfigs);
      console.log(
        `[DanceCatalog] Imported dance configurations:`,
        Object.keys(importedConfigs)
      );
    } catch (error) {
      console.error(
        `[DanceCatalog] Failed to import dance configurations:`,
        error
      );
    }
  }

  /**
   * Reset all dance configurations to defaults
   */
  function resetDanceConfigs() {
    // Re-initialize the configurations
    Object.keys(DANCE_ANIMATION_CONFIGS).forEach((key) => {
      delete DANCE_ANIMATION_CONFIGS[key];
    });

    // Re-populate with defaults (this would need to be done manually or by reloading the module)
    console.log(
      `[DanceCatalog] Reset dance configurations - reload page to restore defaults`
    );
  }

  /**
   * Test function to verify the new structure works correctly
   * @param {string} characterName - Character to test
   * @param {number} comboCount - Combo count to test
   */
  function testCharacterDanceStructure(
    characterName = "fritz",
    comboCount = 5
  ) {
    console.log(
      `[DanceCatalog] Testing ${characterName} with combo ${comboCount}:`
    );

    // Test level selection
    const result = getCharacterPerfectBeatmatchDance(characterName, comboCount);
    console.log(`[DanceCatalog] Result:`, {
      character: characterName,
      combo: comboCount,
      level:
        comboCount >= 10 ? "level_3" : comboCount >= 3 ? "level_2" : "level_1",
      frameCount: result.frames.length,
      firstFrame: result.frames[0]?.frame || "none",
    });

    return result;
  }

  return {
    BEAT_QUALITY,
    CELEBRATION_TYPES,
    getClassicModeAnimation,
    getDanceModeAnimation,
    getCelebrationAnimation,
    resolveCelebrationConfig,
    applyAnimation,
    getDanceConfigs,
    updateDanceConfig,
    updateDanceFrame,
    getCharacterPerfectBeatmatchDance, // NEW: Export for bar-based dance system
    getCharacterDanceShowcaseAnimation,
    getCharacterPerfectBeatmatchConfig,
    updateCharacterPerfectBeatmatchConfig,
    updateCharacterPerfectBeatmatchFrame,
    exportDanceConfigs,
    importDanceConfigs,
    resetDanceConfigs,
    testCharacterDanceStructure,
  };
})();
