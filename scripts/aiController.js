import { getVisibleEnemies, isTokenEnemy } from "./dsa5Adapter.js";
import { performAttack } from "./dsa5Adapter.js";

/**
 * Führt einen vollständigen NPC-Zug aus
 * @param {Token} token - Der NPC-Token, der handelt
 */
export async function runNpcTurn(token) {
  if (!token || !token.actor) return;

  console.log("Raidri-KI | Starte NPC-Zug für:", token.name);

  // 1. Sichtprüfung
  const enemies = getVisibleEnemies(token);
  if (!enemies.length) {
    console.log("Raidri-KI | Keine Feinde sichtbar.");
    return;
  }

  // 2. Nächstes Ziel bestimmen
  const target = enemies[0]; // TODO: bessere Auswahl (z. B. nach Distanz)

  // 🧠 NEU: Bereits angrenzend? Dann direkt angreifen
  let dist;
  if (canvas.grid.measurePath) {
    const pathCheck = canvas.grid.measurePath({
      origin: token.center,
      target: target.center,
      type: "move"
    });
    dist = pathCheck?.totalDistance ?? 0;
  } else {
    dist = canvas.grid.measureDistance(token.center, target.center);
  }

  if (dist <= canvas.grid.size) {
    console.log("Raidri-KI | Bereits angrenzend zum Ziel – kein Weg nötig.");
    await performAttack(token, target);
    return;
  }

  // 3. Maximale Bewegungsreichweite ermitteln
  const movement = token.actor.system.status.speed?.value || 4;

  // 4. Beste erreichbare angrenzende Position zum Ziel finden
  const manager = game.FindThePath.Chebyshev?.PathManager;
  if (!manager) {
    console.warn("Raidri-KI | Kein PathManager verfügbar.");
    return;
  }

  const reachable = await manager.pointsWithinRangeOfToken(token, movement);
  if (!reachable?.length) {
    console.warn("Raidri-KI | Keine erreichbaren Punkte.");
    return;
  }

  // Zielpunkt: angrenzend zu Ziel
  const gridSize = canvas.grid.size;
  const targetX = target.x;
  const targetY = target.y;

  const adjacent = [
    { x: targetX - gridSize, y: targetY },
    { x: targetX + gridSize, y: targetY },
    { x: targetX, y: targetY - gridSize },
    { x: targetX, y: targetY + gridSize },
    { x: targetX - gridSize, y: targetY - gridSize },
    { x: targetX + gridSize, y: targetY - gridSize },
    { x: targetX - gridSize, y: targetY + gridSize },
    { x: targetX + gridSize, y: targetY + gridSize }
  ];

  // Wähle den besten erreichbaren angrenzenden Punkt
  let best = null;
  let minDist = Infinity;

  for (let r of reachable) {
    for (let a of adjacent) {
      const d = Math.hypot(r.segment.point.px - a.x, r.segment.point.py - a.y);
      if (d < gridSize / 2) {
        const distToTarget = r.dist;
        if (distToTarget < minDist) {
          minDist = distToTarget;
          best = r.segment;
        }
      }
    }
  }

  if (!best) {
    console.warn("Raidri-KI | Kein angrenzender Punkt erreichbar.");
    return;
  }

  // 5. Bewege den Token zum besten Punkt
  await token.document.update({ x: best.point.px, y: best.point.py });

  // 6. Angriff ausführen
  await performAttack(token, target);

  console.log("Raidri-KI | Zug abgeschlossen.");
}
