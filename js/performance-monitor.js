/**
 * Performance Monitoring System
 *
 * Tracks frame times, identifies bottlenecks, and logs detailed performance metrics.
 * Designed to diagnose requestAnimationFrame violations (>16ms frame times).
 */

window.PerformanceMonitor = (() => {
  let enabled = false;
  let logToConsole = true;
  let frameTimes = [];
  let frameMetrics = [];
  const MAX_FRAMES_TO_TRACK = 300; // ~5 seconds at 60fps

  // Performance thresholds (in ms)
  const THRESHOLDS = {
    FRAME_WARNING: 16.67, // 60fps
    FRAME_ERROR: 33.33, // 30fps
    SECTION_WARNING: 5, // Section taking >5ms
    SECTION_ERROR: 10, // Section taking >10ms
  };

  // Current frame tracking
  let currentFrame = {
    startTime: 0,
    sections: [],
    totalTime: 0,
  };

  // Section stack for nested timing
  let sectionStack = [];

  /**
   * Initialize performance monitoring
   */
  function init() {
    enabled = true;
    frameTimes = [];
    frameMetrics = [];
    console.log("🔍 Performance Monitor initialized");
    console.log("📊 Call PerformanceMonitor.report() to see detailed analysis");
    console.log("🛑 Call PerformanceMonitor.stop() to disable monitoring");
  }

  /**
   * Start a new frame measurement
   */
  function startFrame() {
    if (!enabled) return;

    currentFrame = {
      startTime: performance.now(),
      sections: [],
      totalTime: 0,
      frameIndex: frameTimes.length,
    };
    sectionStack = [];
  }

  /**
   * Start measuring a code section
   */
  function startSection(name) {
    if (!enabled) return;

    const section = {
      name,
      startTime: performance.now(),
      children: [],
      depth: sectionStack.length,
    };

    // Add to parent or root
    if (sectionStack.length > 0) {
      sectionStack[sectionStack.length - 1].children.push(section);
    } else {
      currentFrame.sections.push(section);
    }

    sectionStack.push(section);
  }

  /**
   * End measuring a code section
   */
  function endSection(name) {
    if (!enabled || sectionStack.length === 0) return;

    const section = sectionStack.pop();
    const endTime = performance.now();
    section.duration = endTime - section.startTime;

    // Warn if section is slow
    if (section.duration > THRESHOLDS.SECTION_ERROR) {
      console.warn(
        `⚠️ Slow section: ${section.name} took ${section.duration.toFixed(2)}ms`
      );
    }

    // Verify name matches (catch mismatched start/end calls)
    if (section.name !== name) {
      console.error(
        `❌ Section mismatch: started "${section.name}", ended "${name}"`
      );
    }
  }

  /**
   * End frame measurement and log if slow
   */
  function endFrame() {
    if (!enabled) return;

    const endTime = performance.now();
    currentFrame.totalTime = endTime - currentFrame.startTime;

    // Store frame time
    frameTimes.push(currentFrame.totalTime);
    if (frameTimes.length > MAX_FRAMES_TO_TRACK) {
      frameTimes.shift();
    }

    // Store detailed metrics for slow frames
    if (currentFrame.totalTime > THRESHOLDS.FRAME_WARNING) {
      frameMetrics.push({ ...currentFrame });

      // Log critical frames immediately
      if (currentFrame.totalTime > THRESHOLDS.FRAME_ERROR) {
        console.error(
          `🚨 CRITICAL FRAME #${
            currentFrame.frameIndex
          }: ${currentFrame.totalTime.toFixed(2)}ms`
        );
        logFrameDetails(currentFrame);
      } else if (logToConsole) {
        console.warn(
          `⚠️ Slow frame #${
            currentFrame.frameIndex
          }: ${currentFrame.totalTime.toFixed(2)}ms`
        );
      }
    }

    // Keep only last 100 slow frames
    if (frameMetrics.length > 100) {
      frameMetrics.shift();
    }
  }

  /**
   * Log detailed breakdown of a frame
   */
  function logFrameDetails(frame) {
    console.group(
      `📊 Frame #${frame.frameIndex} Breakdown (${frame.totalTime.toFixed(
        2
      )}ms total)`
    );

    // Sort sections by duration
    const sortedSections = [...frame.sections].sort(
      (a, b) => b.duration - a.duration
    );

    for (const section of sortedSections) {
      const percent = ((section.duration / frame.totalTime) * 100).toFixed(1);
      const indent = "  ".repeat(section.depth);

      let emoji = "⏱️";
      if (section.duration > THRESHOLDS.SECTION_ERROR) {
        emoji = "🔴";
      } else if (section.duration > THRESHOLDS.SECTION_WARNING) {
        emoji = "🟡";
      }

      console.log(
        `${indent}${emoji} ${section.name}: ${section.duration.toFixed(
          2
        )}ms (${percent}%)`
      );

      // Log children recursively
      if (section.children && section.children.length > 0) {
        for (const child of section.children.sort(
          (a, b) => b.duration - a.duration
        )) {
          const childPercent = (
            (child.duration / frame.totalTime) *
            100
          ).toFixed(1);
          const childIndent = "  ".repeat(child.depth);
          console.log(
            `${childIndent}  ├─ ${child.name}: ${child.duration.toFixed(
              2
            )}ms (${childPercent}%)`
          );
        }
      }
    }

    console.groupEnd();
  }

  /**
   * Generate and log performance report
   */
  function report() {
    if (frameTimes.length === 0) {
      console.log("📊 No frame data collected yet");
      return;
    }

    // Calculate statistics
    const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const min = Math.min(...frameTimes);
    const max = Math.max(...frameTimes);
    const sorted = [...frameTimes].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    const slowFrames = frameTimes.filter(
      (t) => t > THRESHOLDS.FRAME_WARNING
    ).length;
    const criticalFrames = frameTimes.filter(
      (t) => t > THRESHOLDS.FRAME_ERROR
    ).length;

    console.log("");
    console.log("═══════════════════════════════════════");
    console.log("📊 PERFORMANCE REPORT");
    console.log("═══════════════════════════════════════");
    console.log(`🎞️  Total frames analyzed: ${frameTimes.length}`);
    console.log(
      `⏱️  Average frame time: ${avg.toFixed(2)}ms (${(1000 / avg).toFixed(
        1
      )} fps)`
    );
    console.log(`📈 Min / Max: ${min.toFixed(2)}ms / ${max.toFixed(2)}ms`);
    console.log(`📊 Percentiles:`);
    console.log(
      `   50th: ${p50.toFixed(2)}ms (${(1000 / p50).toFixed(1)} fps)`
    );
    console.log(
      `   95th: ${p95.toFixed(2)}ms (${(1000 / p95).toFixed(1)} fps)`
    );
    console.log(
      `   99th: ${p99.toFixed(2)}ms (${(1000 / p99).toFixed(1)} fps)`
    );
    console.log("");
    console.log(
      `⚠️  Slow frames (>16.67ms): ${slowFrames} (${(
        (slowFrames / frameTimes.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `🚨 Critical frames (>33.33ms): ${criticalFrames} (${(
        (criticalFrames / frameTimes.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log("═══════════════════════════════════════");
    console.log("");

    // Show worst offenders
    if (frameMetrics.length > 0) {
      console.log("🔥 TOP 5 SLOWEST FRAMES:");
      console.log("───────────────────────────────────────");

      const worstFrames = [...frameMetrics]
        .sort((a, b) => b.totalTime - a.totalTime)
        .slice(0, 5);

      for (const frame of worstFrames) {
        console.log(
          `Frame #${frame.frameIndex}: ${frame.totalTime.toFixed(2)}ms`
        );

        // Show top 3 sections for this frame
        const topSections = [...frame.sections]
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 3);

        for (const section of topSections) {
          const percent = ((section.duration / frame.totalTime) * 100).toFixed(
            1
          );
          console.log(
            `  └─ ${section.name}: ${section.duration.toFixed(
              2
            )}ms (${percent}%)`
          );
        }
      }
      console.log("═══════════════════════════════════════");
      console.log("");
    }

    // Aggregate section statistics
    if (frameMetrics.length > 0) {
      console.log("📈 SECTION PERFORMANCE BREAKDOWN:");
      console.log("───────────────────────────────────────");

      const sectionStats = {};

      // Collect all sections from all frames
      for (const frame of frameMetrics) {
        function processSections(sections) {
          for (const section of sections) {
            if (!sectionStats[section.name]) {
              sectionStats[section.name] = {
                totalTime: 0,
                count: 0,
                maxTime: 0,
              };
            }
            sectionStats[section.name].totalTime += section.duration;
            sectionStats[section.name].count++;
            sectionStats[section.name].maxTime = Math.max(
              sectionStats[section.name].maxTime,
              section.duration
            );

            if (section.children) {
              processSections(section.children);
            }
          }
        }
        processSections(frame.sections);
      }

      // Sort by total time
      const sortedSections = Object.entries(sectionStats)
        .map(([name, stats]) => ({
          name,
          avgTime: stats.totalTime / stats.count,
          maxTime: stats.maxTime,
          totalTime: stats.totalTime,
          count: stats.count,
        }))
        .sort((a, b) => b.totalTime - a.totalTime)
        .slice(0, 10);

      for (const section of sortedSections) {
        console.log(`${section.name}:`);
        console.log(
          `  Avg: ${section.avgTime.toFixed(
            2
          )}ms | Max: ${section.maxTime.toFixed(2)}ms | Calls: ${section.count}`
        );
      }
      console.log("═══════════════════════════════════════");
    }
  }

  /**
   * Stop monitoring and clear data
   */
  function stop() {
    enabled = false;
    console.log("🛑 Performance Monitor stopped");
  }

  /**
   * Clear all collected data
   */
  function clear() {
    frameTimes = [];
    frameMetrics = [];
    console.log("🧹 Performance data cleared");
  }

  /**
   * Enable/disable console logging for slow frames
   */
  function setLogging(enable) {
    logToConsole = enable;
    console.log(`📝 Console logging ${enable ? "enabled" : "disabled"}`);
  }

  return {
    init,
    startFrame,
    startSection,
    endSection,
    endFrame,
    report,
    stop,
    clear,
    setLogging,
    get isEnabled() {
      return enabled;
    },
  };
})();
