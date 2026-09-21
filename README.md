# Sidney Lokker 5000 🐶🎯

**Sidney Lokker 5000** is een interactieve, speelse webapplicatie die speciaal is ontworpen om Sidney te lokken door middel van onweerstaanbare hondenfoto's!

Met één druk op de knop vuurt de machine een verse pup af op het scherm, compleet met synthetisch blafgeluid, pootjes-confetti, live ras-detectie en humoristische statusupdates.

---

## 🚀 Snelle Start

Je kunt de site op meerdere eenvoudige manieren openen:

### Optie 1: Direct in de browser openen
Dubbelklik op `index.html` of open het bestand direct in Chrome, Firefox, Safari of Edge.

### Optie 2: Lokale webserver starten (aanbevolen)
Via Python:
```bash
python3 -m http.server 8000
```
Open vervolgens in je browser: [http://localhost:8000](http://localhost:8000)

Of via Node / npx:
```bash
npx serve .
```

---

## ✨ Functies & Highlights

- **🐶 Oneindig veel honden**: Gekoppeld aan de gratis [Dog CEO API](https://dog.ceo/dog-api/) met automatische extractie van het hondenras (bijv. *Golden Retriever*, *Corgi*, *Husky*).
- **🛡️ 100% Offline & Fallback-proof**: Mocht de externe API offline zijn of een timeout geven, schakelt het systeem naadloos over naar een ingebouwde fallback-verzameling van schattige honden.
- **🔊 Web Audio Synthesizer**: Een eigen, lokaal gegenereerd "Woof!"-blafgeluid via de Web Audio API (geen externe audiobestanden nodig!) inclusief handige aan/uit knop.
- **🐾 Visuele Partikeleffecten**: Bij elke klik spatten er vrolijke pootjes en emoji's rond de knop.
- **📊 Sidney Lok-Statistieken**:
  - Teller voor het aantal gelanceerde honden (automatisch bewaard in `localStorage`).
  - Lokkracht-indicator oplopend tot 5000%.
  - 100% Sidney Succesgarantie.
  - Dynamische statusupdates ("*Sidney is gelokt! Hij rent al naar de voordeur!*").
- **📱 Volledig Responsief & Toegankelijk**: Perfect bruikbaar op smartphones, tablets en desktops met volledige toetsenbord- en schermlezer-ondersteuning.
