# Entwicklertasten & Bug-Reporting

## 📋 Entwicklertasten

| Taste     | Funktion         | Kurzbeschreibung                                       |
| --------- | ---------------- | ------------------------------------------------------ |
| **I**     | Dev Mode         | Aktiviert/deaktiviert Entwicklermodus (Debug-Ausgaben) |
| **P**     | NPC Toggle       | Schaltet NPC (Gegner) an/aus                           |
| **Alt+P** | NPC Spawnen      | Spawnt einen NPC als Player 2                          |
| **N**     | Metronome        | Aktiviert/deaktiviert Metronome (Beat-Anzeige)         |
| **H**     | Hitboxen         | Zeigt/versteckt Hitboxen und Hurtboxen                 |
| **Q**     | Debug Modal      | Öffnet/schließt Debug-Menü                             |
| **C**     | Camera Logging   | Aktiviert/deaktiviert Kamera-Debug-Logs                |
| **B**     | Beat Offset      | Passt Beat-Offset an                                   |
| **V**     | Beat Sync Log    | Aktiviert/deaktiviert Beat-Sync-Debug-Logs             |
| **T**     | Beat Sync Toggle | Schaltet Beat-Synchronisation an/aus                   |
| **F**     | FPS Speed        | Wechselt Geschwindigkeit (1x → 2x → 4x → 1x)           |
| **M**     | Music Toggle     | Musik an/aus                                           |
| **U**     | UI Toggle        | Versteckt/zeigt UI-Elemente                            |
| **Z**     | Dance Spot Test  | Testet Dance-Spot-Animation                            |
| **ESC**   | Modal            | Öffnet/schließt Pause-Menü                             |

## 🔄 Hard Reload

**Wichtig:** Wenn das Spiel einfriert oder nicht reagiert:

1. **Browser:** `Strg + Shift + R` (Windows) oder `Cmd + Shift + R` (Mac)
   - Lädt Seite neu und leert Cache
2. **Alternativ:** `F5` für normalen Reload
3. **Falls nichts hilft:** Browser komplett schließen und neu öffnen

**Hard Reload wird benötigt bei:**

- Spiel hängt/friert ein
- Assets werden nicht geladen
- Seltsame Grafiken oder Fehler
- Nach größeren Änderungen

## 🐛 Bug melden

**Optimal:** Screenshot + Logs

### 1. Screenshot machen

- **Windows:** `Windows-Taste + Shift + S` (Snipping Tool)
- **Mac:** `Cmd + Shift + 4`
- Oder: `F12` → Console Tab → Screenshot-Button

### 2. Logs kopieren

- `F12` drücken (Entwicklertools öffnen)
- Tab **"Console"** öffnen
- **Wichtig:** Vor dem Bug die Console leeren (Rechtsklick → "Clear console")
- Bug reproduzieren
- Alle roten/fehlerhaften Zeilen markieren und kopieren

### 3. Was angeben

- **Was ist passiert?** (kurze Beschreibung)
- **Wann passiert es?** (beim Start, im Kampf, beim Laden, etc.)
- **Schritte zum Reproduzieren** (falls möglich)
- **Screenshot** (falls visueller Bug)
- **Console-Logs** (besonders rote Fehlermeldungen)
- **Charakter/Stage** (falls relevant)

### 4. Beispiel-Bug-Report

```
BUG: Spiel stürzt beim Ultimate-Angriff ab

WANN: Im Kampf, wenn ich Ultimate drücke

CHARAKTER: Cyboard

SCHRITTE:
1. Ultimate-Meter voll machen
2. L2 + R2 drücken
3. Spiel friert ein

LOGS:
[Console-Logs hier einfügen]

SCREENSHOT: [Bild anhängen]
```

**Danke fürs Testen! 🎮**
