# Grab-Mechanik Edge Cases Analyse

## ✅ Behobene Edge Cases (Offensichtliche Probleme)

### 1. Grabber wird eliminiert während des Grabs

**Problem:** Wenn der Grabber während des Grabs eliminiert wird, bleibt das Opfer im `isGrabbed`-Zustand stecken.

**Fix:**

- `physics.js`: Safety-Check prüft jetzt auch `attacker.eliminated`
- `attack-system.js`: Alle Grab-Handler prüfen `p.eliminated` und releasen das Opfer sofort

**Dateien:**

- `js/physics.js` (Zeile 361)
- `js/attack-system.js` (handleFritzGrab, handleHPGrab, handleCyboardGrab)

### 2. Invincible/Respawn-Schutz

**Problem:** Spieler können während Respawn-Invincibility oder Ultimate-Invincibility gegrabt werden.

**Fix:**

- Alle Grab-Handler prüfen jetzt `target.invincible || target.isInvincible` vor dem Grab
- Grab wird blockiert mit Log-Meldung

**Dateien:**

- `js/attack-system.js` (handleFritzGrab, handleHPGrab, handleCyboardGrab)

### 3. Doppelter Grab (Opfer bereits gegrabt)

**Problem:** Ein bereits gegrabtes Opfer kann erneut gegrabt werden, was zu inkonsistenten Zuständen führt.

**Fix:**

- Alle Grab-Handler prüfen `target.isGrabbed` vor dem Grab
- Grab wird blockiert mit Log-Meldung

**Dateien:**

- `js/attack-system.js` (handleFritzGrab, handleHPGrab, handleCyboardGrab)

---

## ⚠️ Delikate Szenarien (Benötigen Design-Entscheidungen)

### 1. Grab während Dance-Animation

**Szenario:** Spieler führt Dance-Animation aus (geschützt in `setAnim`), wird aber gegrabt.

**Aktuelles Verhalten:**

- `setAnim` blockiert Animation-Wechsel während Dance (Zeile 5654-5661 in `physics.js`)
- `grabbed_loop` wird gesetzt, aber `setAnim` könnte es blockieren
- Dance-Animation läuft weiter, aber Spieler ist im `isGrabbed`-Zustand

**Fragen:**

- Sollte Grab während Dance möglich sein? (Gameplay-Design)
- Wenn ja: Soll `grabbed_loop` die Dance-Animation überschreiben?
- Wenn nein: Sollte Grab-Detection Dance-Animationen blockieren?

**Empfehlung:** Grab sollte Dance-Animationen blockieren können (höhere Priorität), da Grab ein taktisches Element ist. `setAnim` sollte `grabbed_loop` auch während Dance erlauben.

---

### 2. Grab während Ultimate-Animation

**Szenario:** Spieler führt Ultimate aus (z.B. Fritz Ultimate, geschützt in `setAnim`), wird aber gegrabt.

**Aktuelles Verhalten:**

- Fritz Ultimate ist geschützt (Zeile 5672-5680 in `physics.js`)
- Andere Ultimates haben `invincible` Flag, werden bereits blockiert
- Aber: Was wenn Ultimate nicht invincible ist?

**Fragen:**

- Sollte Grab während Ultimate möglich sein?
- Ultimate hat oft hohe Priority - sollte das ausreichen?
- Sollte `grabbed_loop` Ultimate-Animationen überschreiben?

**Empfehlung:** Ultimate sollte durch Priority-System geschützt sein. Falls nicht, sollte `setAnim` `grabbed_loop` auch während Ultimate erlauben (Grab hat höhere Priorität als Animation-Schutz).

---

### 3. Grab während Walljump

**Szenario:** Spieler führt Walljump aus (geschützt in `setAnim`), wird aber gegrabt.

**Aktuelles Verhalten:**

- Walljump-Animation ist geschützt (Zeile 5664-5669 in `physics.js`)
- `grabbed_loop` wird möglicherweise blockiert

**Fragen:**

- Sollte Grab während Walljump möglich sein?
- Walljump ist ein Bewegungsmechanismus - sollte Grab das unterbrechen?

**Empfehlung:** Grab sollte Walljump unterbrechen können. `setAnim` sollte `grabbed_loop` auch während Walljump erlauben.

---

### 4. Grab während Shield

**Szenario:** Spieler hat aktives Shield, wird aber gegrabt.

**Aktuelles Verhalten:**

