// Konfigurierbare Einstellungen für das Modul
export const MODULE_ID = "raidri-ki-dsa5";

/**
 * Registriert alle game.settings für das Modul
 */
export function registerSettings() {
  game.settings.register(MODULE_ID, "enableDebug", {
    name: "Debug-Modus aktivieren",
    hint: "Zeigt zusätzliche Konsolenausgaben für Entwicklerzwecke.",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });
}

/**
 * Gibt Debug-Logs aus, wenn aktiviert
 */
export function debugLog(...args) {
  if (game.settings.get(MODULE_ID, "enableDebug")) {
    console.log("🛠️ Raidri-KI DEBUG:", ...args);
  }
}
