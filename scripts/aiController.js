import { getVisibleEnemies } from "./dsa5Adapter.js";
import { performAttack } from "./dsa5Adapter.js";
import { debugLog } from "./settings.js";
import { PointFactory } from "./lib/point.js";
import { FTPUtility } from "./lib/utility.js";
import { PathManager } from "./lib/pathManager.js";

/**
 * Wählt den am besten erreichbaren, nächsten Feind
 */
export async function findBestTarget(token) {
  const enemies = getVisibleEnemies(token);
  if (!enemies.length) return null;

  const origin = new PointFactory().segmentFromToken(token);
  const movement = token.actor.system?.status?.speed?.value || 4;

  const reachableTargets = [];

  for (let enemy of enemies) {
    const dest = new PointFactory().segmentFromToken(enemy);
    const path = await PathManager.pathToSegment(origin, dest, movement);
    if (path?.valid) {
      reachableTargets.push({ enemy, path });
    }
  }

  if (!reachableTargets.length) return null;

  // Nach Pfadkosten (Distanz) sortieren
  reachableTargets.sort((a, b) => a.path.cost - b.path.cost);

  return reachableTargets[0].enemy;
}

/**
 * Bewegt Token an eine angrenzende freie Position beim Ziel
 */
export async function moveAdjacentToTarget(token, target) {
  const origin = new PointFactory().segmentFromToken(token);
  const targetSeg = new PointFactory().segmentFromToken(target);
  const movement = token.actor.system?.status?.speed?.value || 4;

  const neighbors = targetSeg.point.neighbors()
    .map(p => PointFactory.segmentFromPoint(p, origin.width, origin.height))
    .filter(s => s.isValid);

  for (let seg of neighbors) {
    const path = await PathManager.pathToSegment(origin, seg, movement);
    if (path?.valid) {
      const utility = new FTPUtility({ token, path });
      const success = await utility.traverse(0, 100, 200);
      if (success) return true;
    }
  }

  return false;
}

/**
 * Führt einen vollständigen NPC-Zug aus
 * - Ziel bestimmen
 * - Hinbewegen
 * - Angreifen
 */
export async function runNpcTurn(token) {
  if (!token || !token.actor) return;

  console.log("Raidri-KI | Starte NPC-Zug für:", token.name);

  const target = await findBestTarget(token);
  if (!target) {
    console.log("Raidri-KI | Kein erreichbares Ziel.");
    return;
  }

  const dist = canvas.grid.measureDistance(token.getCenter(), target.getCenter());
  if (dist <= canvas.grid.size) {
    console.log("Raidri-KI | Ziel ist angrenzend – Angriff direkt.");
    await performAttack(token, target);
    return;
  }

  const moved = await moveAdjacentToTarget(token, target);
  if (!moved) {
    console.warn("Raidri-KI | Konnte keine angrenzende Position erreichen.");
    return;
  }

  await performAttack(token, target);
  console.log("Raidri-KI | Zug abgeschlossen.");
}