- Keine explizite Shield-Prüfung in Grab-Detection gefunden
- Shield könnte über `target.shield?.active` geprüft werden müssen

**Fragen:**

- Sollte Shield gegen Grab schützen? (Gameplay-Design)
- Wenn ja: Sollte Shield Grab blockieren oder nur reduzieren?

**Empfehlung:** Shield sollte gegen Grab schützen (konsistent mit anderen Angriffen). Shield-Prüfung sollte zu Grab-Detection hinzugefügt werden.

---

### 5. Grab während Respawn-Animation

**Szenario:** Spieler ist im Respawn-State (nicht invincible, aber in Respawn-Animation), wird aber gegrabt.

**Aktuelles Verhalten:**

- Respawn hat `isInvincible` Flag, wird bereits blockiert
- Aber: Was wenn Respawn-Animation läuft, aber Invincibility abgelaufen ist?

**Fragen:**

- Sollte Grab während Respawn möglich sein?
- Respawn-Animation sollte wahrscheinlich geschützt sein

**Empfehlung:** Respawn-State sollte explizit geprüft werden (`p.respawnState`), nicht nur Invincibility.

---

### 6. Animation-Konflikte: `grabbed_loop` vs. geschützte Animationen

**Szenario:** `setAnim(target, "grabbed_loop", ...)` wird aufgerufen, während Ziel geschützte Animation hat (Dance, Ultimate, Walljump).

**Aktuelles Verhalten:**

- `setAnim` blockiert Animation-Wechsel für geschützte Animationen
- `grabbed_loop` wird möglicherweise nicht gesetzt
- Ziel bleibt in alter Animation, aber ist im `isGrabbed`-Zustand

**Fragen:**

- Sollte `grabbed_loop` geschützte Animationen überschreiben?
- Oder sollte Grab-Detection geschützte Animationen blockieren?

**Empfehlung:** `setAnim` sollte eine Ausnahme für `grabbed_loop` machen, da Grab ein höherwertiger Zustand ist als Animation-Schutz. Alternativ: Grab-Detection sollte geschützte Animationen explizit prüfen und blockieren.

---

### 7. Grab während Hitlag

**Szenario:** Spieler ist in Hitlag (getroffen, aber noch nicht weggeknockt), wird aber gegrabt.

**Aktuelles Verhalten:**

- Keine explizite Hitlag-Prüfung gefunden
- Hitlag könnte über `p.hitlagTimer` geprüft werden müssen

**Fragen:**

- Sollte Grab während Hitlag möglich sein?
- Hitlag ist ein kurzer Freeze-Zustand - sollte Grab das unterbrechen?

**Empfehlung:** Grab sollte Hitlag unterbrechen können (konsistent mit anderen Mechaniken). Hitlag-Prüfung ist optional, da Hitlag sehr kurz ist.

---

### 8. Grab während Stun

**Szenario:** Spieler ist gestunned (`p.stunT > 0`), wird aber gegrabt.

**Aktuelles Verhalten:**

- Keine explizite Stun-Prüfung in Grab-Detection gefunden
- Stun ist ein Zustand, der Bewegungssteuerung blockiert

**Fragen:**

- Sollte Grab während Stun möglich sein?
- Stun ist ein Debuff - sollte Grab das unterbrechen?

**Empfehlung:** Grab sollte Stun unterbrechen können. Stun-Prüfung ist optional, da Stun bereits durch andere Mechaniken behandelt wird.

---

## 🔧 Empfohlene Implementierungen

### 1. Shield-Prüfung hinzufügen

```javascript
// In allen Grab-Handlern, vor dem Hit-Check:
if (target.shield?.active) {
  console.log(`[Grab] BLOCKED: Target P${target.padIndex + 1} has active shield`);
  continue;
}
```

### 2. Respawn-State-Prüfung hinzufügen

```javascript
// In allen Grab-Handlern, vor dem Hit-Check:
if (target.respawnState) {
  console.log(`[Grab] BLOCKED: Target P${target.padIndex + 1} is respawning`);
  continue;
}
```

### 3. `setAnim` Ausnahme für `grabbed_loop`

```javascript
// In physics.js setAnim, vor den Schutz-Prüfungen:
// EDGE CASE: grabbed_loop can override protected animations (grab is higher priority)
if (name === "grabbed_loop") {
  // Allow grabbed_loop to override any animation
  // Continue with normal setAnim logic
}
```

### 4. Geschützte Animationen in Grab-Detection prüfen

