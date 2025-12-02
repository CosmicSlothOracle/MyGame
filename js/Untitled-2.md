Angriffswerte (Damage, Knockback, Stun, Detect-Phase, Projektile, FX)
Datei: js/attack-catalog.js
Suche nach dem Key <char>:<attack> (z. B. "fritz:r2", "hp:l1_ranged_grab").
Felder: baseDamage, baseKnockback, maxKnockback, knockbackExponent, stunDuration, detectInPhase, projectile, fx.
Bewegungs-/Timing-Tuning pro Charakter (Anim-Speed, Dash, Charge-Fenster)
Datei: js/character-catalog.js
Funktion: getAttackConfig(charName, state) → Block für fritz, cyboard, hp.
Felder: animSpeed, dashDistance, dashMultipliers, releaseDashBase, comboWindowFrames, chargeThresholds, etc.
Hitbox-Größe und -Position
Datei: js/renderer.js
Funktionen: getR1Hitbox, getR1JumpHitbox, getR1DashHitbox, getL1JabHitbox, getL1SmashHitbox, getL2SmashHitbox, getR2Hitbox, getR2ComboHitbox.
Passe dort w, h, left, top-Berechnungen an.
Animations-Frames und deren Reihenfolge/Dauer
Datei: assets/characters/<Char>/atlas.json (z. B. assets/characters/fritz/atlas.json)
Bereich animations: Liste der Frames pro Animation; optional pro Frame Dauer d.
Beeinflusst Frame-Timing und effektive Aktivfenster (in Kombi mit detectInPhase).
Kollisionsfenster/Player-Durchdringen
Datei: js/attack-catalog.js
Feld: bypassPlayerCollision pro Descriptor (true = durchdringen).
Zusätzlich: Kollisionslogik in js/physics.js ist bereits entschärft (Characters können einander passieren).
Cooldowns und Ultis
Cooldowns: js/character-catalog.js → getCooldownConfig (oder state.cooldownConfig).
Ulti-Logik/Phasen: js/attack-system.js (Handler handleHPUltimate, handleFritzUltimate, handleCyboardUltimate).
Input (R3): js/input-handler.js.
Rhythmus-/Beat-Effekte
Dateien: js/audio-system.js, Beat-Hooks via AttackSystem.checkRhythmBonus (Injected), Effekte via spawnRhythmEffect.
