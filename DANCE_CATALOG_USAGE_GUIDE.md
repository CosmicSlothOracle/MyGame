# Dance Catalog Usage Guide

## Übersicht

Das Dance Catalog System wurde erweitert, um alle Dance-Animationen zentral zu verwalten. Jede Animation kann jetzt frame-spezifische Offsets und Dauer-Modifikatoren verwenden, **genau wie bei HP's spezieller Perfect Beatmatch Dance**.

## Zentrale Konfiguration

Alle Dance-Animationen sind jetzt in `DANCE_ANIMATION_CONFIGS` definiert und verwenden die **gleiche Struktur wie HP's spezielle Animation**:

### Verfügbare Konfigurationen

- `perfect_beat` - 16 Frames dance_a für Perfect Beat
- `good_beat` - 8 Frames dance_a für Good Beat
- `off_beat` - 4 zufällige Frames dance_a für Off Beat
- `combo_3_6` - 16 Frames dance_b für 3x/6x Combos
- `combo_10_plus` - 16 Frames dance_c für 10+ Combos
- `dance_mode_1_3` - 16 Frames dance_a für Dance Mode 1-3 Punkte
- `dance_mode_4_7` - 16 Frames dance_b für Dance Mode 4-7 Punkte
- `dance_mode_8_9` - 16 Frames dance_c für Dance Mode 8-9 Punkte
- `hp_perfect_beatmatch` - HP's spezielle Animation mit Offsets (BEISPIEL)

## Frame-Objekt Struktur

Jeder Frame ist jetzt ein Objekt mit folgenden Eigenschaften - **genau wie bei HP's spezieller Animation**:

```javascript
{
  frame: "dance_a_000",  // Frame-Name im Atlas
  d: 1.0,               // Dauer-Multiplikator (1.0 = normale Dauer)
  offsetX: 0,           // X-Offset in Pixeln
  offsetY: 0            // Y-Offset in Pixeln
}
```

## Character-spezifische Perfect Beatmatch Dances

Jeder Character hat jetzt seine eigene Perfect Beatmatch Dance-Konfiguration:

### HP's spezielle Animation (Referenz)
```javascript
perfect_beatmatch: {
  hp: {
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
    ],
    loop: false,
    fps: 6,
    useFrameDurations: true,
  },
  // Charly, Fritz, Cyboard haben Standard-Konfigurationen (können angepasst werden)
}
```

## API-Funktionen

### Konfiguration abrufen
```javascript
// Alle Konfigurationen abrufen
const configs = window.DanceCatalog.getDanceConfigs();

// Spezifische Konfiguration anzeigen
console.log(configs.perfect_beat);
```

### Konfiguration bearbeiten
```javascript
// Ganze Konfiguration aktualisieren
window.DanceCatalog.updateDanceConfig('perfect_beat', {
  fps: 8,
  loop: true
});

// Einzelnen Frame bearbeiten
window.DanceCatalog.updateDanceFrame('perfect_beat', 0, {
  d: 2.0,        // Doppelte Dauer
  offsetX: 10,   // 10 Pixel nach rechts
  offsetY: -5    // 5 Pixel nach oben
});
```

### Konfiguration exportieren/importieren
```javascript
// Konfiguration als JSON exportieren
const jsonConfig = window.DanceCatalog.exportDanceConfigs();
console.log(jsonConfig);

// Konfiguration aus JSON importieren
window.DanceCatalog.importDanceConfigs(jsonConfig);

// Alle Konfigurationen zurücksetzen
window.DanceCatalog.resetDanceConfigs();
```

## Praktische Beispiele

### Beispiel 1: Perfect Beat Animation anpassen (wie HP's spezielle Animation)
```javascript
// Frame 0 länger machen und nach oben verschieben (wie HP's Frame 0)
window.DanceCatalog.updateDanceFrame('perfect_beat', 0, {
  d: 4.0,        // 4x längere Dauer (wie HP's Frame 0)
  offsetY: -48   // 48 Pixel nach oben (wie HP's Frame 0)
});

// Frame 5 nach rechts verschieben (wie HP's Frame 5)
window.DanceCatalog.updateDanceFrame('perfect_beat', 5, {
  d: 2.0,        // 2x längere Dauer
  offsetX: 25    // 25 Pixel nach rechts (wie HP's Frame 5)
});

// Frame 6 nach rechts verschieben (wie HP's Frame 6)
window.DanceCatalog.updateDanceFrame('perfect_beat', 6, {
  d: 4.0,        // 4x längere Dauer
  offsetX: 50    // 50 Pixel nach rechts (wie HP's Frame 6)
});
```

