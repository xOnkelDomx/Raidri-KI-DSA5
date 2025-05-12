// Wrapper für lib-find-the-path-12 Funktionen
/**
 * Findet einen Pfad vom agierenden Token zum Zieltoken mithilfe von lib-find-the-path
 */
export async function findPathToToken(token, target) {
    const manager = game.FindThePath.Chebyshev?.PathManager;
    if (!manager) {
      console.warn("Raidri-KI | Kein PathManager gefunden.");
      return null;
    }
  
    const movement = 6; // Beispielbewegung
    await manager.addToken(token, target, movement);
    const path = manager.path(token.id, target.id);
  
    if (!path?.valid) {
      console.warn("Raidri-KI | Kein gültiger Pfad.");
      return null;
    }
  
    return path.path.map(node => node.originSeg);
  }
  