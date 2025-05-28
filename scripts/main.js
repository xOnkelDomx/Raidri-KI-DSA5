import { runNpcTurn } from "./aiController.js";
import { registerSettings, debugLog } from "./settings.js";

// Entry point: register hooks and settings
Hooks.once('init', () => {
  console.log('⚔️ Raidri-KI-DSA5 | Initialisierung...');
  registerSettings();
});

Hooks.once("ready", () => {
  // Optional: Hinweis auf externes Modul
  if (!game.modules.get("lib-find-the-path-12")?.active) {
    console.warn("Raidri-KI Hinweis: Das Modul 'lib-find-the-path-12' ist nicht aktiv – es wird aber nicht mehr benötigt.");
  }

  debugLog("Raidri-KI bereit – Du kannst nun mit Taste G einen NPC-Zug auslösen.");

  window.addEventListener("keydown", async (event) => {
    // Taste G (nur wenn kein Texteingabefeld aktiv ist)
    if (
      event.key.toLowerCase() === "g" &&
      !event.repeat &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      const token = canvas.tokens?.controlled?.[0];
      if (!token) {
        ui.notifications.warn("Bitte ein Token auswählen.");
        return;
      }

      ui.notifications.info(`Raidri-KI: ${token.name} führt Zug aus...`);
      debugLog("Hotkey G gedrückt. Starte KI-Zug für Token:", token.name);
      await runNpcTurn(token);
    }
  });

  console.log("⚔️ Raidri-KI-DSA5 | Hotkey [G] aktiviert für KI-Test");
});
