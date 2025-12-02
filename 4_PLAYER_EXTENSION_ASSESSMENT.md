# Einschätzung: Erweiterung auf 4 Spieler (2v2 Tag Team & Free-for-All)

**Datum:** Aktuelle Codebase-Analyse
**Fokus:** Combat System, Hit Detection, Player Management
**Ziel:** 4 Human Players (2v2 Tag Team + 4-Player Free-for-All)

---

## 🎯 EXECUTIVE SUMMARY

**Kurzantwort:** Die Erweiterung ist **machbar, aber nicht trivial**. Die Core-Combat-Logik ist bereits generisch genug, aber mehrere kritische Systeme sind hardcoded auf 2 Spieler. Die größten Hürden sind **Camera System**, **Input Management** und **Team-Logik** (für 2v2).

**Geschätzter Aufwand:**

- **Free-for-All (4 Spieler):** ~2-3 Tage (moderate Komplexität)
- **2v2 Tag Team:** ~4-5 Tage (höhere Komplexität durch Team-Logik)

---

## ✅ BEREITS GENERISCH / FUNKTIONIERT MIT 4 SPIELERN

### 1. **Hit Detection System** ✅

**Status:** Vollständig generisch

```4521:4524:js/attack-system.js
    for (let j = 0; j < state.players.length; j++) {
      if (i === j) continue;
      const target = state.players[j];
      if (target.eliminated) continue;
```

- `applyHitDetection()` iteriert bereits über `state.players.length`
- Keine hardcoded Annahmen über Spieleranzahl
- `resolveHits()` verarbeitet alle Hits in `state.pendingHits` ohne Limitierungen
- **✅ Keine Änderungen nötig**

### 2. **Physics Update Loop** ✅

**Status:** Vollständig generisch

```65:67:js/physics.js
    for (let i = 0; i < state.players.length; i++) {
      updatePlayer(scaledDt, state, state.players[i], i, canvas);
    }
```

- Alle Update-Loops verwenden `state.players.length`
- **✅ Keine Änderungen nötig**

### 3. **Match End Detection** ✅

**Status:** Bereits generisch, aber Logik muss für Teams erweitert werden

```8930:8958:js/physics.js
  function checkMatchEnd(state) {
    if (!state.players || state.players.length < 2) return;

    const alivePlayers = [];
    for (let i = 0; i < state.players.length; i++) {
      if (!state.players[i].eliminated) {
        alivePlayers.push(i);
      }
    }

    if (alivePlayers.length === 1) {
      const survivor = alivePlayers[0];
      state.matchEnd.lastKnownAliveIndex = survivor;
      startMatchEndSequence(state, survivor);
    } else if (alivePlayers.length === 0) {
      const fallbackWinner = state.matchEnd.lastKnownAliveIndex;
      if (typeof fallbackWinner === "number") {
        startMatchEndSequence(state, fallbackWinner);
      } else if (!state.matchEnd.isActive) {
        debugLog(
          "[MatchEnd] No surviving players detected; defaulting winner to player 0"
        );
        state.matchEnd.lastKnownAliveIndex = 0;
        startMatchEndSequence(state, 0);
      }
    } else {
      state.matchEnd.lastKnownAliveIndex = null;
    }
  }
```

- Funktioniert für Free-for-All (1 Survivor = Winner)
- **⚠️ Für 2v2:** Muss Team-Logik prüfen (Team mit 0 eliminierten Spielern gewinnt)

### 4. **Player Creation** ✅

**Status:** Vollständig generisch

```2037:2040:js/main.js
      state.players = activeSpawns.map((s, i) => {
        const charName = state.selectedCharacters[i];
        return Physics.createPlayer(state, charName, s, i);
      });
```

- `createPlayer()` akzeptiert beliebigen `index`
- **✅ Keine Änderungen nötig**

### 5. **Rendering** ✅

**Status:** Vollständig generisch

```214:216:js/renderer.js
    for (const p of state.players) {
      if (!p.eliminated) drawPlayer(ctx, p, state);
    }
```

- Rendert alle Spieler im Array
- **✅ Keine Änderungen nötig**

---

## ❌ KRITISCHE BLOCKER (Hardcoded auf 2 Spieler)

### 1. **Camera System** ❌ **KRITISCH**

**Status:** Hardcoded auf P1/P2

