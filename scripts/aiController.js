import { getVisibleEnemies } from "./dsa5Adapter.js";
import { performAttack } from "./dsa5Adapter.js";
import { debugLog } from "./settings.js";

/**
 * Führt einen vollständigen NPC-Zug aus
 * @param {Token} token - Der NPC-Token, der handelt
 */
export async function runNpcTurn(token) {
  if (!token || !token.actor) return;

  console.log("Raidri-KI | Starte NPC-Zug für:", token.name);

  const enemies = getVisibleEnemies(token);
  if (!enemies.length) {
    console.log("Raidri-KI | Keine Feinde sichtbar.");
    return;
  }

  const target = enemies[0];
  const movement = token.actor.system.status.speed?.value || 4;
  const manager = game.FindThePath?.Chebyshev?.PathManager;

  if (!manager) {
    console.warn("Raidri-KI | Kein PathManager verfügbar.");
    return;
  }

  const fullPath = manager.path(token.id, target.id);
  debugLog("Pfad zum Ziel:", fullPath);

  // Verwende Ray für kompatible Pfadmessung
  let dist;
  try {
    const ray = new Ray(token.getCenterPoint(), target.getCenterPoint());
    const pathCheck = canvas.grid.measurePath(ray);
    dist = pathCheck?.totalDistance ?? 0;
  } catch (err) {
    console.error("Raidri-KI | Fehler bei Pfadmessung:", err);
    return;
  }

  if (dist <= canvas.grid.size) {
    console.log("Raidri-KI | Bereits angrenzend zum Ziel – kein Weg nötig.");
    await performAttack(token, target);
    return;
  }

  const reachable = await manager.pointsWithinRangeOfToken(token, movement);
  debugLog("Erreichbare Punkte:", reachable);

  if (!reachable?.length) {
    console.warn("Raidri-KI | Keine erreichbaren Punkte.");
    return;
  }

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

  manager.drawPath(token.id, target.id);
  await new Promise(resolve => setTimeout(resolve, 500));

  await token.document.update({ x: best.point.px, y: best.point.py });
  manager.clearPath(token.id);

  await performAttack(token, target);
  console.log("Raidri-KI | Zug abgeschlossen.");
}
