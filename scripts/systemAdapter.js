let adapterModule = {};

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

export const getVisibleEnemies = adapterModule.getVisibleEnemies;
export const isTokenEnemy = adapterModule.isTokenEnemy;
export const performAttack = adapterModule.performAttack;
export const getMovementValue = adapterModule.getMovementValue;
