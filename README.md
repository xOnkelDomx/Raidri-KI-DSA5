# Raidri-KI – Systemübergreifende NPC-Kampf-KI für FoundryVTT

![Cover](./assets/cover.png)

**Raidri-KI** ist ein FoundryVTT-Modul zur automatisierten Steuerung von NPC-Zügen im Kampf. Das Modul unterstützt verschiedene Regelsysteme – aktuell:

- 🛡️ Das Schwarze Auge 5 (DSA5)
- ⚔️ Dungeons & Dragons 5e (D&D5e)
- 🔫 Savage Worlds Adventure Edition (SWADE)

---

## 🔧 Funktionen

- Automatische Zielauswahl für den nächsten Gegner
- Pfadberechnung inkl. Hindernissen, Tokenkollisionen und Sichtlinien
- Vorschau des geplanten Zuges per Hotkey `[G]`
- Tokenbewegung mit optionaler Drehung
- Automatischer Nahkampfangriff nach Bewegung
- Abbruch per `ESC` jederzeit möglich
- Adapter-System für Mehrsystem-Unterstützung

---

## 🎮 Nutzung

1. **NPC-Token auswählen**
2. **Taste `[G]` drücken**:
   - Ziel wird automatisch gewählt
   - Pfadvorschau wird angezeigt
3. **Nochmals `[G]` drücken**:
   - Token bewegt sich
   - Angriff wird ausgeführt
4. **Mit `ESC`** brichst du den Vorschau-Modus ab

---

## 🧠 Unterstützte Systeme

Raidri-KI erkennt automatisch, welches Regelsystem aktiv ist:

| System   | Status       |
|----------|--------------|
| DSA5     | ✅ vollständig |
| D&D5e    | 🧪 in Arbeit (Platzhalterlogik) |
| SWADE    | 🧪 in Arbeit (Platzhalterlogik) |

---

## 🧩 Installation

Modul-Manifest (für Foundry-Modulmanager):

```
https://raw.githubusercontent.com/xOnkelDomx/Raidri-KI-DSA5/main/module.json
```

Oder lade die neueste Version hier herunter:
👉 [Download ZIP](https://github.com/xOnkelDomx/Raidri-KI-DSA5/releases/latest)

---

## ✏️ Eigene Systemunterstützung

Du kannst eigene Adapter hinzufügen:
```bash
scripts/adapter-meinsystem.js
```

Stelle dabei sicher, dass dein Adapter folgende Funktionen exportiert:

```js
export function getVisibleEnemies(token) { ... }
export function isTokenEnemy(a, b) { ... }
export function getMovementValue(token) { ... }
export async function performAttack(attacker, target) { ... }
```

---

## 💬 Credits

Entwickelt von **OnkelDom**  
Support & Feedback gerne über Discord: `OnkelDom`

---

## 🛠️ Lizenz

MIT License – frei nutzbar und erweiterbar für deine eigenen Abenteuer.
