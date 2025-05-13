import { runNpcTurn } from "./aiController.js";
import { registerSettings } from "./settings.js";

// Entry point: register hooks and settings
Hooks.once('init', () => {
  console.log('⚔️ Raidri-KI-DSA5 | Initialisierung...');
  registerSettings();
});

Hooks.once("ready", () => {
  // Sicherstellen, dass lib-find-the-path-12 vorhanden ist
  if (!game.modules.get("lib-find-the-path-12")?.active) {
    ui.notifications.error("Raidri-KI benötigt 'lib-find-the-path-12'. Bitte installieren und aktivieren.");
    return;
  }

  window.addEventListener("keydown", async (event) => {
    // Taste G (nur wenn kein Texteingabefeld aktiv ist)
    if (
      event.key.toLowerCase() === "g" &&
      !event.repeat &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      const token = canvas.tokens.controlled[0];
      if (!token) {
        ui.notifications.warn("Bitte ein Token auswählen.");
        return;
      }

      ui.notifications.info(`Raidri-KI: ${token.name} führt Zug aus...`);
      await runNpcTurn(token);
    }
  });

  console.log("⚔️ Raidri-KI-DSA5 | Hotkey [G] aktiviert für KI-Test");
});
