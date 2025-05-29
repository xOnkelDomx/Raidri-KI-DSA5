import { runNpcTurn, findBestTarget } from "./aiController.js";
import { registerSettings, debugLog } from "./settings.js";
import { PointFactory } from "./lib/point.js";
import { FTPUtility } from "./lib/utility.js";
import { PathManager } from "./lib/pathManager.js";
import * as Adapter from "./systemAdapter.js";

// Entry point: register hooks and settings
Hooks.once("init", () => {
  console.log("⚔️ Raidri-KI | Initialisierung...");
  registerSettings();
  console.log("🧠 Raidri-KI | Modul initialisiert");
});

Hooks.once("ready", async () => {
  console.log(`📘 Aktives Regelsystem erkannt: ${game.system.id}`);
  ui.notifications.info("Raidri-KI: Modul geladen und bereit");

  if (!game.modules.get("lib-find-the-path-12")?.active) {
    console.warn("Raidri-KI Hinweis: Das Modul 'lib-find-the-path-12' ist nicht aktiv – es wird aber nicht mehr benötigt.");
  }

  debugLog("Raidri-KI bereit – Du kannst nun mit Taste G einen NPC-Zug in zwei Phasen auslösen.");

  // Adapter-Initialisierung (nicht vergessen!)
  if (Adapter?.initAdapter) await Adapter.initAdapter();

  window.RaidriPreview = null;

  window.addEventListener("keydown", async (event) => {
    const key = event.key.toLowerCase();
    console.log("Taste gedrückt:", key);

    if (key === "g") {
      ui.notifications.info("🔥 Taste G erkannt!");
    }

    if (key === "escape") {
      ui.notifications.warn("❌ ESC erkannt – würde Vorschau abbrechen.");
    }

    if (
      key === "g" &&
      !event.repeat &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      const token = canvas.tokens?.controlled?.[0];
      if (!token) {
        ui.notifications.warn("Bitte ein Token auswählen.");
        return;
      }

      // Zweiter Druck = Ausführung
      if (window.RaidriPreview?.token === token) {
        const { path, utility, target } = window.RaidriPreview;

        if (path && utility) {
          const success = await utility.traverse(0, 100, 200);
          if (success) {
            await Adapter.performAttack(token, target);
          }
        }

        utility.clearHighlights();
        game.user?.targets?.delete(target);
        window.RaidriPreview = null;
        return;
      }

      // Erster Druck = Ziel & Vorschau
      const target = await findBestTarget(token);
      if (!target) {
        ui.notifications.info("Raidri-KI: Kein erreichbares Ziel.");
        return;
      }

      const origin = new PointFactory().segmentFromToken(token);
      const dest = new PointFactory().segmentFromToken(target);
      const movement = Adapter.getMovementValue(token);
      const path = await PathManager.pathToSegment(origin, dest, movement);

      if (!path?.valid) {
        ui.notifications.info("Raidri-KI: Kein gültiger Pfad gefunden.");
        return;
      }

      const utility = new FTPUtility({ token, path });
      utility.highlightSegments(path.path);

      window.RaidriPreview = { token, target, path, utility };

      game.user?.targets?.clear();
      game.user?.targets?.add(target);

      ui.notifications.info(`Raidri-KI: Ziel gewählt (${target.name}). Vorschau aktiv.`);
    }

    // ESC = Abbruch
    if (key === "escape") {
      if (window.RaidriPreview?.utility) {
        window.RaidriPreview.utility.clearHighlights();
      }

      if (window.RaidriPreview?.target) {
        game.user?.targets?.delete(window.RaidriPreview.target);
      }

      window.RaidriPreview = null;
      ui.notifications.info("Raidri-KI: Vorschau abgebrochen.");
      return;
    }
  });

  console.log("✅ Raidri-KI | Eventlistener registriert");
});