### Beispiel 2: Neue Animation erstellen (mit HP's Struktur)
```javascript
// Neue Konfiguration hinzufügen - genau wie HP's spezielle Animation
const newConfig = {
  frames: [
    { frame: "dance_a_000", d: 4.0, offsetY: -48 },  // Wie HP's Frame 0
    { frame: "dance_a_001", d: 2.0, offsetY: -24 },  // Wie HP's Frame 1
    { frame: "dance_a_002", d: 2.0 },                // Wie HP's Frame 2
    { frame: "dance_a_003", d: 2.0 },                // Wie HP's Frame 3
    { frame: "dance_a_004", d: 2.0 },                // Wie HP's Frame 4
    { frame: "dance_a_005", d: 2.0, offsetX: 25 },   // Wie HP's Frame 5
    { frame: "dance_a_006", d: 4.0, offsetX: 50 },   // Wie HP's Frame 6
    { frame: "dance_a_007", d: 4.0, offsetX: 100 },  // Wie HP's Frame 7
  ],
  loop: false,
  fps: 6,
  useFrameDurations: true
};

window.DanceCatalog.updateDanceConfig('my_custom_dance', newConfig);
```

### Beispiel 3: Alle Offsets zurücksetzen (auf Standard-Werte)
```javascript
const configs = window.DanceCatalog.getDanceConfigs();
Object.keys(configs).forEach(configName => {
  configs[configName].frames.forEach((frame, index) => {
    window.DanceCatalog.updateDanceFrame(configName, index, {
      d: 1.0,        // Standard-Dauer
      offsetX: 0,    // Kein X-Offset
      offsetY: 0     // Kein Y-Offset
    });
  });
});
```

### Beispiel 4: Character-spezifische Perfect Beatmatch Dances bearbeiten
```javascript
// Charly's Perfect Beatmatch Dance anpassen
window.DanceCatalog.updateCharacterPerfectBeatmatchFrame('charly', 0, {
  d: 2.0,        // 2x längere Dauer
  offsetY: -20   // 20 Pixel nach oben
});

// Fritz's Perfect Beatmatch Dance anpassen
window.DanceCatalog.updateCharacterPerfectBeatmatchFrame('fritz', 5, {
  d: 3.0,        // 3x längere Dauer
  offsetX: 30    // 30 Pixel nach rechts
});

// Cyboard's Perfect Beatmatch Dance anpassen
window.DanceCatalog.updateCharacterPerfectBeatmatchFrame('cyboard', 10, {
  d: 1.5,        // 1.5x längere Dauer
  offsetY: -15   // 15 Pixel nach oben
});

// HP's Perfect Beatmatch Dance als Referenz anzeigen
const hpConfig = window.DanceCatalog.getCharacterPerfectBeatmatchConfig('hp');
console.log('HP\'s spezielle Animation:', hpConfig);

// Charly's Konfiguration mit HP's Werten anpassen
window.DanceCatalog.updateCharacterPerfectBeatmatchFrame('charly', 0, {
  d: hpConfig.frames[0].d,        // 4.0
  offsetY: hpConfig.frames[0].offsetY  // -48
});
```

### Beispiel 5: Neue Character-spezifische Konfigurationen
```javascript
// Neue Character-spezifische Perfect Beatmatch Dance hinzufügen
const newCharConfig = {
  frames: [
    { frame: "dance_a_000", d: 2.0, offsetY: -30 },
    { frame: "dance_a_001", d: 1.5, offsetX: 10 },
    { frame: "dance_a_002", d: 1.0 },
    // ... weitere Frames
  ],
  loop: false,
  fps: 6,
  useFrameDurations: true,
};

// Character-spezifische Konfiguration aktualisieren
window.DanceCatalog.updateCharacterPerfectBeatmatchConfig('charly', newCharConfig);
```

## Kompatibilität

- Alle bestehenden Beatmatch-Systeme funktionieren weiterhin
- Das System ist rückwärtskompatibel
- HP's spezielle Animation bleibt unverändert
- Alle Animationen verwenden jetzt einheitlich frame-spezifische Offsets und Dauer

## Debugging

Das System loggt alle Änderungen in der Konsole:
- `[DanceCatalog] Updated dance config: ...`
- `[DanceCatalog] Updated frame X in Y: ...`
- `[DanceCatalog] Imported dance configurations: ...`

## Hinweise

- Änderungen sind sofort wirksam
- Frame-Indizes beginnen bei 0
- Offsets werden in Pixeln angegeben
- Dauer-Multiplikatoren beziehen sich auf die Basis-FPS des Charakters
- `useFrameDurations: true` muss gesetzt sein, damit frame-spezifische Dauer funktioniert
