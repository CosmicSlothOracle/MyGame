# Performance Monitoring Guide

## Problem

Das Spiel zeigt beim Start **massive Frame-Drops** (100-300ms requestAnimationFrame Handler), die zu **Freezes/Lags** führen. Die Chrome DevTools Performance-Analyse zeigt Violations, aber nicht genau, welcher Code verantwortlich ist.

## Lösung

Ich habe ein **Performance-Monitoring-System** implementiert, das:
- **Frame-Times** detailliert misst
- **Code-Sections** (z.B. Rendering, Physics, UI) einzeln trackt
- **Bottlenecks** identifiziert und loggt
- **Statistiken** über mehrere Frames sammelt

---

## Schritt-für-Schritt-Anleitung

### 1. **Monitoring aktivieren**

Öffne die **Browser-Konsole** (F12) und gib ein:

```javascript
PerformanceMonitor.init();
```

Das System startet sofort mit der Messung. Du siehst:
```
🔍 Performance Monitor initialized
📊 Call PerformanceMonitor.report() to see detailed analysis
🛑 Call PerformanceMonitor.stop() to disable monitoring
```

### 2. **Spiel starten und spielen**

- Navigiere zum Spiel (Character Select → Stage Select → Spielstart)
- **Spiele mindestens 10-15 Sekunden**, damit das System Daten sammelt
- Die ersten Frames werden automatisch als "kritisch" geloggt, wenn sie >33ms brauchen

Du siehst **automatische Warnungen** in der Konsole:
```
🚨 CRITICAL FRAME #5: 287.45ms
📊 Frame #5 Breakdown (287.45ms total)
  🔴 Renderer_UI: 198.23ms (69.0%)
  🟡 Physics_Update: 45.12ms (15.7%)
  ⏱️ Particle_Update: 12.45ms (4.3%)
```

### 3. **Performance-Report anzeigen**

Nach dem Spielen, gib in der Konsole ein:

```javascript
PerformanceMonitor.report();
```

Du erhältst einen **detaillierten Report**:

```
═══════════════════════════════════════
📊 PERFORMANCE REPORT
═══════════════════════════════════════
🎞️  Total frames analyzed: 450
⏱️  Average frame time: 18.45ms (54.2 fps)
📈 Min / Max: 8.23ms / 287.45ms
📊 Percentiles:
   50th: 16.12ms (62.0 fps)
   95th: 25.67ms (39.0 fps)
   99th: 98.34ms (10.2 fps)

⚠️  Slow frames (>16.67ms): 145 (32.2%)
🚨 Critical frames (>33.33ms): 12 (2.7%)
═══════════════════════════════════════

🔥 TOP 5 SLOWEST FRAMES:
───────────────────────────────────────
Frame #5: 287.45ms
  └─ Renderer_UI: 198.23ms (69.0%)
  └─ BeatBar: 45.12ms (15.7%)
  └─ StageAnimations: 22.34ms (7.8%)
Frame #12: 156.78ms
  └─ Renderer_WebGLInit: 142.34ms (90.7%)
  └─ Physics_Update: 8.12ms (5.2%)
...
═══════════════════════════════════════

📈 SECTION PERFORMANCE BREAKDOWN:
───────────────────────────────────────
Renderer_UI:
  Avg: 8.45ms | Max: 198.23ms | Calls: 450
BeatBar:
  Avg: 3.12ms | Max: 45.12ms | Calls: 450
Physics_Update:
  Avg: 2.89ms | Max: 23.45ms | Calls: 450
Renderer_Players:
  Avg: 1.23ms | Max: 12.34ms | Calls: 450
...
═══════════════════════════════════════
```

---

## Was bedeutet der Report?

### **TOP 5 SLOWEST FRAMES**
Dies zeigt die **5 langsamsten Frames** und welche Code-Sections die meiste Zeit verbraucht haben.

**Beispiel:**
```
Frame #5: 287.45ms
  └─ Renderer_UI: 198.23ms (69.0%)
```
→ **Frame #5 brauchte 287ms**, davon **69% (198ms) im UI-Rendering**. Das ist das Problem!

### **SECTION PERFORMANCE BREAKDOWN**
Zeigt **durchschnittliche und maximale Zeiten** pro Code-Section über alle Frames.

**Beispiel:**
```
BeatBar:
  Avg: 3.12ms | Max: 45.12ms | Calls: 450
```
→ Beatmatch-Bar braucht **durchschnittlich 3ms**, aber **einmal 45ms** (wahrscheinlich beim ersten Rendering).

---

## Häufige Bottlenecks und Lösungen

### 1. **`Renderer_WebGLInit` > 100ms**
**Problem:** WebGL wird während des ersten Frames initialisiert (nicht während Warmup).

**Lösung:**
- Prüfe, ob `startGame()` korrekt WebGL initialisiert
- Prüfe, ob `state.webglInitialized` gesetzt wird

