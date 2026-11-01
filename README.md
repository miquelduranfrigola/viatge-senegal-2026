# Viatge a Senegal 2026

Guia de viatge en català per a quatre amics que viatgen al Senegal del **27 de desembre de 2026 al 4 de gener de 2027**, amb arribada a Dakar.

És una web estàtica pensada per publicar-se a GitHub Pages: no cal compilar res.

## Què hi ha

| Pàgina | Contingut |
|---|---|
| `index.html` | Portada: cerca, compte enrere, 20 experiències imprescindibles, «Si t'agrada…», agenda i mapa |
| `cataleg.html` | Catàleg filtrable (activitats, menjar, nit, allotjament) amb fotos i fonts, i llista de preferits compartible |
| `regions.html` | Les set regions, amb temps des de Dakar i dies recomanats |
| `guies.html` | Guies de ciutat: barris, com arribar-hi i moure's, informació pràctica, compres i seguretat |
| `itinerari.html` | Sis itineraris dia a dia per anar pel vostre compte |
| `agenda.html` | Esdeveniments d'aquells dies: Cap d'Any, festivals, lluita, futbol |
| `natura.html` | Surf, ocells, fauna, rutes a peu i en bici (amb mapa), platges i cel nocturn |
| `coneix.html` | Context: història, gent, religió, gastronomia, música, art, lluita, natura |
| `cultura.html` | Llibres, pel·lícules i música per preparar el viatge |
| `compres.html` | Què comprar i on, com regatejar, i guia de conversa en wòlof i francès |
| `practic.html` | Llista de tasques, visat, salut, diners, transport, temps de trajecte, directori A–Z, pressupost i wolof bàsic |
| `fonts.html` | Totes les fonts consultades i els crèdits de les fotos |

## Funcions útils

- **Cerca global:** la icona de la lupa, la tecla `/` o `Ctrl/Cmd+K` cerquen a tota la guia (accents opcionals, amb sinònims).
- **Preferits:** el cor de cada fitxa afegeix el lloc a la vostra llista. Amb «Comparteix la llista» n'obteniu un enllaç per enviar al grup.
- **Sense connexió:** un cop visitada, la web funciona sense cobertura. El botó del peu de pàgina descarrega totes les fotos abans del viatge. També es pot afegir a la pantalla d'inici del mòbil.
- **Mode fosc:** el botó de la lluna.

## Com està fet

- **Dades:** `data/*.json`. Totes les pàgines es generen a partir d'aquests fitxers, així que per afegir o corregir alguna cosa n'hi ha prou d'editar el JSON.
- **Disseny:** `DESIGN.md`, el sistema «Teranga», segons el format [DESIGN.md](https://github.com/google-labs-code/design.md) de Google. Els tokens es tradueixen a variables CSS a `assets/css/style.css`. Té mode clar i fosc.
- **Lògica:** `assets/js/app.js`, en JavaScript pla. `sw.js` és el service worker del mode sense connexió.
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
