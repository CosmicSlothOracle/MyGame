window.UltimeterManager = (() => {
  const GAIN_CONFIGS = {
    perfect_beat: 15, // Perfektes Timing
    good_beat: 8, // Gutes Timing
    bad_beat: -5, // Schlechtes Timing
    dance_success: 20, // Dance-Move Erfolg
    dance_fail: -10, // Dance-Move Fehlschlag
  };

  function gainUltimeter(player, gainType, state, multiplier = 1.0) {
    const config = GAIN_CONFIGS[gainType] || 0;
    // For perfect_beat, we now treat it as +1 segment (10 segments total)
    // To keep backward compatibility with current float system (0-100),
    // 1 segment = 10 points.

    let actualGain =
      config * (player.ultimeter.gainRate || 1.0) * (multiplier || 1.0);

    // Override for perfect_beat to ensure exactly 1 segment (10 points)
    if (gainType === "perfect_beat") {
      actualGain = 10 * (multiplier || 1.0);
    }

    player.ultimeter.current = Math.max(
      0,
      Math.min(player.ultimeter.max, player.ultimeter.current + actualGain)
    );

    player.ultimeter.isReady = player.ultimeter.current >= player.ultimeter.max;
    player.ultimeter.lastGainTime = state.lastTime;

    // Visual Feedback
    if (actualGain > 0) {
      spawnUltimeterGainEffect(state, player, actualGain);
    } else if (actualGain < 0) {
      spawnUltimeterLossEffect(state, player, Math.abs(actualGain));
    }

    console.log(
      `[Ultimeter] P${player.padIndex}: ${gainType} = ${actualGain}, now ${player.ultimeter.current}/${player.ultimeter.max}`
    );
  }

  // NEW: Helper to lose exactly one segment
  function loseSegment(player, state) {
    const segmentValue = 10; // 10% of 100
    const loss = -segmentValue;

    player.ultimeter.current = Math.max(0, player.ultimeter.current + loss);
    player.ultimeter.isReady = false; // Losing a segment always breaks readiness

    spawnUltimeterLossEffect(state, player, Math.abs(loss));
    console.log(
      `[Ultimeter] P${player.padIndex}: Lost segment! Now ${player.ultimeter.current}/${player.ultimeter.max}`
    );
  }

  function canUseUltimate(player) {
    return (
      player.ultimeter.isReady &&
      player.attack?.type === "none" &&
      !player.roll?.active
    );
  }

  function consumeUltimate(player, state) {
    if (canUseUltimate(player)) {
      // DEBUG: Don't consume if infinite ultimeter is enabled
      if (!state?.debug?.infiniteUltimeter) {
        player.ultimeter.current = 0;
        player.ultimeter.isReady = false;
      }
      console.log(
        `[Ultimeter] P${player.padIndex}: Ultimate consumed! All segments used.`
      );
      return true;
    }
    return false;
  }

  function spawnUltimeterGainEffect(state, player, amount) {
    if (!state.fxAtlas) return;

    // Only show numeric feedback for ultimeter gain
    // Removed fx_hurt effect - using only beatmatch particles for visual feedback
    if (window.spawnDamageEffect) {
      window.spawnDamageEffect(state, player, amount);
    }
  }

  function spawnUltimeterLossEffect(state, player, amount) {
    if (!state.fxAtlas) return;

    // Only show numeric feedback for ultimeter loss
    // Removed fx_hurt effect - no visual effect needed for bad timing
    if (window.spawnDamageEffect) {
      window.spawnDamageEffect(state, player, -amount);
    }
  }

  return {
    gainUltimeter,
    loseSegment, // Exported
    canUseUltimate,
    consumeUltimate,
    GAIN_CONFIGS,
  };
})();