### 2. **`BeatBar` > 20ms beim ersten Frame**
**Problem:** Font-Rendering beim ersten Mal ist langsam (Font-Metrics werden berechnet).

**Lösung:**
- Prüfe, ob `Renderer.warmupFonts()` während Warmup aufgerufen wird
- Stelle sicher, dass `warmupCanvasContext()` Fonts vorlädt

### 3. **`StageAnimations` > 10ms**
**Problem:** Zu viele Stage-Animationen oder komplexe Berechnungen.

**Lösung:**
- Prüfe Anzahl der `state.stageAnimations`
- Optimiere Beat-Sync-Berechnungen

### 4. **`Renderer_UI` > 50ms**
**Problem:** UI-Rendering ist zu komplex (viele Berechnungen oder Text-Rendering).

**Lösung:**
- Prüfe `drawCentralBeatBar()` – viele String-Operationen?
- Nutze Font-Caching (`setFontCached()`)
- Vermeide `ctx.measureText()` in jedem Frame

---

## Erweiterte Nutzung

### **Console-Logging deaktivieren**
Wenn du nicht für jeden langsamen Frame eine Warnung sehen willst:

```javascript
PerformanceMonitor.setLogging(false);
```

### **Daten löschen und neu starten**
```javascript
PerformanceMonitor.clear();
```

### **Monitoring stoppen**
```javascript
PerformanceMonitor.stop();
```

### **Erneut starten**
```javascript
PerformanceMonitor.init();
```

---

## Monitoring in eigenen Code einfügen

Falls du weitere Bereiche messen willst, kannst du eigene Sections hinzufügen:

```javascript
// Vor dem zu messenden Code
if (window.PerformanceMonitor?.isEnabled) {
  window.PerformanceMonitor.startSection("MeinCodeBereich");
}

// Dein Code hier...
doSomethingExpensive();

// Nach dem zu messenden Code
if (window.PerformanceMonitor?.isEnabled) {
  window.PerformanceMonitor.endSection("MeinCodeBereich");
}
```

**Wichtig:** Sections müssen **genau den gleichen Namen** bei Start und Ende haben!

---

## Bereits instrumentierte Bereiche

Das System misst bereits folgende Bereiche:

### **main.js (Game Loop)**
- `WebGL_FallbackCheck` – Prüft ob WebGL nachträglich initialisiert werden muss
- `Physics_Update` – Physics-Engine Update
- `Particle_Update` – Particle-System Update
- `Renderer_Full` – Gesamtes Rendering

### **renderer.js (Rendering)**
- `Renderer_Clear` – Canvas leeren
- `Renderer_WebGLInit` – WebGL Initialisierung (Fallback)
- `Renderer_Players` – Player-Sprites rendern
- `Renderer_Effects` – Effects/Particles/Projectiles rendern
- `Renderer_UI` – UI-Elemente rendern
- `StageAnimations` – Stage-Hintergrund-Animationen
- `BeatBar` – Beatmatch-Leiste (oft der Bottleneck!)

---

## Nächste Schritte

1. **Run Performance Monitor** und schaue dir den Report an
2. **Identifiziere die Top-Bottlenecks** (welche Sections sind am langsamsten?)
3. **Prüfe ob Warmup-Funktionen korrekt laufen:**
   - Wird `Renderer.warmupFonts()` aufgerufen?
   - Ist WebGL **vor** dem ersten Frame initialisiert?
4. **Teste Fixes** und vergleiche die Reports vorher/nachher

---

## Troubleshooting

### "PerformanceMonitor is not defined"
→ Stelle sicher, dass `performance-monitor.js` **vor** `main.js` geladen wird (siehe `index.html`)

### "isEnabled is undefined"
→ Du hast `PerformanceMonitor.init()` vergessen – rufe es in der Konsole auf

### "Keine Daten im Report"
→ Spiele mindestens 5-10 Sekunden, damit das System Frames sammeln kann

### "Report zeigt nur 1-2 Frames"
→ Standardmäßig werden nur **langsame Frames** (>16.67ms) detailliert gespeichert. Das ist normal!

---

## Beispiel-Workflow

```javascript
// 1. Monitoring starten
PerformanceMonitor.init();

// 2. Spiel starten und spielen (10-15 Sekunden)
// ... Game läuft ...

// 3. Report anzeigen
PerformanceMonitor.report();

// 4. Wenn du mehr Details willst, schau dir die automatischen Logs an
// (die wurden schon während dem Spielen ausgegeben)

// 5. Monitoring stoppen (optional)
PerformanceMonitor.stop();
```

---

## Kontakt / Feedback

Falls das Monitoring selbst Performance-Probleme verursacht, kannst du es jederzeit mit `PerformanceMonitor.stop()` deaktivieren. Die Overhead sollte minimal sein (<0.5ms pro Frame).

**Viel Erfolg beim Debuggen!** 🚀

