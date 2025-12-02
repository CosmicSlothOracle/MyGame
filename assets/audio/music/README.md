# Music Asset Structure

Hierarchische Organisation aller Musik-Assets für das Spiel.

## Ordnerstruktur:

```
music/
├── ui/                          UI & Menü-Musik
│   ├── title_intro.mp3          → Title Screen Intro (One-Shot)
│   └── character_select_loop.mp3 → Character Select Loop
│
└── stages/                      Stage-spezifische Musik
    ├── ninja_stage.mp3
    ├── industrial_zone.mp3      (Beispiel)
    └── ...
```

---

## Audio-Flow im Spiel:

```
┌─────────────────┐
│  Title Screen   │ → Interaktion → [title_intro.mp3]
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Character Select│ → Loop → [character_select_loop.mp3]
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Stage Select   │ → Preview → [stages/{selected}.mp3] (10 Sek)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Match Start    │ → Loop → [stages/{selected}.mp3] (voll)
└─────────────────┘
```

---

## Namenskonventionen:

- **Lowercase only**
- **Underscores statt Leerzeichen**
- **Descriptive names** (Funktion erkennbar)
- **Stage-Musik:** Identisch zum Stage-Ordnernamen

---

## Integration mit Levels:

Stages definieren ihre Musik in der `meta.json`:
```json
{
  "level_key": "level_ninja_stage",
  "default_music": "assets/audio/music/stages/ninja_stage.mp3"
}
```

---

## Aktuelle Assets:

### Bereits vorhanden (müssen verschoben/umbenannt werden):
- `select_start_track.mp3` → `ui/title_intro.mp3`
- `house_track_117bpm.mp3` → `stages/ninja_stage.mp3`

### Noch zu erstellen:
- `ui/character_select_loop.mp3` ← **NEU**

---

**Letzte Aktualisierung:** 2025-10-08

