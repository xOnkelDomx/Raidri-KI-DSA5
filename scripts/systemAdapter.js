let adapterModule = null;

/**
 * Initialisiert das passende System-Adaptermodul basierend auf dem aktiven Foundry-System
 */
export async function initAdapter() {
  switch (game.system.id) {
    case "dnd5e":
      adapterModule = await import("./adapter-dnd5e.js");
      break;
    case "swade":
      adapterModule = await import("./adapter-swade.js");
      break;
    case "dsa5":
    default:
      adapterModule = await import("./adapter-dsa5.js");
      break;
  }
}

export function getVisibleEnemies(...args) {
  return adapterModule.getVisibleEnemies(...args);
}

export function isTokenEnemy(...args) {
  return adapterModule.isTokenEnemy(...args);
}

export function performAttack(...args) {
  return adapterModule.performAttack(...args);
}

export function getMovementValue(...args) {
  return adapterModule.getMovementValue(...args);
}
