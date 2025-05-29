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
  // Standardbewegung in SWADE ist meist 6
  return token.actor?.system?.stats?.pace?.value ?? 6;
}

export async function performAttack(attacker, target) {
  ui.notifications.info(`${attacker.name} greift ${target.name} an (Platzhalteraktion für SWADE).`);
  // Für echte SWADE-Implementierung: Trait Roll auf Fighting, dann Schaden
  return true;
}
