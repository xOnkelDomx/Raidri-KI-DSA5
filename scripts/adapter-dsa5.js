import { debugLog } from "./settings.js";

/**
 * Gibt eine Liste aller Tokens mit anderer Disposition zurück, die der Token sehen kann
 * @param {Token} token - Der agierende Token
 * @returns {Token[]} Sichtbare feindliche Tokens
 */
export function getVisibleEnemies(token) {
  return canvas.tokens.placeables.filter(t =>
    t !== token &&
    !t.document.hidden &&
    isTokenEnemy(token, t) &&
    canvas.visibility.testVisibility(t)
  );
}

/**
 * Bestimmt, ob zwei Tokens feindlich zueinander sind
 */
export function isTokenEnemy(a, b) {
  return a.document.disposition !== b.document.disposition;
}

/**
 * Gibt den Bewegungswert eines Tokens zurück, angepasst für DSA5
 * @param {Token} token
 * @returns {number}
 */
export function getMovementValue(token) {
  return token.actor?.system?.status?.speed?.value ?? 4;
}

/**
 * Führt einen Standard-Nahkampfangriff durch
 * @returns {boolean} true bei Treffer, false bei Fehlschlag
 */
export async function performAttack(attacker, target) {
  const actor = attacker.actor;
  const weapon = actor.items.find(i => i.type === "meleeweapon");

  if (!weapon) {
    console.warn("Raidri-KI | Keine Nahkampfwaffe gefunden.");
    return false;
  }

  const skillName = weapon.system.combatskill?.value;
  const skill = actor.items.find(i => i.type === "combatskill" && i.name === skillName);

  if (!skill) {
    console.warn(`Raidri-KI | Keine passende Kampffertigkeit zu ${weapon.name} gefunden.`);
    return false;
  }

  const at = (skill.system.at?.value ?? 10) + (weapon.system.atmod?.value ?? 0);

  // Angriffswurf
  const attackRoll = await new Roll("1d20").roll({ async: true });
  await attackRoll.toMessage({ flavor: `🗡️ Angriff mit ${weapon.name} (AT ${at})` });

  if (attackRoll.total <= at) {
    // Schadenswurf
    let damage = weapon.system.damage?.value ?? "1d6+1";
    damage = damage.replace(/W/gi, "d");

    const damageRoll = await new Roll(damage).roll({ async: true });
    await damageRoll.toMessage({ flavor: `💥 Schaden mit ${weapon.name}` });

    debugLog(`${attacker.name} trifft ${target.name} mit ${weapon.name}. Schaden:`, damageRoll.total);
    return true;
  } else {
    ui.notifications.info(`${attacker.name} verfehlt ${target.name}`);
    debugLog(`${attacker.name} hat verfehlt. Wurf: ${attackRoll.total}, Zielwert: ${at}`);
    return false;
  }
}