```javascript
// In allen Grab-Handlern, vor dem Hit-Check:
// EDGE CASE: Cannot grab during protected animations (dance, ultimate, walljump)
if (
  (target.anim && target.anim.includes("dance") && !target.animFinished) ||
  (target.charName === "fritz" && target.ultiPhase &&
   (target.anim === "r2_l2_ulti" || target.anim === "r2_l2_ulti_start")) ||
  target.walljumpActive
) {
  console.log(`[Grab] BLOCKED: Target P${target.padIndex + 1} is in protected animation`);
  continue;
}
```

---

## 📋 Zusammenfassung

**Behoben:**

- ✅ Grabber-Elimination
- ✅ Invincible/Respawn-Schutz
- ✅ Doppelter Grab

**Benötigt Design-Entscheidung:**

- ⚠️ Grab während Dance/Ultimate/Walljump
- ⚠️ Shield-Schutz gegen Grab
- ⚠️ Animation-Konflikte (`grabbed_loop` vs. geschützte Animationen)
- ⚠️ Respawn-State explizit prüfen

**Empfohlene nächste Schritte:**

1. ✅ Design-Entscheidungen für delikate Szenarien getroffen
2. ✅ Shield- und Respawn-Prüfungen implementiert
3. ✅ `setAnim` Ausnahme für `grabbed_loop` implementiert
4. ✅ Geschützte Animationen in Grab-Detection geprüft

---

## ✅ Implementierte Fixes (Alle Empfehlungen umgesetzt)

### 1. Shield-Prüfung hinzugefügt

**Status:** ✅ Implementiert in allen Grab-Handlern (handleFritzGrab, handleHPGrab, handleCyboardGrab)

**Code:**

```javascript
// EDGE CASE FIX: Cannot grab targets with active shield
if (target.shield?.active) {
  console.log(`[Grab] BLOCKED: Target P${target.padIndex + 1} has active shield`);
  continue;
}
```

### 2. Respawn-State-Prüfung hinzugefügt

**Status:** ✅ Implementiert in allen Grab-Handlern

**Code:**

```javascript
// EDGE CASE FIX: Cannot grab targets that are respawning
if (target.respawnState) {
  console.log(`[Grab] BLOCKED: Target P${target.padIndex + 1} is respawning`);
  continue;
}
```

### 3. `setAnim` Ausnahme für `grabbed_loop`

**Status:** ✅ Implementiert in `physics.js` setAnim-Funktion

**Code:**

```javascript
// EDGE CASE: grabbed_loop can override protected animations (grab is higher priority)
const isGrabbedLoop = name === "grabbed_loop";

// Alle Schutz-Prüfungen prüfen jetzt !isGrabbedLoop, damit grabbed_loop sie überschreiben kann
```

### 4. Geschützte Animationen in Grab-Detection geprüft

**Status:** ✅ Implementiert in allen Grab-Handlern

**Code:**

```javascript
// EDGE CASE FIX: Cannot grab during protected animations (dance, ultimate, walljump)
if (
  (target.anim && target.anim.includes("dance") && !target.animFinished) ||
  (target.charName === "fritz" && target.ultiPhase &&
   (target.anim === "r2_l2_ulti" || target.anim === "r2_l2_ulti_start")) ||
  target.walljumpActive
) {
  console.log(`[Grab] BLOCKED: Target P${target.padIndex + 1} is in protected animation`);
  continue;
}
```

**Hinweis:** Die Prüfung für geschützte Animationen ist redundant, da `setAnim` jetzt `grabbed_loop` erlaubt, aber sie bietet zusätzliche Sicherheit und verhindert, dass Grab überhaupt versucht wird, wenn das Ziel in einer geschützten Animation ist.

---

## 🎯 Finale Design-Entscheidungen

1. **Grab während Dance/Ultimate/Walljump:** Grab wird blockiert durch explizite Prüfung in Grab-Detection. Falls doch gegrabt wird, kann `grabbed_loop` die Animation überschreiben (durch `setAnim` Ausnahme).

2. **Shield-Schutz:** Shield blockiert Grab vollständig (konsistent mit anderen Angriffen).

3. **Animation-Konflikte:** `grabbed_loop` kann geschützte Animationen überschreiben (höhere Priorität), aber Grab-Detection blockiert geschützte Animationen präventiv.

4. **Respawn-State:** Explizite Prüfung hinzugefügt (zusätzlich zu Invincibility-Prüfung).
