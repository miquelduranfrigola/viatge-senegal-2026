# Viatge a Senegal 2026

Guia de viatge en català per a quatre amics que viatgen al Senegal del **27 de desembre de 2026 al 4 de gener de 2027**, amb arribada a Dakar.

És una web estàtica pensada per publicar-se a GitHub Pages: no cal compilar res.

## Què hi ha

| Pàgina | Contingut |
|---|---|
| `index.html` | Portada: compte enrere, imprescindibles, agenda i mapa |
| `cataleg.html` | Catàleg filtrable: activitats, menjar, nit i allotjament, amb fotos i fonts |
| `regions.html` | Les set regions, amb temps des de Dakar i dies recomanats |
| `itinerari.html` | Sis itineraris dia a dia per anar pel vostre compte |
| `agenda.html` | Esdeveniments d'aquells dies: Cap d'Any, festivals, lluita, futbol |
| `coneix.html` | Context: història, gent, religió, gastronomia, música, art, lluita, natura |
| `cultura.html` | Llibres, pel·lícules i música per preparar el viatge |
| `practic.html` | Visat, salut, diners, transport, seguretat, pressupost i wolof bàsic |
| `fonts.html` | Totes les fonts consultades i els crèdits de les fotos |

## Com està fet

- **Dades:** `data/*.json`. Totes les pàgines es generen a partir d'aquests fitxers, així que per afegir o corregir alguna cosa n'hi ha prou d'editar el JSON.
- **Disseny:** `DESIGN.md`, el sistema «Teranga», segons el format [DESIGN.md](https://github.com/google-labs-code/design.md) de Google. Els tokens es tradueixen a variables CSS a `assets/css/style.css`. Té mode clar i fosc.
- **Lògica:** `assets/js/app.js`, en JavaScript pla.
- **Mapes:** [Leaflet](https://leafletjs.com) amb [OpenStreetMap](https://www.openstreetmap.org).
- **Fotos:** `assets/img/`, de [Wikimedia Commons](https://commons.wikimedia.org) amb llicències lliures. L'autor i la llicència de cada foto surten a la fitxa i a `fonts.html`.

## Veure-la en local

```bash
python3 -m http.server 8000
# obre http://localhost:8000
```

Cal un servidor perquè les pàgines carreguen els JSON amb `fetch`; obrint els fitxers directament no funciona.

## Publicar a GitHub Pages

A *Settings → Pages*, tria **Deploy from a branch**, la branca `main` i la carpeta `/ (root)`. El fitxer `.nojekyll` ja hi és.

## Avís

La informació es va recollir el novembre de 2026 a partir de guies, blogs, fòrums i webs oficials. Preus, horaris i dates d'esdeveniments canvien sovint: comproveu-los abans de marxar, sobretot els requisits d'entrada i salut a [exteriores.gob.es](https://www.exteriores.gob.es) i l'agenda de Cap d'Any a principis de desembre.
