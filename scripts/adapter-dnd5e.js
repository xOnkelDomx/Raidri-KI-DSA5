export function getVisibleEnemies(token) {
  return canvas.tokens.placeables.filter(t =>
    t !== token &&
    !t.document.hidden &&
    isTokenEnemy(token, t) &&
    canvas.visibility.testVisibility(t)
  );
}

export function isTokenEnemy(a, b) {
  return a.document.disposition !== b.document.disposition;
}

export function getMovementValue(token) {
  // In D&D 5E wird die Bewegungsrate meist in Fuß gespeichert (z. B. 30 ft)
  // Umrechnung: 5 ft = 1 Feld → 30 ft / 5 = 6
  const speed = token.actor?.system?.attributes?.movement?.walk;
  return Math.floor((parseInt(speed) || 30) / 5);
}

export async function performAttack(attacker, target) {
  ui.notifications.info(`${attacker.name} greift ${target.name} an (Platzhalteraktion für D&D 5E).`);
  // Hier könntest du später echte Waffenauswahl und Attack Rolls einbauen
  return true;
}
