// Hier entsteht die zentrale KI-Logik
import { getVisibleEnemies, isTokenEnemy } from "./dsa5Adapter.js";
import { findPathToToken } from "./pathingHelper.js";
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

  // 3. Pfad zum Ziel berechnen
  const path = await findPathToToken(token, target);
  if (!path || !path.length) {
    console.warn("Raidri-KI | Kein Pfad gefunden.");
    return;
  }

  // 4. Token bewegen (nur erstes Feld für Demo)
  const firstStep = path[0];
  await token.document.update({ x: firstStep.point.px, y: firstStep.point.py });

  // 5. Angriff ausführen
  await performAttack(token, target);

  console.log("Raidri-KI | Zug abgeschlossen.");
}
