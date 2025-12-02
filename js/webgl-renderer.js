// WebGL Renderer für GPU-beschleunigte Effekte
window.WebGLRenderer = (() => {
  let gl, program, canvas, texture, lightTexture;
  let lightPos = { x: 0, y: 0 };
  let time = 0;
  let beatPhase = 0;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // NEW: Dance Phase uniforms state
  let dancePhaseActive = 0.0;
  let dancePhaseIntensity = 0.0;

  // NEW: Kill Zone Effect state
  let killZoneEffects = [];

  // NEW: Electric Perfect Beat Effect state
  let electricEffects = [];

  // NEW: Global Color Filter state
  let colorFilter = {
    color: [0.0, 0.0, 0.0],
    intensity: 0.0,
  };

  // Schneefall-System
  let snowflakes = [];
  let snowEnabled = false;

  // NEW: Performance monitoring for shader compilation
  let performanceStats = {
    shaderCompilationTime: 0,
    firstRenderTime: 0,
    collisionWarmupComplete: false,
    frameCount: 0,
    lastFrameTime: 0,
  };

  // Shader Code
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform mat3 u_matrix;

    void main() {
      gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
      v_texCoord = a_texCoord;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform vec2 u_lightPos;
    uniform vec2 u_vignetteCenter;
    uniform float u_time;
    uniform float u_beatPhase;
    uniform float u_lightIntensity;
    uniform float u_vignetteIntensity;
    uniform float u_discoBallHeight;
    uniform float u_dancePhaseActive;
    uniform float u_dancePhaseIntensity;
    // NEW: Kill Zone Effect uniforms
    uniform vec2 u_killZonePos;
    uniform float u_killZoneIntensity;
    uniform float u_killZoneRadius;
    uniform float u_killZoneTime;
    // NEW: Electric Perfect Beat Effect uniforms
    uniform vec2 u_electricPos;
    uniform float u_electricIntensity;
    uniform float u_electricRadius;
    uniform float u_electricTime;
    uniform float u_electricBranches;
    // NEW: Global Color Filter
    uniform vec3 u_colorFilterColor;
    uniform float u_colorFilterIntensity;
    varying vec2 v_texCoord;

    void main() {
      vec4 texColor = texture2D(u_texture, v_texCoord);

      // Vignette-Effekt (dunkler Rand)
      vec2 vignetteDir = v_texCoord - u_vignetteCenter;
      float vignetteDistance = length(vignetteDir);
      float vignette = 1.0 - smoothstep(0.3, 0.8, vignetteDistance);
      vignette *= u_vignetteIntensity;

      // Disco Ball Position (256 Pixel über Fritz)
      vec2 discoBallPos = u_lightPos;
      discoBallPos.y += u_discoBallHeight; // +256 Pixel in Y-Richtung

      // Disco Ball Licht-Effekt
      vec2 lightDir = v_texCoord - discoBallPos;
      float distance = length(lightDir);

      // Pulsierendes Licht im dynamischen BPM Rhythmus
      float beatPulse = sin(u_beatPhase * 6.28318) * 0.5 + 0.5;
      float lightRadius = 0.25 + beatPulse * 0.15;

      // Licht-Intensität basierend auf Distanz
      float lightIntensity = 1.0 / (1.0 + distance * 6.0);
      lightIntensity *= u_lightIntensity;

      // Disco-Farben (Rot, Grün, Blau im Beat)
      float colorPhase = u_beatPhase * 3.0; // 3 Farben pro Beat
      vec3 discoColor;
      if (colorPhase < 1.0) {
        discoColor = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), colorPhase);
      } else if (colorPhase < 2.0) {
        discoColor = mix(vec3(0.0, 1.0, 0.0), vec3(0.0, 0.0, 1.0), colorPhase - 1.0);
      } else {
        discoColor = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), colorPhase - 2.0);
      }

      // Spotlight-Effekt (stärker für besseren Kontrast)
      float spotlight = smoothstep(lightRadius, lightRadius * 0.3, distance);
      spotlight *= lightIntensity;

      // Kombiniere Original-Farbe mit Disco-Licht
      vec3 finalColor = texColor.rgb;
      finalColor += discoColor * spotlight * 1.2; // Stärkerer Effekt

      // DANCE PHASE: Technicolor/Chromatic Aberration Effekt
      if (u_dancePhaseActive > 0.5) {
        // Chromatic Aberration (RGB-Kanäle leicht versetzt)
        vec2 offset = vec2(0.002, 0.001) * u_dancePhaseIntensity;
        float r = texture2D(u_texture, v_texCoord + offset).r;
        float g = texture2D(u_texture, v_texCoord).g;
        float b = texture2D(u_texture, v_texCoord - offset).b;

        // Technicolor-Überblendung
        vec3 technicolorColor = vec3(r, g, b);
        float danceBlend = u_dancePhaseIntensity * 0.7;
        finalColor = mix(finalColor, technicolorColor, danceBlend);

        // Sättigung erhöhen für Dance Phase
        vec3 gray = vec3(dot(finalColor, vec3(0.299, 0.587, 0.114)));
        finalColor = mix(gray, finalColor, 1.0 + u_dancePhaseIntensity * 0.5);

        // Subtiler Puls-Effekt im Beat
        float dancePulse = sin(u_beatPhase * 6.28318 * 2.0) * 0.1 + 0.9;
        finalColor *= dancePulse;
      }

      // KILL ZONE EFFECT: Blut-Pool + Heat-Ripple
      vec2 killZoneDir = v_texCoord - u_killZonePos;
      float killZoneDistance = length(killZoneDir);

      if (u_killZoneIntensity > 0.0) {
        // Blut-Pool: Roter Kreis an der Kontaktstelle
        float bloodPool = 1.0 - smoothstep(0.0, u_killZoneRadius * 0.3, killZoneDistance);
        bloodPool *= u_killZoneIntensity;

        // Heat-Ripple: Pulsierende Wellen
        float ripple = sin(killZoneDistance * 20.0 - u_killZoneTime * 8.0) * 0.5 + 0.5;
        ripple *= 1.0 - smoothstep(0.0, u_killZoneRadius, killZoneDistance);
        ripple *= u_killZoneIntensity * 0.6;

        // Kombiniere Blut-Pool und Heat-Ripple
        vec3 bloodColor = vec3(0.8, 0.1, 0.1); // Dunkelrot
        vec3 heatColor = vec3(1.0, 0.3, 0.1);  // Hellrot-Orange

        finalColor = mix(finalColor, bloodColor, bloodPool);
        finalColor += heatColor * ripple;

        // Subtiler Screen-Shake-Effekt (leichte Verzerrung)
        float shakeIntensity = u_killZoneIntensity * 0.02;
        vec2 shakeOffset = vec2(
          sin(u_killZoneTime * 30.0) * shakeIntensity,
          cos(u_killZoneTime * 25.0) * shakeIntensity
        );

        // Nur in der Nähe des Kill-Zone-Kontakts
        float shakeMask = 1.0 - smoothstep(0.0, u_killZoneRadius * 2.0, killZoneDistance);
        finalColor = mix(finalColor, texture2D(u_texture, v_texCoord + shakeOffset * shakeMask).rgb, shakeMask * 0.1);
      }

      // ELECTRIC PERFECT BEAT EFFECT: Blitze um den Charakter
      vec2 electricDir = v_texCoord - u_electricPos;
      float electricDistance = length(electricDir);

      if (u_electricIntensity > 0.0) {
        // Basis-Elektrizität: Blauer Kern mit weißem Glow
        float electricCore = 1.0 - smoothstep(0.0, u_electricRadius * 0.2, electricDistance);
        electricCore *= u_electricIntensity;

        // Elektrische Blitze: Zickzack-Muster
        float branches = u_electricBranches;
        float branchAngle = atan(electricDir.y, electricDir.x);

        // Generiere mehrere Blitz-Zweige
        float lightning = 0.0;
        for (float i = 0.0; i < 8.0; i += 1.0) {
          if (i >= branches) break;

          float branchOffset = i / branches * 6.28318; // 2π
          float branchAngleOffset = branchOffset + sin(u_electricTime * 10.0 + i) * 0.5;

          // Zickzack-Muster für jeden Zweig
          float branchDistance = electricDistance;
          float zigzag = sin(branchDistance * 30.0 + u_electricTime * 15.0 + i * 2.0) * 0.1;
          float branchIntensity = 1.0 - smoothstep(0.0, u_electricRadius * 0.8, branchDistance + zigzag);

          // Winkel-basierte Zweig-Intensität
          float angleDiff = abs(branchAngle - branchAngleOffset);
          if (angleDiff > 3.14159) angleDiff = 6.28318 - angleDiff;
          float angleIntensity = 1.0 - smoothstep(0.0, 0.8, angleDiff);

          lightning += branchIntensity * angleIntensity * 0.3;
        }

        lightning *= u_electricIntensity;

        // Elektrische Farben: Blau-Weiß mit Pulsierung
        vec3 electricColor = mix(vec3(0.2, 0.4, 1.0), vec3(1.0, 1.0, 1.0),
                                sin(u_electricTime * 20.0) * 0.5 + 0.5);

        // Kombiniere Kern und Blitze
        finalColor = mix(finalColor, electricColor, electricCore);
        finalColor += electricColor * lightning * 2.0;

        // Elektrische Glow um den Charakter
        float glow = 1.0 - smoothstep(u_electricRadius * 0.5, u_electricRadius * 1.5, electricDistance);
        glow *= u_electricIntensity * 0.3;
        finalColor += electricColor * glow;
      }

      // Globaler Farbfilter (z. B. leichter Blaustich)
      float filterAmount = clamp(u_colorFilterIntensity, 0.0, 1.0);
      finalColor = mix(finalColor, u_colorFilterColor, filterAmount);

      // Vignette anwenden (dunkler Rand)
      finalColor *= (1.0 - vignette * 0.7);

      gl_FragColor = vec4(finalColor, texColor.a);
    }
  `;

  function init(canvasElement) {
    canvas = canvasElement;

    // Versuche verschiedene WebGL Contexts
    const contextAttributes = {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    };

    gl =
      canvas.getContext("webgl2", contextAttributes) ||
      canvas.getContext("webgl", contextAttributes) ||
      canvas.getContext("experimental-webgl", contextAttributes);

    if (!gl) {
      // Only log once to avoid spam
      if (!window.webglWarningShown) {
        console.warn(
          "🚨 WebGL not supported. Disco-ball effects will be disabled."
        );
        console.warn("Canvas element:", canvas);
        console.warn("Canvas dimensions:", canvas.width, "x", canvas.height);
        console.warn("Available contexts:", {
          webgl2: !!canvas.getContext("webgl2"),
          webgl: !!canvas.getContext("webgl"),
          experimental: !!canvas.getContext("experimental-webgl"),
        });
        window.webglWarningShown = true;
      }

      // Try to get more detailed error info
      try {
        const testContext = canvas.getContext("webgl");
        if (testContext) {
          console.warn(
            "🚨 WebGL context exists but init failed - possible shader issue"
          );
        }
      } catch (e) {
        console.warn("🚨 WebGL context creation failed:", e.message);
      }

      return false;
    }

    console.log("✅ WebGL initialized successfully!");
    console.log("WebGL Version:", gl.getParameter(gl.VERSION));
    console.log("WebGL Vendor:", gl.getParameter(gl.VENDOR));
    console.log("WebGL Renderer:", gl.getParameter(gl.RENDERER));

    // Debug: Check if shaders compile
    console.log("🎨 Testing shader compilation...");

    // Shader kompilieren
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    program = createProgram(vertexShader, fragmentShader);

    if (!program) {
      console.error(
        "🚨 Failed to create WebGL program - shaders may have compilation errors"
      );
      return false;
    }

    console.log("✅ WebGL program created successfully");

    // Quad für Rendering
    const positions = new Float32Array([
      -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Attribute setup
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    // NEW: Shader Pre-Warming - Compile all shader variations at startup
    console.log("🔥 Pre-warming shaders to prevent collision stuttering...");
    const preWarmStart = performance.now();
    preWarmShaders();
    performanceStats.shaderCompilationTime = performance.now() - preWarmStart;
    console.log(
      `🔥 Shader pre-warming took ${performanceStats.shaderCompilationTime.toFixed(
        2
      )}ms`
    );

    console.log("✅ WebGL setup complete - ready for rendering");
    return true;
  }

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const shaderType = type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT";
      console.error(
        `🚨 ${shaderType} Shader compilation error:`,
        gl.getShaderInfoLog(shader)
      );
      console.error("🚨 Shader source:", source);
      gl.deleteShader(shader);
      return null;
    }

    const shaderType = type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT";
    console.log(`✅ ${shaderType} Shader compiled successfully`);
    return shader;
  }

  function createProgram(vertexShader, fragmentShader) {
    if (!vertexShader || !fragmentShader) {
      console.error("🚨 Cannot create program - missing shaders");
      return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("🚨 Program linking error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    console.log("✅ WebGL program linked successfully");
    return program;
  }

  /**
   * Pre-warm shaders to prevent stuttering during first collision
   * This triggers all shader compilation paths that would normally happen during gameplay
   */
  function preWarmShaders() {
    if (!gl || !program) {
      console.warn("🔥 Cannot pre-warm shaders - WebGL not available");
      return;
    }

    console.log("🔥 Pre-warming shader compilation paths...");

    // Create a dummy canvas for texture operations
    const dummyCanvas = document.createElement("canvas");
    dummyCanvas.width = 256;
    dummyCanvas.height = 256;
    const dummyCtx = dummyCanvas.getContext("2d");
    dummyCtx.fillStyle = "rgba(128, 128, 128, 255)";
    dummyCtx.fillRect(0, 0, 256, 256);

    // Pre-warm texture creation and binding
    const testTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, testTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      dummyCanvas
    );

    // Pre-warm all uniform locations (triggers shader compilation)
    const uniformNames = [
      "u_matrix",
      "u_texture",
      "u_lightPos",
      "u_vignetteCenter",
      "u_time",
      "u_beatPhase",
      "u_lightIntensity",
      "u_vignetteIntensity",
      "u_discoBallHeight",
      "u_dancePhaseActive",
      "u_dancePhaseIntensity",
      "u_killZonePos",
      "u_killZoneIntensity",
      "u_killZoneRadius",
      "u_killZoneTime",
      "u_electricPos",
      "u_electricIntensity",
      "u_electricRadius",
      "u_electricTime",
      "u_electricBranches",
      "u_colorFilterColor",
      "u_colorFilterIntensity",
    ];

    gl.useProgram(program);

    // Pre-warm all uniform locations
    uniformNames.forEach((name) => {
      const location = gl.getUniformLocation(program, name);
      if (location) {
        // Set dummy values to trigger shader compilation
        switch (name) {
          case "u_matrix":
            gl.uniformMatrix3fv(location, false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
            break;
          case "u_lightPos":
          case "u_vignetteCenter":
          case "u_killZonePos":
          case "u_electricPos":
            gl.uniform2f(location, 0.5, 0.5);
            break;
          case "u_colorFilterColor":
            gl.uniform3f(location, 0.0, 0.0, 0.0);
            break;
          case "u_time":
          case "u_beatPhase":
          case "u_lightIntensity":
          case "u_vignetteIntensity":
          case "u_discoBallHeight":
          case "u_dancePhaseActive":
          case "u_dancePhaseIntensity":
          case "u_killZoneIntensity":
          case "u_killZoneRadius":
          case "u_killZoneTime":
          case "u_electricIntensity":
          case "u_electricRadius":
          case "u_electricTime":
          case "u_electricBranches":
          case "u_colorFilterIntensity":
            gl.uniform1f(location, 0.0);
            break;
        }
      }
    });

    // Pre-warm viewport and rendering
    gl.viewport(0, 0, 256, 256);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Clean up test texture
    gl.deleteTexture(testTexture);

    console.log(
      "✅ Shader pre-warming complete - collision stuttering should be eliminated"
    );
  }

  function updateLightPosition(x, y) {
    lightPos.x = x;
    lightPos.y = y;
  }

  function updateBeatPhase(phase) {
    beatPhase = phase;
  }

  function initSnow() {
    if (!canvas) {
      console.warn("Canvas not available for snow initialization");
      return;
    }

    snowflakes = [];
    for (let i = 0; i < 50; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        size: 1 + Math.random() * 3,
        drift: (Math.random() - 0.5) * 0.5,
      });
    }
  }

  function updateSnow(dt, state) {
    if (!snowEnabled || !canvas) return;

    snowflakes.forEach((flake) => {
      flake.y += flake.speed * dt * 100;

      // Drift nur wenn keine Kamera-Info verfügbar ist (sonst wird es über Parallax geregelt)
      if (!state || !state.camera) {
        flake.x += flake.drift * dt * 100;
      }

      if (flake.y > canvas.height) {
        flake.y = -10;
        flake.x = Math.random() * canvas.width;
      }
      if (flake.x < 0) flake.x = canvas.width;
      if (flake.x > canvas.width) flake.x = 0;
    });
  }

  function renderSnow(ctx) {
    if (!snowEnabled || !snowflakes.length) return;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    snowflakes.forEach((flake) => {
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function renderSnowWithParallax(ctx, state) {
    if (!snowEnabled || !snowflakes.length || !state.camera) return;

    ctx.save();

    // Parallax-Scrolling für Schneeflocken (langsamer als Hintergrund)
    const parallaxFactor = 0.3; // Schneeflocken bewegen sich langsamer als der Hintergrund
    const offsetX =
      (state.camera.x - GameState.CONSTANTS.NATIVE_WIDTH / 2) * parallaxFactor;
    const offsetY =
      (state.camera.y - GameState.CONSTANTS.NATIVE_HEIGHT / 2) * parallaxFactor;

    ctx.translate(-offsetX, -offsetY);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    snowflakes.forEach((flake) => {
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function renderSnowOnly(ctx, state) {
    // Nur Schneeflocken rendern (ohne andere WebGL-Effekte)
    if (snowEnabled) {
      renderSnowWithParallax(ctx, state);
    }
  }

  function renderDiscoBallOnly(ctx, state) {
    // Nur Disco-Ball Effekte rendern (ohne Schneeflocken)
    if (gl && program) {
      renderWithEffects(ctx, null, null, null, 0.0, 0.0);
    }
  }

  function setSnowEnabled(enabled) {
    snowEnabled = enabled;
    if (enabled && snowflakes.length === 0) {
      initSnow();
    }
  }

  function render(canvas2D, state) {
    if (!gl || !program) return;

    // NEW: Performance monitoring
    const frameStart = performance.now();
    performanceStats.frameCount++;

    // Log performance stats every 60 frames (1 second at 60fps)
    if (performanceStats.frameCount % 60 === 0) {
      const frameTime = frameStart - performanceStats.lastFrameTime;
      if (frameTime > 20) {
        // More than 20ms = stutter
        console.warn(
          `⚠️ Frame stutter detected: ${frameTime.toFixed(2)}ms (frame ${
            performanceStats.frameCount
          })`
        );
      }
    }
    performanceStats.lastFrameTime = frameStart;

    time += 0.016; // ~60 FPS

    // Update Beat Phase (Dynamic BPM)
    // Get BPM from window.state if available
    const currentBPM = window.state?.currentBPM || 117;
    const beatsPerSecond = currentBPM / 60;
    const beatTime = (time * beatsPerSecond) % 1.0;
    updateBeatPhase(beatTime);

    // Update Schneefall
    updateSnow(0.016, state);

    // NEW: Update Kill Zone Effects
    updateKillZoneEffects(0.016);

    // Electric effects disabled; updateElectricEffects is a no-op.

    // Finde Fritz Position und Disco-Ball Status
    let fritzPos = null;
    let discoBallPos = null;
    let targetPos = null;
    let vignetteCenter = null;
    let vignetteIntensity = 0.0;
    let lightIntensity = 0.0;

    // Finde Fritz (Player mit charName "fritz")
    if (state.players) {
      for (const player of state.players) {
        if (player.charName === "fritz") {
          fritzPos = { x: player.pos.x, y: player.pos.y };
          break;
        }
      }
    }

    // Finde Disco-Ball Position
    if (state.projectiles) {
      for (const proj of state.projectiles) {
        if (proj.type === "ulti_check" && proj.isDiscoBall) {
          discoBallPos = { x: proj.x, y: proj.y };
          break;
        }
      }
    }

    // Vignette-Logik basierend auf Fritz Ultimate Status
    if (fritzPos) {
      // Check if Fritz is in ultimate start phase
      const fritzPlayer = state.players.find((p) => p.charName === "fritz");
      if (fritzPlayer && fritzPlayer.ultiPhase === "start") {
        // Vignette um Fritz während r2_l2_ulti_start
        vignetteCenter = fritzPos;
        vignetteIntensity = 0.8;
        lightIntensity = 0.0; // No disco ball yet
      } else if (
        fritzPlayer &&
        (fritzPlayer.ultiPhase === "check" || discoBallPos)
      ) {
        // Disco-Ball aktiv - Vignette um Target oder Disco-Ball Position
        if (fritzPlayer.ultiTarget) {
          targetPos = {
            x: fritzPlayer.ultiTarget.pos.x,
            y: fritzPlayer.ultiTarget.pos.y,
          };
          vignetteCenter = targetPos;
        } else if (discoBallPos) {
          vignetteCenter = discoBallPos;
        } else {
          vignetteCenter = fritzPos; // Fallback to Fritz position
        }
        vignetteIntensity = 0.9; // Stärkere Vignette
        lightIntensity = 1.0; // Volle Disco-Ball Intensität
      }
    }

    // Rendere mit entsprechenden Effekten
    if (vignetteCenter || discoBallPos) {
      renderWithEffects(
        canvas2D,
        fritzPos,
        discoBallPos,
        vignetteCenter,
        vignetteIntensity,
        lightIntensity
      );
    } else {
      // Normales Rendering ohne Effekte
      renderWithEffects(canvas2D, null, null, null, 0.0, 0.0);
    }

    // Schneefall über WebGL rendern
    renderSnow(canvas2D);
  }

  function renderWithEffects(
    canvas2D,
    fritzPos,
    discoBallPos,
    vignetteCenter,
    vignetteIntensity,
    lightIntensity
  ) {
    gl.useProgram(program);

    // Matrix für Canvas-zu-WebGL Transformation
    const matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

    const matrixLocation = gl.getUniformLocation(program, "u_matrix");
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // Texture von Canvas2D kopieren
    if (!texture) {
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      canvas2D.canvas
    );

    // Light Position (Fritz Position als Basis)
    let lightPosX = 0.5,
      lightPosY = 0.5; // Default center
    if (fritzPos) {
      lightPosX = fritzPos.x / canvas.width;
      lightPosY = 1.0 - fritzPos.y / canvas.height; // Y invertieren
    }

    // Vignette Center
    let vignetteCenterX = 0.5,
      vignetteCenterY = 0.5; // Default center
    if (vignetteCenter) {
      vignetteCenterX = vignetteCenter.x / canvas.width;
      vignetteCenterY = 1.0 - vignetteCenter.y / canvas.height; // Y invertieren
    }

    // Disco-Ball Höhe (256 Pixel = 0.185 in normalisierten Koordinaten bei 1380px Höhe)
    const discoBallHeight = 256 / canvas.height;

    // Uniforms setzen
    const lightPosLocation = gl.getUniformLocation(program, "u_lightPos");
    gl.uniform2f(lightPosLocation, lightPosX, lightPosY);

    const vignetteCenterLocation = gl.getUniformLocation(
      program,
      "u_vignetteCenter"
    );
    gl.uniform2f(vignetteCenterLocation, vignetteCenterX, vignetteCenterY);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    gl.uniform1f(timeLocation, time);

    const beatPhaseLocation = gl.getUniformLocation(program, "u_beatPhase");
    gl.uniform1f(beatPhaseLocation, beatPhase);

    const lightIntensityLocation = gl.getUniformLocation(
      program,
      "u_lightIntensity"
    );
    gl.uniform1f(lightIntensityLocation, lightIntensity);

    const vignetteIntensityLocation = gl.getUniformLocation(
      program,
      "u_vignetteIntensity"
    );
    gl.uniform1f(vignetteIntensityLocation, vignetteIntensity);

    const discoBallHeightLocation = gl.getUniformLocation(
      program,
      "u_discoBallHeight"
    );
    gl.uniform1f(discoBallHeightLocation, discoBallHeight);

    const dancePhaseActiveLocation = gl.getUniformLocation(
      program,
      "u_dancePhaseActive"
    );

    const dancePhaseIntensityLocation = gl.getUniformLocation(
      program,
      "u_dancePhaseIntensity"
    );

    // NEW: Kill Zone Effect Uniform Locations
    const killZonePosLocation = gl.getUniformLocation(program, "u_killZonePos");
    const killZoneIntensityLocation = gl.getUniformLocation(
      program,
      "u_killZoneIntensity"
    );
    const killZoneRadiusLocation = gl.getUniformLocation(
      program,
      "u_killZoneRadius"
    );
    const killZoneTimeLocation = gl.getUniformLocation(
      program,
      "u_killZoneTime"
    );

    // NEW: Electric Effect Uniform Locations
    const electricPosLocation = gl.getUniformLocation(program, "u_electricPos");
    const electricIntensityLocation = gl.getUniformLocation(
      program,
      "u_electricIntensity"
    );
    const electricRadiusLocation = gl.getUniformLocation(
      program,
      "u_electricRadius"
    );
    const electricTimeLocation = gl.getUniformLocation(
      program,
      "u_electricTime"
    );
    const electricBranchesLocation = gl.getUniformLocation(
      program,
      "u_electricBranches"
    );
    const colorFilterColorLocation = gl.getUniformLocation(
      program,
      "u_colorFilterColor"
    );
    const colorFilterIntensityLocation = gl.getUniformLocation(
      program,
      "u_colorFilterIntensity"
    );

    // Dance Phase Uniforms (wird von außen gesetzt)
    gl.uniform1f(dancePhaseActiveLocation, dancePhaseActive);
    gl.uniform1f(dancePhaseIntensityLocation, dancePhaseIntensity);

    // Kill Zone Effect Uniforms (aktiver Effekt)
    const activeKillZone =
      killZoneEffects.length > 0 ? killZoneEffects[0] : null;
    if (activeKillZone) {
      gl.uniform2f(
        killZonePosLocation,
        activeKillZone.x / canvas.width,
        1.0 - activeKillZone.y / canvas.height
      );
      gl.uniform1f(killZoneIntensityLocation, activeKillZone.intensity);
      gl.uniform1f(killZoneRadiusLocation, activeKillZone.radius);
      gl.uniform1f(killZoneTimeLocation, activeKillZone.time);
    } else {
      gl.uniform2f(killZonePosLocation, 0.5, 0.5);
      gl.uniform1f(killZoneIntensityLocation, 0.0);
      gl.uniform1f(killZoneRadiusLocation, 0.0);
      gl.uniform1f(killZoneTimeLocation, 0.0);
    }

    // Electric Effect Uniforms (aktiver Effekt)
    const activeElectric =
      electricEffects.length > 0 ? electricEffects[0] : null;
    if (activeElectric) {
      gl.uniform2f(
        electricPosLocation,
        activeElectric.x / canvas.width,
        1.0 - activeElectric.y / canvas.height
      );
      gl.uniform1f(electricIntensityLocation, activeElectric.intensity);
      gl.uniform1f(electricRadiusLocation, activeElectric.radius);
      gl.uniform1f(electricTimeLocation, activeElectric.time);
      gl.uniform1f(electricBranchesLocation, activeElectric.branches);
    } else {
      gl.uniform2f(electricPosLocation, 0.5, 0.5);
      gl.uniform1f(electricIntensityLocation, 0.0);
      gl.uniform1f(electricRadiusLocation, 0.0);
      gl.uniform1f(electricTimeLocation, 0.0);
      gl.uniform1f(electricBranchesLocation, 0.0);
    }

    // Global Color Filter Uniforms
    gl.uniform3f(
      colorFilterColorLocation,
      colorFilter.color[0],
      colorFilter.color[1],
      colorFilter.color[2]
    );
    gl.uniform1f(colorFilterIntensityLocation, colorFilter.intensity);

    // DEBUG: Log Dance Phase state every 60 frames
    if (Math.floor(time * 60) % 60 === 0) {
      console.log(
        `🎨 WebGL Render: dancePhaseActive=${dancePhaseActive}, intensity=${dancePhaseIntensity}`
      );
    }

    // Rendern
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function setDancePhase(active, intensity = 1.0) {
    console.log(
      `🎨 setDancePhase called: active=${active}, intensity=${intensity}`
    );
    console.log(`🎨 WebGL state: gl=${!!gl}, program=${!!program}`);

    if (!gl || !program) {
      console.warn("🎨 WebGL not available for Dance Phase effects");
      return;
    }

    const oldActive = dancePhaseActive;
    const oldIntensity = dancePhaseIntensity;

    dancePhaseActive = active ? 1.0 : 0.0;
    dancePhaseIntensity = intensity;

    console.log(
      `🎨 WebGL Dance Phase: ${
        active ? "ACTIVE" : "INACTIVE"
      } (intensity: ${intensity}) [${oldActive}→${dancePhaseActive}, ${oldIntensity}→${dancePhaseIntensity}]`
    );
  }

  // NEW: Kill Zone Effect Functions
  function triggerKillZoneEffect(x, y, intensity = 1.0) {
    if (!gl || !program) {
      console.warn("🎨 WebGL not available for Kill Zone effects");
      return;
    }

    console.log(
      `🩸 Kill Zone effect triggered at (${x}, ${y}) with intensity ${intensity}`
    );

    const effect = {
      x: x,
      y: y,
      intensity: intensity,
      radius: 0.05, // Start radius (5% of screen)
      maxRadius: 0.15, // Max radius (15% of screen)
      time: 0,
      duration: 2.0, // 2 seconds duration
      active: true,
    };

    killZoneEffects.push(effect);

    // Limit to 3 simultaneous effects
    if (killZoneEffects.length > 3) {
      killZoneEffects.shift(); // Remove oldest
    }
  }

  function updateKillZoneEffects(dt) {
    for (let i = killZoneEffects.length - 1; i >= 0; i--) {
      const effect = killZoneEffects[i];
      effect.time += dt;

      // Expand radius over time
      const progress = effect.time / effect.duration;
      effect.radius =
        0.05 + (effect.maxRadius - 0.05) * Math.min(progress * 2, 1.0);

      // Fade intensity over time
      const fadeProgress = Math.max(
        0,
        (effect.time - 0.5) / (effect.duration - 0.5)
      );
      effect.intensity = effect.intensity * (1.0 - fadeProgress);

      // Remove expired effects
      if (effect.time >= effect.duration) {
        killZoneEffects.splice(i, 1);
        console.log(
          `🩸 Kill Zone effect expired after ${effect.duration.toFixed(2)}s`
        );
      }
    }
  }

  // Electric Perfect Beat effect removed: keep API as no-op to preserve compatibility.
  function triggerElectricEffect(x, y, intensity = 1.0, branches = 3) {
    // NO-OP: Lightning/electric visuals disabled because they were not rendering correctly.
    return;
  }

  // updateElectricEffects is now a no-op because electric effects were disabled.
  function updateElectricEffects(dt) {
    // NO-OP
    return;
  }

  /**
   * Warm up collision effects to prevent first-hit stuttering
   * This should be called during game initialization
   */
  function warmupCollisionEffects() {
    if (!gl || !program) {
      console.warn("🔥 Cannot warmup collision effects - WebGL not available");
      return;
    }

    console.log("🔥 Warming up collision effects...");

    // Trigger dummy collision effects to compile shader paths
    triggerKillZoneEffect(0.5, 0.5, 0.1); // Minimal intensity

    // Update effects for a few frames to ensure compilation
    for (let i = 0; i < 3; i++) {
      updateKillZoneEffects(0.016);
      // electric effects intentionally skipped (disabled)
    }

    // Clear the dummy effects
    killZoneEffects.length = 0;
    // electricEffects cleared by design (no-op)

    performanceStats.collisionWarmupComplete = true;
    console.log("✅ Collision effects warmed up - first hit should be smooth");
  }

  function setColorFilter(filterConfig) {
    if (!filterConfig || typeof filterConfig !== "object") {
      colorFilter.color[0] = 0.0;
      colorFilter.color[1] = 0.0;
      colorFilter.color[2] = 0.0;
      colorFilter.intensity = 0.0;
      return;
    }

    let rgb = null;

    if (Array.isArray(filterConfig.rgb)) {
      rgb = filterConfig.rgb;
    } else if (Array.isArray(filterConfig.color)) {
      rgb = filterConfig.color;
    } else if (filterConfig.rgb && typeof filterConfig.rgb === "object") {
      rgb = [filterConfig.rgb.r, filterConfig.rgb.g, filterConfig.rgb.b];
    } else if (filterConfig.color && typeof filterConfig.color === "object") {
      rgb = [filterConfig.color.r, filterConfig.color.g, filterConfig.color.b];
    }

    if (!rgb || rgb.length < 3) {
      rgb = [0.0, 0.0, 0.0];
    }

    colorFilter.color[0] = clamp(Number(rgb[0]) || 0.0, 0.0, 1.0);
    colorFilter.color[1] = clamp(Number(rgb[1]) || 0.0, 0.0, 1.0);
    colorFilter.color[2] = clamp(Number(rgb[2]) || 0.0, 0.0, 1.0);

    const intensity =
      Number(
        filterConfig.intensity ?? filterConfig.strength ?? filterConfig.amount
      ) || 0.0;
    colorFilter.intensity = clamp(intensity, 0.0, 1.0);
  }

  return {
    init,
    render,
    updateLightPosition,
    updateBeatPhase,
    setSnowEnabled,
    initSnow,
    renderSnowOnly,
    renderDiscoBallOnly,
    setDancePhase,
    // NEW: Kill Zone Effect API
    triggerKillZoneEffect,
    updateKillZoneEffects,
    // NEW: Electric Effect API
    triggerElectricEffect,
    updateElectricEffects,
    // NEW: Collision Warmup API
    warmupCollisionEffects,
    // NEW: Performance Stats API
    getPerformanceStats: () => performanceStats,
    // NEW: Global Color Filter API
    setColorFilter,
  };
})();
