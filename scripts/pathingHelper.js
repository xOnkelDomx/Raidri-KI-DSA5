// Wrapper für lib-find-the-path-12 Funktionen

/**
 * Findet einen Pfad vom agierenden Token zum Zieltoken mithilfe von lib-find-the-path
 * @param {Token} token
 * @param {Token} target
 * @param {number} movement - maximale Reichweite (z. B. 8)
 * @returns {Segment[]} Pfad als Array von Segmenten
 */
export async function findPathToToken(token, target, movement = 4) {
  const manager = game.FindThePath.Chebyshev?.PathManager;
  if (!manager) {
    console.warn("Raidri-KI | Kein PathManager gefunden.");
    return null;
  }

  await manager.addToken(token, target, movement);
  const path = manager.path(token.id, target.id);

  if (!path?.valid) {
    console.warn("Raidri-KI | Kein gültiger Pfad.");
    return null;
  }

  return path.path.map(node => node.originSeg);
}