```7547:7587:js/physics.js
    const p1 = state.players[0];
    const p2 = state.players.length > 1 ? state.players[1] : p1;

    const BASE_MAX_ZOOM = 2.03125; // Value was 1.625, increased by 25%
    const BASE_MIN_ZOOM = 1.0;
    // Dynamic padding: prefer stage-scaled values from meta, fallback to legacy constants
    const stageWidthForPadding =
      state.cameraBounds?.width ?? GameState.CONSTANTS.NATIVE_WIDTH;
    const stageHeightForPadding =
      state.cameraBounds?.height ?? GameState.CONSTANTS.NATIVE_HEIGHT;
    const hasPaddingScale = !!(
      state.cameraPaddingScale &&
      typeof state.cameraPaddingScale.x === "number" &&
      typeof state.cameraPaddingScale.y === "number"
    );
    const PADDING_X = hasPaddingScale
      ? stageWidthForPadding * state.cameraPaddingScale.x
      : 300;
    const PADDING_Y = hasPaddingScale
      ? stageHeightForPadding * state.cameraPaddingScale.y
      : 200;
    const SMOOTHING = 4.0;
    // Slower smoothing for box dimensions to prevent jumpy zoom during jumps
    const BOX_SMOOTHING = 1.2; // Much slower than position smoothing for delayed zoom reaction
    // Vertical offset scales with stage height (negative = shift camera up)
    const VERTICAL_OFFSET = state.cameraBounds?.height
      ? -100 * (GameState.CONSTANTS.NATIVE_HEIGHT / state.cameraBounds.height)
      : -100;

    // Initialize smoothed box dimensions if not present
    // Use current player positions for initial values to avoid jump on first frame
    if (!state.camera._smoothedBox) {
      const initialMinX = Math.min(p1.pos.x, p2.pos.x);
      const initialMaxX = Math.max(p1.pos.x, p2.pos.x);
      const initialMinY = Math.min(p1.pos.y, p2.pos.y);
      const initialMaxY = Math.max(p1.pos.y, p2.pos.y);
```

**Problem:**

- Camera berechnet Bounding Box nur aus P1 und P2
- Bei 4 Spielern müssen alle Positionen berücksichtigt werden

**Lösung:**

- Bounding Box aus allen nicht-eliminierten Spielern berechnen
- Zoom-Logik anpassen (mehr Spieler = mehr Zoom-Out nötig)
- **Aufwand:** ~4-6 Stunden

### 2. **Input System** ❌ **KRITISCH**

**Status:** Hardcoded auf 2 Gamepads

```62:62:js/game-state.js
      gamepadMapping: [null, null], // [P1 gamepad index, P2 gamepad index]
```

**Problem:**

- `gamepadMapping` ist Array mit fester Länge 2
- Input-Handler erwartet nur P1/P2

**Betroffene Stellen:**

- `input-handler.js`: `getPadInput(playerIndex, state)` verwendet `state.input.gamepadMapping[playerIndex]`
- `main.js`: Gamepad-Connection-Logik prüft nur Index 0 und 1
- Keyboard-Input ist hardcoded auf `i === 0` (nur P1)

**Lösung:**

- `gamepadMapping` dynamisch erweitern (Array mit Länge 4)
- Gamepad-Connection-Logik für 4 Spieler anpassen
- Keyboard-Input optional für mehrere Spieler (oder nur P1)
- **Aufwand:** ~6-8 Stunden

### 3. **Character Selection** ⚠️ **MODERAT**

**Status:** Logik auf 2 Spieler ausgelegt

```2014:2018:js/main.js
      const playerCount = state.isTrainingMode
        ? 1
        : state.isStoryMode && !state.selection.p2Locked
        ? 1
        : 2;
```

**Problem:**

- `playerCount` ist hardcoded auf max 2
- `selectedCharacters` Array existiert, aber UI/Logik erwartet nur 2 Einträge

**Lösung:**

- `playerCount` basierend auf Game-Mode setzen (2v2 = 4, FFA = 4)
- Character Selection UI für 4 Spieler erweitern
- **Aufwand:** ~4-6 Stunden (UI-Komplexität)

### 4. **Spawn Points** ⚠️ **MODERAT**

**Status:** Dynamisch, aber Logik auf 2 Spieler optimiert

