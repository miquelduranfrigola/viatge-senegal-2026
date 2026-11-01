/* Service worker: la guia funciona sense connexió un cop visitada. */
const VERSION = "v2";
const CORE = `core-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;
const PAGES = ["./", "index.html", "cataleg.html", "regions.html", "guies.html", "itinerari.html", "agenda.html", "natura.html", "coneix.html", "cultura.html", "compres.html", "practic.html", "fonts.html"];
const DATA = ["activitats", "regions", "itineraris", "esdeveniments", "coneix", "cultura", "practic", "experiencies", "alias", "hero", "ciutats", "directori", "aire_lliure", "compres_idioma"].map((n) => `data/${n}.json`);
const ASSETS = ["assets/css/style.css", "assets/js/app.js", "manifest.webmanifest", "assets/img/hero.jpg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CORE).then((c) => Promise.all([...PAGES, ...DATA, ...ASSETS].map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => ![CORE, RUNTIME].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isDoc = req.mode === "navigate" || /\.(html|json|css|js)$/.test(url.pathname) && sameOrigin;
  if (isDoc) {
    // Xarxa primer (contingut actualitzat), memòria cau si no hi ha connexió.
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(CORE).then((c) => c.put(req, cp)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
    return;
  }
  // Imatges, tipografies, tessel·les de mapa i llibreries: memòria cau primer.
  if (/\.(jpg|jpeg|png|webp|svg|woff2?)$/.test(url.pathname) || /tile\.openstreetmap|fonts\.(googleapis|gstatic)|cdnjs/.test(url.host)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      if (r.ok || r.type === "opaque") { const cp = r.clone(); caches.open(RUNTIME).then((c) => c.put(req, cp)); }
      return r;
    }).catch(() => hit)));
  }
});
