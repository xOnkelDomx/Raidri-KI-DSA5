// Zugriff auf DSA5-spezifische Actor-/Item-Daten

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
 * Führt einen Standard-Nahkampfangriff durch
 */
export async function performAttack(attacker, target) {
  const actor = attacker.actor;
  const weapon = actor.items.find(i => i.type === "meleeweapon");
  if (!weapon) {
    console.warn("Raidri-KI | Kein Nahkampfwaffe gefunden.");
    return;
  }

  const skillName = weapon.system.combatskill?.value;
  const skill = actor.items.find(i => i.type === "combatskill" && i.name === skillName);
  const at = (skill?.system.at?.value ?? 10) + (weapon.system.atmod?.value ?? 0);

  // Angriffswurf
  const attackRoll = await new Roll("1d20").evaluate();
  await attackRoll.toMessage({ flavor: `🗡️ Angriff mit ${weapon.name} (AT ${at})` });

  if (attackRoll.total <= at) {
    // Schadenswurf mit deutschem "W" bereinigt
    let damage = weapon.system.damage?.value ?? "1d6+1";
    damage = damage.replace(/W/gi, "d");

    const damageRoll = await new Roll(damage).evaluate();
    await damageRoll.toMessage({ flavor: `💥 Schaden mit ${weapon.name}` });
  } else {
    ui.notifications.info(`${attacker.name} verfehlt ${target.name}`);
  }
}