```2020:2028:js/main.js
      // Ensure we have enough spawn points
      while (spawns.length < playerCount) {
        spawns.push({
          x:
            (spawns.length === 0 ? canvas.width * 0.25 : canvas.width * 0.75) |
            0,
          y: (canvas.height * 0.5) | 0,
        });
      }
```

**Problem:**

- Spawn-Logik generiert nur 2 Positionen (25% und 75% Breite)
- Für 4 Spieler braucht es 4 sinnvolle Spawn-Positionen

**Lösung:**

- Spawn-Positionen für 4 Spieler berechnen (z.B. Ecken oder gleichmäßig verteilt)
- Stage-spezifische Spawn-Points prüfen (falls vorhanden)
- **Aufwand:** ~2-3 Stunden

---

## 🆕 FEHLENDE FEATURES (Für 2v2 Tag Team)

### 1. **Team System** ❌ **NICHT VORHANDEN**

**Status:** Keine Team-Logik im Code

**Aktueller Zustand:**

- Jeder Spieler kann jeden anderen treffen
- Keine Team-Zuordnung (`player.team` existiert nicht)
- Hit Detection prüft nur `if (i === j) continue` (kein Team-Check)

**Benötigt:**

1. **Team-Zuordnung:**
   - `player.team = 0 | 1` (Team A oder Team B)
   - Initialisierung in `createPlayer()` oder `startGame()`

2. **Hit Detection Anpassung:**

```javascript
// In applyHitDetection() - VORHER:
if (i === j) continue;

// NACHHER (für 2v2):
if (i === j) continue;
if (p.team !== undefined && target.team !== undefined && p.team === target.team) continue; // Team-Mates können sich nicht treffen
```

3. **Match End für Teams:**
   - Prüfen: `alivePlayers.filter(p => p.team === 0).length === 0` → Team 1 gewinnt
   - Prüfen: `alivePlayers.filter(p => p.team === 1).length === 0` → Team 0 gewinnt

**Aufwand:** ~6-8 Stunden

### 2. **Tag Team Mechanik** ❌ **NICHT VORHANDEN**

**Status:** Keine Tag/Switch-Logik

**Falls gewünscht:**

- Spieler können zwischen Teammates wechseln
- Nur aktive Spieler können getroffen werden
- Respawn/Cooldown für getaggte Spieler

**Aufwand:** ~8-12 Stunden (optional, je nach Design)

---

## 📊 KOMPLEXITÄTSANALYSE

### Free-for-All (4 Spieler)

**Schwierigkeit:** ⭐⭐ (Moderat)

**Blocker:**

1. Camera System (~4-6h)
2. Input System (~6-8h)
3. Character Selection UI (~4-6h)
4. Spawn Points (~2-3h)

**Gesamt:** ~16-23 Stunden (2-3 Arbeitstage)

**Risiken:**

- Camera-Zoom kann bei 4 Spielern chaotisch wirken (Lösung: dynamischer Zoom)
- Input-Handling für 4 Gamepads kann Edge Cases haben (z.B. Disconnect während Match)

### 2v2 Tag Team

**Schwierigkeit:** ⭐⭐⭐ (Hoch)

**Zusätzlich zu Free-for-All:**

1. Team System (~6-8h)
2. Match End für Teams (~2-3h)
3. Optional: Tag Mechanik (~8-12h)

**Gesamt:** ~24-34 Stunden (4-5 Arbeitstage)

**Risiken:**

- Team-Logik muss in ALLEN Hit-Detection-Pfaden geprüft werden (auch Projectiles, Ultimates, etc.)
- Match End muss Edge Cases handhaben (z.B. beide Teams eliminieren sich gleichzeitig)

---

## 🔍 VERSTECKTE ABHÄNGIGKEITEN

### 1. **Projectile Hit Detection**

**Status:** Muss geprüft werden

