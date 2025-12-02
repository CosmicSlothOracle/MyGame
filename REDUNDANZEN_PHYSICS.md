# Redundante Code-Stellen in physics.js

## 1. ❌ Alte `applyDamage` Funktion (Zeilen 6036-6106)

**Problem:** Wird nicht mehr verwendet, alle Schäden sollten über `applyDamageWithDescriptor` gehen

```6036:6106:js/physics.js
function applyDamage(
  target,
  sourcePos,
  baseDamage,
  maxStun,
  baseKnockback,
  state,
  falloff = 1.0,
  knockbackExponent = 0.8
) {
  // ... komplett veraltete Implementierung
}
```

**Empfehlung:** Funktion entfernen, da sie nicht mehr aufgerufen wird (keine `applyDamage(` Aufrufe gefunden außer der Definition)

---

## 2. ⚠️ Legacy Attack-Handler in `handleAttacks` (Zeilen 605-700)

**Problem:** Attack-Handler die nur noch Start/Ende logik haben, aber nicht zum AttackSystem migriert wurden

### 2.1 `r1_circle_attack` (Zeilen 605-617, 689-692)
- Startet Attack manuell
- Nur Animation-End-Check
- **Sollte migriert werden zu:** AttackSystem

### 2.2 `r1_up_attack` (Zeilen 679-688, 693-696)
- Fritz L3+R1 overhead attack
- Nur Animation-End-Check
- **Sollte migriert werden zu:** AttackSystem

### 2.3 `r2_hit_followup` (Zeilen 697-700)
- Nur Animation-End-Check
- **Sollte migriert werden zu:** AttackSystem

**Empfehlung:** Diese Attack-Typen sollten komplett zum AttackSystem migriert werden

---

## 3. ⚠️ Cyboard L2 Smash Attack komplett in physics.js (Zeilen 708-1040)

**Problem:** ~330 Zeilen kompletter Attack-Logik die noch in physics.js ist

```708:1040:js/physics.js
} else if (p.attack.type === "l2" && p.charName === "cyboard") {
  // Cyboard: L2 Smash Attack (New Multi-Phase Attack)
  // ... komplett komplexe Multi-Phase Attack Logik
}
```

**Status:** Die Damage/Knockback-Logik wurde bereits zum Attack Catalog migriert, aber die gesamte Attack-Phasen-Logik (charge, jump, hover, fall, impact) ist noch in physics.js.

**Empfehlung:** Sollte zu `AttackSystem.handleCyboardL2()` migriert werden (analog zu `handleFritzL2`)

---

## 4. ❌ `slamming` State in Sword Projectile (Zeilen 6163-6205)

**Problem:** `slamming` State macht nur noch visuelle Logik, da Grab entfernt wurde

```6163:6205:js/physics.js
} else if (proj.state === "slamming") {
  // Drive the slam with the linked effect animation
  // ... nur noch visuelle Logik ohne Schaden/Knockback
}
```

**Status:** Nach Entfernung von Grab/Slam Finisher ist dieser State nur noch für visuelle Effekte da. Wenn `linkedEffect` entfernt wird, kann der gesamte State entfernt werden.

**Empfehlung:** Prüfen ob `linkedEffect` noch benötigt wird, sonst State entfernen

---

## 5. ❌ Verwaiste `isGrabbed` Referenzen

**Problem:** Nach Entfernung des Grab-Systems sind noch `isGrabbed` Checks vorhanden

**Gefundene Stellen:**
- Zeile 167: `if (p.isGrabbed)`
- Zeile 4962: `isGrabbed: false,` (createPlayer)
- Zeile 5039: `p.isGrabbed = false;` (respawnPlayer)
- Zeile 5107: `p.isGrabbed = false;` (respawnPlayer)
- Zeile 5272: `if (p1.isGrabbed || p2.isGrabbed || ...)` (resolvePlayerCollisions)
- Zeile 6101: `if (!target.isGrabbed && !wasStunned)` (applyDamage - veraltet!)
- Zeile 7523: `target.isGrabbed = true;` (irgendwo?)

**Empfehlung:** Alle `isGrabbed` Referenzen entfernen, da Grab-System nicht mehr existiert

---

## 6. ⚠️ Legacy `detectHits` Kommentar (Zeile 71)

**Problem:** Kommentar deutet darauf hin, dass `detectHits` migriert werden soll

```71:71:js/physics.js
detectHits(state.players[i], i, state); // legacy path (to be removed after migration)
```

**Status:** `detectHits` delegiert bereits zu `AttackSystem.detectHits()`, aber der Kommentar deutet auf vollständige Migration hin.

**Empfehlung:** Prüfen ob `detectHits` komplett entfernt werden kann oder ob noch legacy Code drin ist

---

## 7. ⚠️ Doppelte Attack-Logik in `handleAttacks`

**Problem:** `handleAttacks` hat sowohl AttackSystem-Delegation als auch Legacy-Logik

```553:560:js/physics.js
function handleAttacks(dt, p, inputs, state) {
  // Delegate to AttackSystem
  AttackSystem.handleAttacks(dt, p, inputs, state);

  // If the modular AttackSystem started an attack, avoid running legacy attack logic
  if (p.attack && p.attack.type !== "none" && p.attack.owner === "mod") {
    return;
  }
  // ... dann kommt noch Legacy-Logik
}
```

**Empfehlung:** Nach vollständiger Migration aller Attacks sollte die gesamte Legacy-Logik entfernt werden

---

## Zusammenfassung

### Sofort entfernen (❌):
1. `applyDamage` Funktion (6036-6106)
2. Alle `isGrabbed` Referenzen
3. `slamming` State (wenn `linkedEffect` nicht mehr benötigt wird)

### Migrieren (⚠️):
1. `r1_circle_attack`, `r1_up_attack`, `r2_hit_followup` → AttackSystem
2. Cyboard L2 Smash Attack → `AttackSystem.handleCyboardL2()`
3. Legacy `detectHits` komplett entfernen (wenn möglich)

### Aufräumen nach Migration:
- Legacy Attack-Logik in `handleAttacks` entfernen
- Kommentar "legacy path" entfernen
