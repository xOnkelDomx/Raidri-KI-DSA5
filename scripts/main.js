import { runNpcTurn } from "./aiController.js";
import { registerSettings } from "./settings.js";

// Entry point: register hooks and settings
Hooks.once('init', () => {
  console.log('⚔️ Raidri-KI-DSA5 | Initialisierung...');
  registerSettings(); // Debug-Einstellung registrieren
});

Hooks.once("ready", () => {
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

      await ChatMessage.create({
        content: `<div><strong>🤖 Raidri-KI:</strong> ${token.name} hat seinen Zug abgeschlossen.</div>`,
        speaker: ChatMessage.getSpeaker({ token })
      });
    }
  });

  console.log("⚔️ Raidri-KI-DSA5 | Hotkey [G] aktiviert für KI-Test");
});