```7098:7122:js/physics.js
              // Look for target collision - Use consistent hitbox with renderer
              for (const target of state.players) {
                if (target === proj.owner || target.eliminated) continue;

                const targetHurtbox = Renderer.getHurtbox(target);
                // Use the same hitbox calculation as in renderer.js
                const groundY = 800;
                const discoBallCenterY = proj.y;
                const projHitbox = {
                  left: proj.x - proj.size / 2,
                  top: Math.min(groundY, discoBallCenterY),
                  w: proj.size,
                  h: Math.abs(discoBallCenterY - groundY),
                };

                if (rectsIntersect(projHitbox, targetHurtbox)) {
                  proj.targetDetected = true;
                  proj.hitTarget = target;
                  proj.vel = { x: 0, y: 0 }; // Stop horizontal movement
                  proj.targetPosition = {
                    x: target.pos.x,
                    y: target.pos.y - targetHurtbox.h / 2 - proj.hoverHeight,
                  };
                  break;
                }
              }
```

**✅ Bereits generisch** - iteriert über alle Spieler. Für 2v2: Team-Check hinzufügen.

### 2. **NPC Controller**

**Status:** Muss angepasst werden

```653:653:js/npc-controller.js
  function getInputs(state, playerIndex) {
```

- NPC Controller erwartet aktuell nur P2 (`playerIndex === 1`)
- Für 4 Spieler: NPC kann für P3/P4 aktiviert werden
- **Aufwand:** ~2-3 Stunden (falls NPCs in 4-Player-Modi gewünscht)

### 3. **Dance Battle / Rhythm Systems**

**Status:** Muss geprüft werden

- Rhythm-Bonus-Systeme müssen für 4 Spieler funktionieren
- Dance Battle könnte Team-Logik benötigen
- **Aufwand:** ~2-4 Stunden (je nach Komplexität)

---

## ✅ EMPFOHLENE IMPLEMENTIERUNGS-REIHENFOLGE

### Phase 1: Free-for-All (4 Spieler)

1. **Input System erweitern** (gamepadMapping auf 4)
2. **Character Selection UI** für 4 Spieler
3. **Spawn Points** für 4 Spieler
4. **Camera System** für 4 Spieler (Bounding Box aus allen Spielern)
5. **Testing:** 4-Player Free-for-All

### Phase 2: 2v2 Tag Team

1. **Team System** implementieren (`player.team`)
2. **Hit Detection** Team-Check hinzufügen
3. **Match End** für Teams anpassen
4. **Projectile Hit Detection** Team-Check
5. **Testing:** 2v2 Matches

### Phase 3: Polish & Edge Cases

1. NPC Controller für P3/P4 (optional)
2. Dance Battle Team-Logik (falls nötig)
3. UI-Anpassungen (Team-Anzeige, etc.)
4. Performance-Tests (4 Spieler + FX)

---

## ⚠️ KRITISCHE FRAGEN (Muss geklärt werden)

1. **Tag Team Mechanik:**
   - Sollen Spieler zwischen Teammates wechseln können?
   - Oder sind beide Teammates immer aktiv?

2. **Spawn Points:**
   - Sollen Spawn-Points stage-spezifisch sein?
   - Oder automatisch generiert (z.B. Ecken)?

3. **Camera:**
   - Soll die Camera bei 4 Spielern weiter rauszoomen?
   - Oder Split-Screen (4 Views)?

4. **Keyboard Input:**
   - Nur P1 per Keyboard?
   - Oder mehrere Spieler per Keyboard (z.B. WASD + Arrow Keys)?

5. **Match End:**
   - Bei 2v2: Was passiert bei gleichzeitiger Elimination beider Teams?
   - Bei FFA: Was passiert bei gleichzeitiger Elimination der letzten 2 Spieler?

---

## 📝 FAZIT

**Die Codebase ist gut strukturiert für die Erweiterung.** Die Core-Combat-Logik ist bereits generisch genug, aber **Camera**, **Input** und **Team-Logik** müssen implementiert werden.

**Empfehlung:**

- **Free-for-All zuerst** (weniger Komplexität, gute Basis)
- **Dann 2v2** (baut auf FFA auf, fügt Team-Logik hinzu)
- **Größtes Risiko:** Camera-System bei 4 Spielern (kann chaotisch wirken)

**Geschätzter Gesamtaufwand:**

- Free-for-All: **2-3 Tage**
- 2v2 Tag Team: **4-5 Tage** (inkl. Free-for-All)

**Nächste Schritte:**

1. Klärung der offenen Fragen (siehe oben)
2. Prototyp: Camera-System für 4 Spieler testen
3. Input-System erweitern
4. Schrittweise Implementierung nach empfohlener Reihenfolge
