import { debugLog } from "./settings.js";
import { PathManager } from "./lib/pathManager.js";
import { PointFactory } from "./lib/point.js";
import * as Adapter from "./systemAdapter.js";

/**
 * Findet einen Pfad vom agierenden Token zum Zieltoken mithilfe der lokalen lib-find-the-path
 * @param {Token} token
 * @param {Token} target
 * @param {number} [movement] - maximale Reichweite (z. B. 8). Falls nicht angegeben, wird sie per Adapter ermittelt.
 * @returns {Segment[]} Pfad als Array von Segmenten oder null bei Fehler
 */
export async function findPathToToken(token, target, movement) {
  if (!token || !target) {
    console.warn("Raidri-KI | Ungültige Eingabe für Pfadberechnung.");
    return null;
  }

  const factory = new PointFactory();
  const originSeg = factory.segmentFromToken(token);
  const destSeg = factory.segmentFromToken(target);

  if (!originSeg?.isValid || !destSeg?.isValid) {
    console.warn("Raidri-KI | Ungültige Segmente für Pfadberechnung.");
    return null;
  }

  const moveRange = movement ?? Adapter.getMovementValue(token);

  const config = PathManager.defaultConfig();
  config.collision.checkCollision = true;
  config.collision.whitelist = [token];

  const path = await PathManager.pathToSegment(originSeg, destSeg, moveRange);
  debugLog("Gefundener Pfad:", path);

  if (!path?.valid) {
    console.warn("Raidri-KI | Kein gültiger Pfad gefunden.");
    return null;
  }

  return path.path.map(node => node.originSeg);
}
