/* Viatge a Senegal 2026 — lògica compartida */
(() => {
  "use strict";

  const NAV = [
    ["index.html", "Inici"],
    ["cataleg.html", "Catàleg"],
    ["regions.html", "Regions"],
    ["guies.html", "Ciutats", "ciutats"],
    ["itinerari.html", "Itineraris"],
    ["agenda.html", "Agenda"],
    ["mapa.html", "Mapa"],
    ["natura.html", "Natura i rutes", "aire_lliure"],
    ["practic.html", "Pràctic"],
  ];
  const NAV_MORE = [
    ["coneix.html", "Coneix el Senegal"],
    ["curiositats.html", "Curiositats", "curiositats"],
    ["compres.html", "Compres i frases", "compres_idioma"],
    ["cotxe.html", "Lloguer de cotxe", "cotxe"],
    ["cultura.html", "Llegir, mirar i escoltar"],
    ["fonts.html", "Fonts i crèdits"],
  ];

  const REGIONS = {
    dakar: "Dakar",
    voltants: "Voltants de Dakar",
    "petite-cote": "Petite Côte",
    saloum: "Sine-Saloum",
    nord: "Nord i Saint-Louis",
    casamance: "Casamance",
    est: "Est i País Bassari",
  };
  const TYPES = { activitat: "Activitat", menjar: "Menjar", nit: "Nit i música", allotjament: "Allotjament" };
  const TYPE_ICON = { activitat: "explore", menjar: "restaurant", nit: "nightlife", allotjament: "bed" };
  const CATS = {
    cultura: "Cultura", historia: "Història", platja: "Platja", natura: "Natura", aventura: "Aventura",
    gastronomia: "Gastronomia", "musica-nit": "Música i nit", mercats: "Mercats", esport: "Esport",
    excursio: "Excursió", relax: "Relax", fauna: "Fauna", art: "Art",
  };
  const PRICE = ["Gratis", "€", "€€", "€€€"];
  const REGION_COLOR = {
    dakar: "#9A4A1C", voltants: "#C46A2B", "petite-cote": "#00658E", saloum: "#3F6837",
    nord: "#B8860B", casamance: "#2E7D5B", est: "#6B4E9B",
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (n) => `<span class="msym" aria-hidden="true">${n}</span>`;
  const cache = {};
  const load = (name) => (cache[name] ??= fetch(`data/${name}.json`).then((r) => {
    if (!r.ok) throw new Error(`No s'ha pogut carregar ${name}`);
    return r.json();
  }));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sense emmagatzematge */ } },
  };

  /* ---------- Layout ---------- */
  function layout() {
    const here = location.pathname.split("/").pop() || "index.html";
    const link = ([h, t, need]) => `<a href="${h}"${need ? ` data-need="${need}" hidden` : ""}${h === here ? ' aria-current="page"' : ""}>${t}</a>`;
    const header = document.createElement("header");
    header.className = "topbar";
    header.innerHTML = `
      <div class="container">
        <a class="brand" href="index.html"><span class="dot" aria-hidden="true"></span>Senegal 2026</a>
        <nav class="nav" id="nav">${NAV.map(link).join("")}
          <details class="more"${NAV_MORE.some(([h]) => h === here) ? ' data-current="1"' : ""}><summary>Més ${icon("expand_more")}</summary><div class="more-menu">${NAV_MORE.map(link).join("")}</div></details>
          <div class="nav-flat">${NAV_MORE.map(link).join("")}</div></nav>
        <button class="search-pill" aria-label="Cerca a tota la guia">${icon("search")}<span>Cerca</span><kbd>/</kbd></button>
        <button class="icon-btn menu-btn" aria-label="Menú" aria-controls="nav" aria-expanded="false">${icon("menu")}</button>
        <button class="icon-btn theme-btn" aria-label="Canvia el tema">${icon("dark_mode")}</button>
      </div>`;
    document.body.prepend(header);
    const nav = $("#nav"), mb = $(".menu-btn", header);
    document.addEventListener("click", (e) => { const d = $(".more", nav); if (d && d.open && !d.contains(e.target)) d.open = false; });
    $$("[data-need]", nav).forEach((a) => fetch(`data/${a.dataset.need}.json`, { method: "HEAD" }).then((r) => { if (r.ok) a.hidden = false; }).catch(() => {}));
    mb.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      mb.setAttribute("aria-expanded", open);
    });
    const saved = store.get("theme");
    if (saved) document.documentElement.dataset.theme = saved;
    const tb = $(".theme-btn", header);
    const isDark = () => document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    const syncIcon = () => { $(".msym", tb).textContent = isDark() ? "light_mode" : "dark_mode"; };
    syncIcon();
    tb.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      store.set("theme", next);
      syncIcon();
    });

    $(".search-pill", header).addEventListener("click", () => openSearch());
    document.addEventListener("keydown", (e) => {
      const typing = /input|textarea|select/i.test(document.activeElement?.tagName || "");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) { e.preventDefault(); openSearch(); }
    });
    $$("[data-open-search]").forEach((b) => b.addEventListener("click", () => openSearch()));
    const hs = $("#home-search");
    if (hs) hs.addEventListener("submit", (e) => { e.preventDefault(); openSearch($("input", hs).value); });

    const footer = document.createElement("footer");
    footer.innerHTML = `
      <div class="container">
        <div><strong>Viatge a Senegal 2026</strong><br>27 de desembre de 2026 – 4 de gener de 2027 · 4 amics · Dakar</div>
        <div><button class="btn btn-tonal" id="offline-btn" type="button">${icon("download_for_offline")} Prepara la guia per anar sense connexió</button><div id="offline-msg" class="muted" style="margin-top:6px;font-size:13px">Descarrega totes les fotos (≈40 MB) perquè la web funcioni sense cobertura. Millor amb wifi.</div></div>
        <div>Fotos de <a href="https://commons.wikimedia.org">Wikimedia Commons</a> (llicències lliures, crèdits a cada imatge i a <a href="fonts.html">Fonts</a>).<br>Disseny: sistema <a href="https://github.com/google-labs-code/design.md">DESIGN.md</a> «Teranga».</div>
      </div>`;
    document.body.append(footer);
    $("#offline-btn").addEventListener("click", async () => {
      const msg = $("#offline-msg");
      if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) { msg.textContent = "Torna a carregar la pàgina un cop i prova-ho de nou (cal el mode sense connexió activat)."; return; }
      const names = ["activitats", "regions", "coneix", "practic", "esdeveniments", "ciutats", "aire_lliure", "compres_idioma", "experiencies", "itineraris", "cultura", "directori", "alias", "hero"];
      const pages = ["index.html", "cataleg.html", "regions.html", "guies.html", "itinerari.html", "agenda.html", "natura.html", "coneix.html", "cultura.html", "compres.html", "practic.html", "fonts.html"];
      const datas = await Promise.all(names.map((n) => load(n).catch(() => null)));
      const imgs = new Set(["assets/img/hero.jpg"]);
      JSON.stringify(datas).replace(/assets\/img\/[^"\\]+\.jpg/g, (m) => imgs.add(m));
      const all = [...pages, ...names.map((n) => `data/${n}.json`), ...imgs];
      let done = 0;
      for (let i = 0; i < all.length; i += 6) {
        await Promise.all(all.slice(i, i + 6).map((u) => fetch(u).catch(() => null)));
        done = Math.min(all.length, i + 6);
        msg.textContent = `Descarregant… ${done}/${all.length}`;
      }
      msg.textContent = `Fet! ${imgs.size} fotos i totes les pàgines desades. Els mapes només funcionen sense connexió a les zones que ja hàgiu mirat.`;
    });
  }

  /* ---------- Preferits ---------- */
  const favs = {
    all() { try { return new Set(JSON.parse(store.get("favs") || "[]")); } catch { return new Set(); } },
    has(id) { return this.all().has(id); },
    toggle(id) { const f = this.all(); f.has(id) ? f.delete(id) : f.add(id); store.set("favs", JSON.stringify([...f])); return f.has(id); },
    addMany(ids) { const f = this.all(); ids.forEach((i) => f.add(i)); store.set("favs", JSON.stringify([...f])); },
  };
  const favBtn = (id) => `<span class="fav-btn" role="button" tabindex="0" data-fav="${esc(id)}" aria-pressed="${favs.has(id)}" title="Afegeix a la meva llista">${icon("favorite")}</span>`;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fav]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const on = favs.toggle(b.dataset.fav);
    $$(`[data-fav="${CSS.escape(b.dataset.fav)}"]`).forEach((x) => x.setAttribute("aria-pressed", on));
    document.dispatchEvent(new CustomEvent("favs-changed"));
  }, true);

  /* ---------- Helpers ---------- */
  const credit = (img) => img ? `${esc(img.autor || "Autor desconegut")} · <a href="${esc(img.font)}" target="_blank" rel="noopener">${esc(img.llicencia || "Commons")}</a>` : "";
  let REGION_IMG = {};
  const setRegionImgs = (regions) => { regions.forEach((r) => { if (r.imatge) REGION_IMG[r.id] = r.imatge; }); };
  const firstImg = (a) => (a.imatges && a.imatges[0]) || null;
  const placeholder = (a) => `<div class="ph" aria-hidden="true">${icon(TYPE_ICON[a.tipus] || "explore")}<span>${esc(REGIONS[a.regio] || "")}</span></div>`;
  const hours = (h) => h == null ? "" : h === 0 ? "A Dakar" : h < 1 ? `${Math.round(h * 60)} min des de Dakar` : `${String(h).replace(".", ",")} h des de Dakar`;

  function cardHTML(a) {
    const img = firstImg(a);
    return `
      <button class="card" data-id="${esc(a.id)}" aria-label="${esc(a.nom)}">
        <div class="card-img">
          ${img ? `<img src="${esc(img.src)}" alt="${esc(a.nom)}" loading="lazy">` : placeholder(a)}
          ${favBtn(a.id)}
          <div class="card-badges">
            <span class="badge badge-region">${esc(REGIONS[a.regio] || a.regio)}</span>
            ${a.imprescindible ? `<span class="badge badge-must">${icon("star")} Imprescindible</span>` : ""}
            ${a.autentic ? `<span class="badge badge-auth">${icon("eco")} Autèntic</span>` : ""}
          </div>
        </div>
        <div class="card-body">
          <span class="label">${icon(TYPE_ICON[a.tipus] || "explore")} ${esc(TYPES[a.tipus] || a.tipus)}${a.categories?.length ? " · " + a.categories.slice(0, 2).map((c) => esc(CATS[c] || c)).join(", ") : ""}</span>
          <h3>${esc(a.nom)}</h3>
          <p>${esc(a.resum)}</p>
          <div class="meta">
            ${a.durada ? `<span>${icon("schedule")}${esc(a.durada)}</span>` : ""}
            ${a.nivell_preu != null ? `<span>${icon("payments")}${PRICE[a.nivell_preu] || ""}</span>` : ""}
            ${a.hores_des_de_dakar != null ? `<span>${icon("directions_car")}${hours(a.hores_des_de_dakar)}</span>` : ""}
          </div>
        </div>
      </button>`;
  }

  /* ---------- Detail dialog ---------- */
  let dlg, dlgMap;
  function openDetail(a) {
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.className = "detail";
      document.body.append(dlg);
      dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener("close", () => {
        if (location.hash.startsWith("#a=")) history.replaceState(null, "", location.pathname + location.search);
      });
    }
    const imgs = a.imatges || [];
    let idx = 0;
    const paras = String(a.descripcio || "").split(/\n\n+/).map((p) => p.startsWith("Fora dels circuits: ")
      ? `<h3 style="margin-top:var(--s-lg)">${icon("eco")} Fora dels circuits</h3><p>${esc(p.slice(20))}</p>` : `<p>${esc(p)}</p>`).join("");
    dlg.innerHTML = `
      <button class="icon-btn detail-close" aria-label="Tanca">${icon("close")}</button>
      <div class="detail-gallery">
        ${imgs.length ? `<img src="${esc(imgs[0].src)}" alt="${esc(a.nom)}">
          <div class="detail-credit">${credit(imgs[0])}</div>` : placeholder(a)}
        ${imgs.length > 1 ? `<button class="icon-btn nav-btn prev" aria-label="Foto anterior">${icon("chevron_left")}</button>
          <button class="icon-btn nav-btn next" aria-label="Foto següent">${icon("chevron_right")}</button>` : ""}
      </div>
      <div class="detail-body">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          <span class="badge badge-region">${esc(REGIONS[a.regio] || a.regio)}</span>
          <span class="badge badge-type">${esc(TYPES[a.tipus] || a.tipus)}</span>
          ${a.imprescindible ? `<span class="badge badge-must">${icon("star")} Imprescindible</span>` : ""}
          ${a.autentic ? `<span class="badge badge-auth">${icon("eco")} Autèntic · fora dels circuits</span>` : ""}
        </div>
        <div style="display:flex;gap:12px;align-items:flex-start;justify-content:space-between"><h2>${esc(a.nom)}</h2>${favBtn(a.id).replace('class="fav-btn"', 'class="fav-btn fav-inline"')}</div>
        <p class="lead">${esc(a.resum)}</p>
        <div class="facts">
          ${a.durada ? `<div class="fact"><div class="label">${icon("schedule")}Durada</div><div>${esc(a.durada)}</div></div>` : ""}
          ${a.preu ? `<div class="fact"><div class="label">${icon("payments")}Preu</div><div>${esc(a.preu)}</div></div>` : ""}
          ${a.hores_des_de_dakar != null ? `<div class="fact"><div class="label">${icon("directions_car")}Distància</div><div>${hours(a.hores_des_de_dakar)}</div></div>` : ""}
          ${a.millor_moment ? `<div class="fact"><div class="label">${icon("wb_twilight")}Millor moment</div><div>${esc(a.millor_moment)}</div></div>` : ""}
        </div>
        ${paras}
        ${a.pel_teu_compte ? `<div class="callout green"><strong>${icon("hiking")} Pel vostre compte:</strong> ${esc(a.pel_teu_compte)}</div>` : ""}
        ${a.consells?.length ? `<div class="tips"><div class="label" style="color:inherit;margin-bottom:6px">${icon("lightbulb")} Consells</div><ul>${a.consells.map((c) => c.startsWith("Actualització (Routard/LP): ") ? `<li><strong>${icon("update")} Actualització (Routard/LP):</strong> ${esc(c.slice(28))}</li>` : `<li>${esc(c)}</li>`).join("")}</ul></div>` : ""}
        ${a.lat ? `<div class="mini-map" id="mini-map"></div>
          <p><a href="mapa.html?q=${encodeURIComponent(a.nom)}">${icon("map")} Veure al mapa de la guia</a> · <a href="https://www.google.com/maps/dir/?api=1&destination=${a.lat},${a.lng}" target="_blank" rel="noopener">${icon("directions")} Com arribar-hi (Google Maps)</a></p>` : ""}
        ${a.categories?.length ? `<p class="muted">${a.categories.map((c) => esc(CATS[c] || c)).join(" · ")}</p>` : ""}
        ${a.fonts?.length ? `<div class="sources"><div class="label">Fonts</div><ul>${a.fonts.map((f) => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nom || f.url)}</a></li>`).join("")}</ul></div>` : ""}
      </div>`;
    $(".detail-close", dlg).addEventListener("click", () => dlg.close());
    const show = (i) => {
      idx = (i + imgs.length) % imgs.length;
      $(".detail-gallery img", dlg).src = imgs[idx].src;
      $(".detail-credit", dlg).innerHTML = credit(imgs[idx]);
    };
    $(".prev", dlg)?.addEventListener("click", () => show(idx - 1));
    $(".next", dlg)?.addEventListener("click", () => show(idx + 1));
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    history.replaceState(null, "", `${location.pathname}${location.search}#a=${encodeURIComponent(a.id)}`);
    if (a.lat && window.L) {
      if (dlgMap) { dlgMap.remove(); dlgMap = null; }
      dlgMap = L.map("mini-map", { scrollWheelZoom: false }).setView([a.lat, a.lng], 11);
      tiles(dlgMap);
      L.circleMarker([a.lat, a.lng], { radius: 9, color: "#fff", weight: 2, fillColor: REGION_COLOR[a.regio] || "#9A4A1C", fillOpacity: 1 }).addTo(dlgMap);
    }
  }

  function bindCards(container, items) {
    const byId = Object.fromEntries(items.map((a) => [a.id, a]));
    window.__openAct = (id) => { if (byId[id]) openDetail(byId[id]); else location.href = `cataleg.html#a=${encodeURIComponent(id)}`; };
    container.addEventListener("click", (e) => {
      const c = e.target.closest(".card[data-id]");
      if (c && byId[c.dataset.id]) openDetail(byId[c.dataset.id]);
    });
    const m = location.hash.match(/^#a=(.+)$/);
    if (m) {
      const id = decodeURIComponent(m[1]);
      if (byId[id]) openDetail(byId[id]);
      else load("alias").then((al) => { if (byId[al[id]]) openDetail(byId[al[id]]); }).catch(() => {});
    }
  }

  /* ---------- Maps ---------- */
  function tiles(map) {
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
  }
  function fit(map, pts) {
    const go = () => { map.invalidateSize(); if (pts.length > 1) map.fitBounds(pts, { padding: [28, 28], maxZoom: 11 }); else if (pts.length) map.setView(pts[0], 10); else map.setView([14.5, -16.2], 7); };
    go(); setTimeout(go, 300);
  }
  function overviewMap(el, items) {
    if (!window.L || !el) return;
    const map = L.map(el, { scrollWheelZoom: false }).setView([14.4, -16.0], 7);
    tiles(map);
    const pts = [];
    items.filter((a) => a.lat && a.lng).forEach((a) => {
      pts.push([a.lat, a.lng]);
      const mk = L.circleMarker([a.lat, a.lng], {
        radius: a.imprescindible ? 8 : 6, color: "#fff", weight: 1.5,
        fillColor: REGION_COLOR[a.regio] || "#9A4A1C", fillOpacity: .95,
      }).addTo(map);
      mk.bindPopup(`<b>${esc(a.nom)}</b><br>${esc(REGIONS[a.regio] || "")} · ${esc(TYPES[a.tipus] || "")}<br><a href="cataleg.html#a=${encodeURIComponent(a.id)}">Veure fitxa →</a>`);
    });
    fit(map, pts);
    const legend = L.control({ position: "bottomleft" });
    legend.onAdd = () => {
      const d = L.DomUtil.create("div");
      d.style.cssText = "background:rgba(255,255,255,.92);color:#221A15;padding:8px 10px;border-radius:12px;font:12px/18px Inter,sans-serif";
      d.innerHTML = Object.entries(REGIONS).map(([k, v]) => `<div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${REGION_COLOR[k]};margin-right:6px"></span>${v}</div>`).join("");
      return d;
    };
    legend.addTo(map);
  }


  /* ---------- Cerca global ---------- */
  const fold = (x) => String(x ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'");
  let searchIndex = null;
  async function buildIndex() {
    if (searchIndex) return searchIndex;
    const docs = [];
    const W = (x) => " " + fold(x).replace(/[^a-z0-9]+/g, " ") + " ";
    const add = (d) => { d._t = W(d.title); d._k = W(d.tags || ""); d._b = W(d.body || ""); docs.push(d); };
    const get = (n) => load(n).catch(() => null);
    const [acts, regs, its, evs, con, cul, pra, ciu, dir, air, ci] = await Promise.all(
      ["activitats", "regions", "itineraris", "esdeveniments", "coneix", "cultura", "practic", "ciutats", "directori", "aire_lliure", "compres_idioma"].map(get));
    (acts || []).forEach((a) => add({ kind: TYPES[a.tipus] || "Fitxa", icon: TYPE_ICON[a.tipus] || "explore", title: a.nom,
      tags: `${REGIONS[a.regio] || ""} ${(a.categories || []).map((c) => CATS[c] || c).join(" ")} ${a.autentic ? "autentic" : ""}`,
      body: [a.resum, a.descripcio, a.pel_teu_compte, (a.consells || []).join(" "), a.preu, a.durada, a.millor_moment].join(" • "),
      url: `cataleg.html#a=${encodeURIComponent(a.id)}`, actId: a.id, sub: REGIONS[a.regio] }));
    (regs || []).forEach((r) => add({ kind: "Regió", icon: "map", title: r.nom, tags: r.etiqueta, body: [r.descripcio, r.com_arribar, r.dies, r.ideal].join(" • "), url: `regions.html#${r.id}` }));
    (its || []).forEach((it) => {
      add({ kind: "Itinerari", icon: "route", title: it.nom, tags: it.ritme, body: [it.resum, it.per_a_qui, it.ruta, it.transport, (it.notes || []).join(" ")].join(" • "), url: `itinerari.html#${it.id}` });
      it.dies.forEach((d) => add({ kind: "Dia d'itinerari", icon: "today", title: `${d.data}: ${d.titol}`, sub: it.nom.split(":")[0],
        body: [d.plans.map((p) => p.text).join(" "), d.transport, d.dormir].join(" • "), url: `itinerari.html#${it.id}` }));
    });
    (evs || []).forEach((e) => add({ kind: "Agenda", icon: "event", title: e.titol, tags: `${e.categoria} ${e.confirmacio} ${e.lloc || ""}`,
      sub: e.data_inici, body: [e.descripcio, e.com_anar].join(" • "), url: `agenda.html#${e.id}` }));
    (con?.capitols || []).forEach((c) => {
      add({ kind: "Coneix el Senegal", icon: c.icona || "menu_book", title: c.titol, tags: c.subtitol, body: [c.paragrafs.join(" "), (c.punts_clau || []).join(" ")].join(" • "), url: `coneix.html#${c.id}` });
      (c.llista?.items || []).forEach((x) => add({ kind: c.titol, icon: c.icona || "menu_book", title: x.nom, body: [x.text, x.on].join(" • "), url: `coneix.html#${c.id}` }));
    });
    if (cul) {
      cul.llibres.forEach((b, i) => add({ kind: "Llibre", icon: "menu_book", title: b.titol, tags: `${b.autor} ${b.titol_original || ""} ${b.genere || ""}`, body: [b.per_que, b.traduccions].join(" • "), url: `cultura.html#b-${i}` }));
      cul.pellicules.forEach((f, i) => add({ kind: "Pel·lícula", icon: "movie", title: f.titol, tags: `${f.director} ${f.titol_original || ""} ${f.tipus || ""}`, body: [f.per_que, f.on_veure].join(" • "), url: `cultura.html#f-${i}` }));
      cul.musica.forEach((m, i) => add({ kind: "Música", icon: "music_note", title: m.artista, tags: m.tema, body: m.per_que, url: `cultura.html#m-${i}` }));
    }
    if (pra) {
      pra.seccions.forEach((x) => add({ kind: "Pràctic", icon: x.icona || "info", title: x.titol, body: x.punts.join(" • "), url: `practic.html#${x.id}` }));
      add({ kind: "Pràctic", icon: "partly_cloudy_day", title: "El temps a finals de desembre", tags: "clima temperatura harmattan", body: pra.clima, url: "practic.html" });
      pra.calendari.forEach((c) => add({ kind: "Calendari", icon: "calendar_month", title: c.titol, sub: c.data, body: c.descripcio, url: "practic.html#calendari" }));
      pra.pressupost.forEach((c) => add({ kind: "Pressupost", icon: "payments", title: c.concepte, tags: "preu cost", body: c.preu, url: "practic.html#pressupost" }));
      pra.plats.forEach((c) => add({ kind: "Plat", icon: "restaurant", title: c.nom, body: c.descripcio, url: "practic.html#plats" }));
      pra.wolof.forEach((w) => add({ kind: "Wolof", icon: "translate", title: `${w.wolof} — ${w.catala}`, body: w.pronuncia, url: "practic.html#wolof" }));
    }
    (ciu?.ciutats || []).forEach((c) => add({ kind: "Guia de ciutat", icon: "location_city", title: c.nom, tags: c.resum,
      body: JSON.stringify([c.orientacio, c.barris, c.arribar, c.moure_s, c.info_practica, c.compres, c.seguretat]).replace(/[{}\[\]"]/g, " "), url: `guies.html#${c.id}` }));
    if (dir) {
      (dir.necessitat_saber || []).forEach((x) => add({ kind: "Cal saber", icon: "info", title: x.tema, body: x.valor, url: "practic.html#cal-saber" }));
      (dir.az || []).forEach((x, i) => add({ kind: "Directori A–Z", icon: x.icona || "info", title: x.tema, body: x.punts.join(" • "), url: `practic.html#az-${i}` }));
      (dir.salut || []).forEach((x, i) => add({ kind: "Salut", icon: "medical_services", title: x.tema, body: x.punts.join(" • "), url: `practic.html#salut-${i}` }));
      (dir.transport_taula || []).forEach((t) => add({ kind: "Trajecte", icon: "directions_bus", title: `${t.de} → ${t.a}`, tags: "temps distancia transport", body: [t.temps, t.km && `${t.km} km`, t.mitjans, t.notes].join(" • "), url: "practic.html#trajectes" }));
    }
    (air?.seccions || []).forEach((sec) => {
      add({ kind: "Natura i aventura", icon: "hiking", title: sec.titol, body: [sec.intro, (sec.consells || []).join(" ")].join(" • "), url: `natura.html#${sec.id}` });
      const secTags = { caminar: "ruta rutes caminada senderisme a peu trekking", bici: "ruta rutes bici bicicleta pedalar", surf: "surf onades", ocells: "ocells birding", platges: "platja banyar-se", aigua: "caiac pirogua nedar pesca" }[sec.id] || "";
      (sec.llocs || []).forEach((l, i) => add({ kind: sec.titol, icon: sec.id === "bici" ? "pedal_bike" : "hiking", title: l.nom, tags: `${secTags} ${REGIONS[l.regio] || ""} ${l.nivell || ""} ${l.dificultat || ""}`,
        body: [l.detall, l.descripcio_ruta, l.inici, l.final, l.km && `${l.km} km`, l.durada].join(" • "), url: `natura.html#${sec.id}-${i}` }));
      (sec.especies || []).forEach((e) => add({ kind: "Espècie", icon: "flutter_dash", title: e.nom_catala, tags: e.nom_cientific, body: [e.on, e.quan].join(" • "), url: `natura.html#${sec.id}` }));
    });
    if (ci?.compres) {
      (ci.compres.objectes || []).forEach((o) => add({ kind: "Compres", icon: "shopping_bag", title: o.nom, body: [o.descripcio, o.on, o.preu].join(" • "), url: "compres.html#objectes" }));
      (ci.compres.llocs || []).forEach((o) => add({ kind: "On comprar", icon: "storefront", title: o.nom, body: o.detall, url: "compres.html#llocs" }));
      add({ kind: "Compres", icon: "sell", title: "Com regatejar", tags: "regateig preu", body: (ci.compres.regatejar || []).join(" "), url: "compres.html#regatejar" });
    }
    const car = await get("cotxe");
    if (car) {
      add({ kind: "Lloguer de cotxe", icon: "directions_car", title: "Límits de quilòmetres", tags: "km quilometratge il·limitat lloguer cotxe", body: car.km_explicacio + " " + (car.consells_km || []).join(" "), url: "cotxe.html#km" });
      add({ kind: "Lloguer de cotxe", icon: "calculate", title: "Calculadora de km del lloguer", tags: "km calculadora lloguer cotxe límit", body: "Calcula si el límit de quilòmetres del lloguer és suficient per a cada itinerari.", url: "cotxe.html#calc" });
      (car.opcions || []).forEach((o) => add({ kind: "Lloguer de cotxe", icon: "directions_car", title: o.nom, tags: `${o.tipus} lloguer cotxe ${o.on || ""}`, body: [o.km, o.preu, o.franquicia, o.notes, (o.pros || []).join(" "), (o.contres || []).join(" ")].join(" \u2022 "), url: "cotxe.html#opcions-s" }));
      [["Requisits per llogar", car.requisits, "req"], ["Assegurança del cotxe", car["assegurança"], "req"], ["Conduir al Senegal", car.conduir, "cond"]].forEach(([t, a, h]) => a && add({ kind: "Lloguer de cotxe", icon: "badge", title: t, tags: "cotxe conduir", body: a.map((x) => typeof x === "string" ? x : Object.values(x).join(": ")).join(" \u2022 "), url: `cotxe.html#${h}` }));
      (car.peatges || []).forEach((x) => add({ kind: "Peatge", icon: "toll", title: x.tram, tags: "peatge autopista", body: x.preu, url: "cotxe.html#cond" }));
    }
    (await get("curiositats") || []).forEach((f) => add({ kind: "Curiositat", icon: "lightbulb", title: f.fet.length > 90 ? f.fet.slice(0, 88) + "…" : f.fet, tags: (FCAT[f.categoria] || [f.categoria])[0], body: [f.fet, f.detall].join(" \u2022 "), url: `curiositats.html#fet-${f.n}` }));
    (ci?.idioma?.situacions || []).forEach((sit) => sit.frases.forEach((f) => add({ kind: `Frases · ${sit.titol}`, icon: "translate", title: `${f.catala}`, tags: `${f.wolof} ${f.frances}`, body: `Wòlof: ${f.wolof} [${f.pronuncia || ""}] · Francès: ${f.frances}`, url: "compres.html#idioma" })));
    searchIndex = docs;
    return docs;
  }
  const SYN = [
    ["paludisme", "malaria", "paludismo", "mosquit"], ["visat", "visado", "visa"], ["ferri", "ferry", "vaixell", "batobi"],
    ["regatejar", "regateig", "negociar", "regatear"], ["menjar", "restaurant", "gargota", "dibiterie"], ["dormir", "allotjament", "hotel", "campament", "campement", "auberge", "hostal"],
    ["platja", "platges", "plage", "beach"], ["ocells", "aus", "oiseaux", "birds"], ["diners", "canvi", "caixer", "fcfa", "cfa", "efectiu"],
    ["taxi", "yango", "heetch"], ["tren", "ter"], ["bici", "bicicleta", "velo", "vtt"], ["caminar", "caminada", "trekking", "senderisme", "excursio"],
    ["lluita", "laamb", "lutte"], ["futbol", "football"], ["seguretat", "perill", "robatori", "estafa"], ["salut", "hospital", "clinica", "farmacia", "metge"],
    ["vacuna", "vacunes", "febre groga"], ["cap d any", "reveillon", "nit de cap d any", "31 des"], ["telefon", "sim", "mobil", "internet", "wifi"],
    ["aeroport", "aibd"], ["preu", "preus", "cost", "pressupost"]
  ].map((g) => g.map((w) => fold(w).replace(/[^a-z0-9]+/g, " ").trim()));
  const expand = (t) => { const g = SYN.find((g) => g.some((w) => w === t || (t.length > 4 && w.startsWith(t)))); return g ? [...new Set([t, ...g])] : [t]; };
  function runSearch(docs, q) {
    const terms = fold(q).replace(/[^a-z0-9]+/g, " ").split(" ").filter((t) => t.length >= 2 && !["de", "la", "el", "les", "els", "a", "i", "per", "amb", "que", "un", "una", "on", "com", "del", "dels"].includes(t));
    if (!terms.length) return [];
    const phrase = " " + fold(q).replace(/[^a-z0-9]+/g, " ").trim();
    const res = [];
    for (const d of docs) {
      let score = 0, ok = true;
      for (const t of terms) {
        const alts = expand(t).map((x) => " " + x);
        const hit = (f) => alts.some((x) => f.includes(x));
        const inT = hit(d._t), inK = hit(d._k), inB = hit(d._b);
        if (!inT && !inK && !inB) { ok = false; break; }
        const ex = " " + t, w = (f, full, syn) => f.includes(ex) ? full : syn;
        const nB = d._b.split(ex).length - 1;
        score += (inT ? w(d._t, 12, 6) : 0) + (inK ? w(d._k, 4, 2) : 0) + (inB ? (nB ? 1 + Math.min(6, nB - 1) * 0.5 : 0.4) : 0);
        if (d._t.startsWith(" " + t)) score += 4;
      }
      if (!ok) continue;
      if (terms.length > 1 && (d._t.includes(phrase) || d._b.includes(phrase))) score += 10;
      if (d.actId) score += 1;
      res.push([score, d]);
    }
    res.sort((a, b) => b[0] - a[0]);
    return res.slice(0, 60).map((r) => r[1]);
  }
  function snippet(d, q) {
    const terms = fold(q).split(/\s+/).filter((t) => t.length >= 2);
    const raw = String(d.body || "");
    const f = fold(raw);
    let pos = -1;
    for (const t of terms) { pos = f.indexOf(t); if (pos >= 0) break; }
    let start = Math.max(0, pos - 70), end = Math.min(raw.length, (pos < 0 ? 0 : pos) + 170);
    let text = (start > 0 ? "…" : "") + raw.slice(start, end) + (end < raw.length ? "…" : "");
    return highlight(text, terms);
  }
  function highlight(text, terms) {
    let out = esc(text);
    const ft = fold(text);
    const marks = [];
    terms.forEach((t) => { let i = ft.indexOf(t); while (i >= 0) { marks.push([i, i + t.length]); i = ft.indexOf(t, i + t.length); } });
    if (!marks.length) return out;
    marks.sort((a, b) => a[0] - b[0]);
    const merged = [];
    marks.forEach((m) => { const l = merged[merged.length - 1]; if (l && m[0] <= l[1]) l[1] = Math.max(l[1], m[1]); else merged.push([...m]); });
    let html = "", last = 0;
    merged.forEach(([a, b]) => { html += esc(text.slice(last, a)) + "<mark>" + esc(text.slice(a, b)) + "</mark>"; last = b; });
    return html + esc(text.slice(last));
  }
  let sdlg;
  function openSearch(initial = "") {
    if (!sdlg) {
      sdlg = document.createElement("dialog");
      sdlg.className = "search-dlg";
      sdlg.innerHTML = `
        <div class="search-head">
          <label class="search">${icon("search")}<span class="visually-hidden">Cerca a tota la guia</span>
            <input id="gq" type="search" placeholder="Cerca a tota la guia: visat, ferri, thiéboudienne, surf, Cap d'Any…" autocomplete="off"></label>
          <button class="icon-btn" id="gq-close" aria-label="Tanca">${icon("close")}</button>
        </div>
        <div class="search-hint muted" id="gq-hint">Escriu una o més paraules. Accents opcionals. <kbd>↑</kbd><kbd>↓</kbd> per moure't, <kbd>Enter</kbd> per obrir.</div>
        <div class="search-results" id="gq-res" role="listbox"></div>`;
      document.body.append(sdlg);
      sdlg.addEventListener("click", (e) => { if (e.target === sdlg) sdlg.close(); });
      $("#gq-close", sdlg).addEventListener("click", () => sdlg.close());
      const inp = $("#gq", sdlg), out = $("#gq-res", sdlg);
      let sel = 0, items = [];
      const render = async () => {
        const q = inp.value;
        try { sessionStorage.setItem("gq", q); } catch { /* ignore */ }
        if (fold(q).trim().length < 2) { out.innerHTML = SUGGEST; return; }
        out.innerHTML = `<div class="empty">Cercant…</div>`;
        const docs = await buildIndex();
        items = runSearch(docs, q); sel = 0;
        const terms = fold(q).split(/\s+/).filter((t) => t.length >= 2);
        $("#gq-hint", sdlg).textContent = items.length ? `${items.length}${items.length === 60 ? "+" : ""} resultats per «${q}»` : "";
        out.innerHTML = items.length ? items.map((d, i) => `
          <a class="sr${i === 0 ? " on" : ""}" href="${esc(d.url)}" data-i="${i}" role="option">
            <span class="sr-ico">${icon(d.icon)}</span>
            <span class="sr-main"><span class="sr-kind">${esc(d.kind)}${d.sub ? ` · ${esc(d.sub)}` : ""}</span>
              <span class="sr-title">${highlight(d.title, terms)}</span>
              <span class="sr-snip">${snippet(d, q)}</span></span>
          </a>`).join("") : `<div class="empty">Cap resultat per «${esc(q)}». Prova amb una altra paraula (o en francès).</div>`;
      };
      const SUGGEST = `<div class="sugg"><div class="label">Proves ràpides</div>${["visat", "ferri Ziguinchor", "Cap d'Any", "lluita", "surf", "thiéboudienne", "paludisme", "sept-place", "Lompoul", "regatejar", "pirogua", "wolof gràcies"].map((x) => `<button class="chip" data-q="${esc(x)}">${esc(x)}</button>`).join("")}</div>`;
      out.addEventListener("click", (e) => {
        const c = e.target.closest("[data-q]"); if (c) { inp.value = c.dataset.q; render(); inp.focus(); return; }
        const a = e.target.closest(".sr"); if (a) { e.preventDefault(); go(items[+a.dataset.i]); }
      });
      let tmr;
      inp.addEventListener("input", () => { clearTimeout(tmr); tmr = setTimeout(render, 120); });
      inp.addEventListener("keydown", (e) => {
        const rows = $$(".sr", out);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault(); if (!rows.length) return;
          sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length;
          rows.forEach((r, i) => r.classList.toggle("on", i === sel)); rows[sel].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter" && items[sel]) { e.preventDefault(); go(items[sel]); }
      });
      sdlg._render = render;
    }
    const inp = $("#gq", sdlg);
    let prev = ""; try { prev = sessionStorage.getItem("gq") || ""; } catch { /* ignore */ }
    inp.value = initial || prev;
    if (!sdlg.open) sdlg.showModal();
    inp.focus(); inp.select();
    sdlg._render();
    buildIndex();
  }
  function go(d) {
    if (!d) return;
    const here = location.pathname.split("/").pop() || "index.html";
    const [page, hash] = d.url.split("#");
    sdlg.close();
    if (page === here) {
      if (d.actId && window.__openAct) { window.__openAct(d.actId); return; }
      location.hash = hash || "";
      const el = hash && document.getElementById(decodeURIComponent(hash));
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); flash(el); }
      if (window.__onHash) window.__onHash();
    } else location.href = d.url;
  }
  function flash(el) { el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1800); }
  function scrollToHash() {
    if (!location.hash || location.hash.startsWith("#a=")) return;
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) { setTimeout(() => { el.scrollIntoView({ block: "start" }); flash(el); }, 60); }
  }




  /* ---------- Lloguer de cotxe ---------- */
  async function pageCotxe() {
    const [d, its] = await Promise.all([load("cotxe"), load("itineraris")]);
    const paras = (t) => (Array.isArray(t) ? t : String(t || "").split(/\n\n+/)).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("");
    const list = (a) => (a || []).map((x) => `<li>${esc(typeof x === "string" ? x : Object.values(x).join(": "))}</li>`).join("");
    $("#car-intro").innerHTML = paras(d.intro);
    $("#km-exp").innerHTML = paras(d.km_explicacio);
    $("#km-tips").innerHTML = list(d.consells_km);
    const TT = { comparador: ["Comparador", "travel_explore"], internacional: ["Agència internacional", "public"], local: ["Agència local", "storefront"], xofer: ["Cotxe amb xofer", "person"] };
    $("#opcions").innerHTML = (d.opcions || []).map((o) => `
      <article class="info car-opt">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px"><span class="badge badge-type">${icon((TT[o.tipus] || [0, "directions_car"])[1])} ${esc((TT[o.tipus] || [o.tipus])[0])}</span>${o.on ? `<span class="badge badge-region">${esc(o.on)}</span>` : ""}</div>
        <h3 style="font-size:20px">${esc(o.nom)}</h3>
        <dl class="kv">
          ${o.km ? `<dt>${icon("speed")} Km</dt><dd><strong>${esc(o.km)}</strong></dd>` : ""}
          ${o.preu ? `<dt>${icon("payments")} Preu</dt><dd>${esc(o.preu)}</dd>` : ""}
          ${o.franquicia ? `<dt>${icon("shield")} Franquícia</dt><dd>${esc(o.franquicia)}</dd>` : ""}
          ${o.diposit ? `<dt>${icon("credit_card")} Dipòsit</dt><dd>${esc(o.diposit)}</dd>` : ""}
        </dl>
        ${o.pros?.length ? `<p class="where" style="color:var(--tertiary)">${icon("thumb_up")} ${o.pros.map(esc).join(" · ")}</p>` : ""}
        ${o.contres?.length ? `<p class="where" style="color:var(--error)">${icon("thumb_down")} ${o.contres.map(esc).join(" · ")}</p>` : ""}
        ${o.notes ? `<p class="muted" style="font-size:14px">${esc(o.notes)}</p>` : ""}
        ${o.web ? `<p><a href="${esc(o.web)}" target="_blank" rel="noopener">${icon("open_in_new")} Web</a></p>` : ""}
        ${srcLine(o.fonts)}
      </article>`).join("");
    $("#requisits").innerHTML = list(d.requisits);
    $("#asseguranca").innerHTML = list(d["assegurança"] || d.asseguranca);
    $("#conduir").innerHTML = list(d.conduir);
    $("#peatges").innerHTML = (d.peatges || []).map((x) => `<tr><td>${esc(x.tram)}</td><td>${esc(x.preu)}</td></tr>`).join("");
    $("#benzina").textContent = d.benzina || "";
    $("#car-src").innerHTML = srcLine(d.fonts);

    // Calculadora
    const sel = $("#calc-it");
    sel.innerHTML = its.map((it) => `<option value="${it.id}">${esc(it.nom.split(":")[0])} (≈${it.km_aprox} km)</option>`).join("") + `<option value="custom">Una altra ruta (introdueix els km)</option>`;
    const ROADKM = { casamance: 450 };
    const EUR = 655.957;
    const fmt = (n) => Math.round(n).toLocaleString("ca");
    const calc = () => {
      const it = its.find((x) => x.id === sel.value);
      const custom = sel.value === "custom";
      $("#calc-custom-row").hidden = !custom;
      let base = custom ? +$("#calc-km").value || 0 : (ROADKM[it.id] ?? it.km_aprox);
      const margin = +$("#calc-margin").value || 0;
      const total = base * (1 + margin / 100);
      const days = +$("#calc-days").value || 0;
      const mode = $("#calc-mode").value;
      const lim = +$("#calc-limit").value || 0;
      const included = mode === "dia" ? lim * days : mode === "total" ? lim : Infinity;
      const extraPrice = +$("#calc-extra").value || 0;
      const excess = Math.max(0, total - included);
      const cost = excess * extraPrice;
      $("#calc-perday-row").hidden = mode === "il";
      const r = $("#calc-result");
      const note = !custom && it.id === "casamance" ? `<p class="muted" style="font-size:13px">Per a l'itinerari de la Casamance només es compta la part per carretera (≈450 km), perquè l'anada és en avió.</p>` : "";
      r.className = "callout " + (excess > 0 ? "warn" : "green");
      r.innerHTML = `
        <div class="calc-grid">
          <div><div class="label" style="color:inherit">Km estimats</div><b>${fmt(total)} km</b><small>${fmt(base)} km + ${margin}% de marge</small></div>
          <div><div class="label" style="color:inherit">Km inclosos</div><b>${included === Infinity ? "Il·limitats" : fmt(included) + " km"}</b><small>${mode === "dia" ? `${fmt(lim)} km/dia × ${days} dies` : mode === "total" ? "total del lloguer" : ""}</small></div>
          <div><div class="label" style="color:inherit">Km de més</div><b>${fmt(excess)} km</b><small>${excess > 0 ? `${((excess / (included || 1)) * 100).toFixed(0)}% per sobre` : "dins del límit"}</small></div>
          <div><div class="label" style="color:inherit">Cost extra</div><b>${excess > 0 ? `${fmt(cost)} FCFA` : "0"}</b><small>${excess > 0 ? `≈ ${fmt(cost / EUR)} € (≈ ${fmt(cost / EUR / 4)} €/persona)` : "cap sorpresa"}</small></div>
        </div>
        <p style="margin-top:10px"><strong>${excess > 0 ? `${icon("warning")} Amb aquest límit us en passareu. Negocieu més km o il·limitat abans de signar, o compareu-ho amb un cotxe amb xofer.` : `${icon("check_circle")} Amb aquest límit en teniu prou, amb marge.`}</strong></p>${note}`;
    };
    $$("#calc input, #calc select").forEach((el) => el.addEventListener("input", calc));
    $("#calc-presets").addEventListener("click", (e) => {
      const b = e.target.closest("[data-preset]"); if (!b) return;
      const [mode, lim] = b.dataset.preset.split(":");
      $("#calc-mode").value = mode; if (lim) $("#calc-limit").value = lim; calc();
    });
    calc();
    // Matriu itinerari × límit
    const LIMS = [100, 150, 200, 300];
    $("#km-matrix").innerHTML = `<thead><tr><th>Itinerari (km + 20%)</th>${LIMS.map((l) => `<th>${l} km/dia<br><small>${fmt(l * 9)} km</small></th>`).join("")}<th>Il·limitat</th></tr></thead><tbody>${its.map((it) => {
      const km = (ROADKM[it.id] ?? it.km_aprox) * 1.2;
      return `<tr><td><strong>${esc(it.nom.split(":")[0])}</strong><br><small class="muted">≈${fmt(km)} km</small></td>${LIMS.map((l) => { const ex = Math.max(0, km - l * 9); return `<td class="${ex ? "km-bad" : "km-ok"}">${ex ? `+${fmt(ex)} km<br><small>≈${fmt(ex * 200 / EUR)} €</small>` : "✓"}</td>`; }).join("")}<td class="km-ok">✓</td></tr>`;
    }).join("")}</tbody>`;
  }

  /* ---------- Mapa interactiu ---------- */
  async function pageMapa() {
    const get = (n) => load(n).catch(() => null);
    const [acts, evs, air, ci, ciu, regions] = await Promise.all(["activitats", "esdeveniments", "aire_lliure", "compres_idioma", "ciutats", "regions"].map(get));
    const inSN = (lat, lng) => lat > 11.5 && lat < 17.2 && lng > -18 && lng < -10.8;
    const LAYERS = {
      activitat: { t: "Activitats", ic: "explore", c: "#9A4A1C" },
      menjar: { t: "Menjar", ic: "restaurant", c: "#C46A2B" },
      nit: { t: "Nit i música", ic: "nightlife", c: "#6B4E9B" },
      allotjament: { t: "Allotjament", ic: "bed", c: "#00658E" },
      event: { t: "Agenda (27/12–4/1)", ic: "event", c: "#BA1A1A" },
      natura: { t: "Natura, surf i platges", ic: "forest", c: "#3F6837" },
      ruta: { t: "Rutes a peu i en bici", ic: "hiking", c: "#2E7D5B" },
      compres: { t: "On comprar", ic: "shopping_bag", c: "#B8860B" },
      ciutat: { t: "Ciutats", ic: "location_city", c: "#382E29" },
    };
    const pts = [];
    (acts || []).forEach((a) => { if (a.lat && a.lng && inSN(a.lat, a.lng)) pts.push({ layer: a.tipus in LAYERS ? a.tipus : "activitat", lat: a.lat, lng: a.lng, nom: a.nom, regio: a.regio, resum: a.resum, img: a.imatges?.[0], act: a, autentic: a.autentic, must: a.imprescindible }); });
    (evs || []).forEach((e) => { if (e.lat && e.lng && inSN(e.lat, e.lng)) pts.push({ layer: "event", lat: e.lat, lng: e.lng, nom: e.titol, regio: e.regio, resum: `${e.data_inici || ""}${e.data_fi && e.data_fi !== e.data_inici ? " – " + e.data_fi : ""} · ${e.descripcio || ""}`, url: `agenda.html#${e.id}` }); });
    const routes = [];
    (air?.seccions || []).forEach((sec) => (sec.llocs || []).forEach((l, i) => {
      const line = (l.punts || []).filter((p) => Array.isArray(p) && p.length === 2 && inSN(p[0], p[1]));
      if (line.length > 1) routes.push({ nom: l.nom, sec: sec.titol, line, km: l.km, durada: l.durada, url: `natura.html#${sec.id}-${i}`, regio: l.regio });
      else if (l.lat && l.lng && inSN(l.lat, l.lng)) pts.push({ layer: "natura", lat: l.lat, lng: l.lng, nom: l.nom, regio: l.regio, resum: `${sec.titol} · ${l.detall || ""}`, url: `natura.html#${sec.id}-${i}` });
    }));
    (ci?.compres?.llocs || []).forEach((l) => { if (l.lat && l.lng && inSN(l.lat, l.lng)) pts.push({ layer: "compres", lat: l.lat, lng: l.lng, nom: l.nom, regio: l.regio, resum: l.detall, url: "compres.html#llocs" }); });
    (ciu?.ciutats || []).forEach((c) => { if (c.lat && c.lng) pts.push({ layer: "ciutat", lat: c.lat, lng: c.lng, nom: c.nom, regio: c.regio, resum: c.resum, url: `guies.html#${c.id}` }); });

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' });
    const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 18, attribution: "Imatges &copy; Esri, Maxar, Earthstar Geographics" });
    const map = L.map("bigmap", { layers: [osm], zoomControl: true }).setView([14.5, -15.8], 7);
    L.control.layers({ "Mapa": osm, "Satèl·lit": sat }, null, { position: "topright" }).addTo(map);
    const cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 42, spiderfyOnMaxZoom: true, disableClusteringAtZoom: 15 });
    map.addLayer(cluster);
    const routeLayer = L.layerGroup().addTo(map);
    const mkIcon = (p) => L.divIcon({ className: "pin-wrap", iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -14],
      html: `<span class="pin${p.must ? " must" : ""}${p.act && favs.has(p.act.id) ? " fav" : ""}" style="background:${LAYERS[p.layer].c}">${icon(LAYERS[p.layer].ic)}</span>` });
    const popup = (p) => `
      <div class="pop">${p.img ? `<img src="${esc(p.img.src)}" alt="">` : ""}
        <div class="pop-body"><div class="pop-kind">${esc(LAYERS[p.layer].t)}${p.regio ? ` · ${esc(REGIONS[p.regio] || p.regio)}` : ""}</div>
        <b>${esc(p.nom)}</b>${p.resum ? `<p>${esc(String(p.resum).slice(0, 160))}${String(p.resum).length > 160 ? "…" : ""}</p>` : ""}
        <div class="pop-btns">${p.act ? `<button class="chip" data-open="${esc(p.act.id)}">${icon("article")} Fitxa</button>` : p.url ? `<a class="chip" href="${esc(p.url)}">${icon("article")} Més info</a>` : ""}
          <a class="chip" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" rel="noopener">${icon("directions")} Com arribar-hi</a></div></div></div>`;
    pts.forEach((p) => { p.marker = L.marker([p.lat, p.lng], { icon: mkIcon(p), title: p.nom }).bindPopup(() => popup(p), { maxWidth: 280, minWidth: 240 }); });
    routes.forEach((r) => { r.poly = L.polyline(r.line, { color: LAYERS.ruta.c, weight: 5, opacity: .85 }).bindPopup(`<div class="pop-body"><div class="pop-kind">${esc(r.sec)}</div><b>${esc(r.nom)}</b><p>${[r.km && `${esc(r.km)} km`, r.durada && esc(r.durada)].filter(Boolean).join(" · ")}</p><div class="pop-btns"><a class="chip" href="${esc(r.url)}">${icon("article")} Descripció</a></div></div>`); });
    const actById = Object.fromEntries((acts || []).map((a) => [a.id, a]));
    map.on("popupopen", (e) => { const b = e.popup.getElement().querySelector("[data-open]"); if (b) b.addEventListener("click", () => openDetail(actById[b.dataset.open])); });

    // Panel
    const state = { layers: new Set(Object.keys(LAYERS).filter((k) => k !== "allotjament")), regio: new Set(), auth: false, fav: false, q: "" };
    const count = (k) => k === "ruta" ? routes.length : pts.filter((p) => p.layer === k).length;
    $("#map-layers").innerHTML = Object.entries(LAYERS).filter(([k]) => count(k)).map(([k, L_]) => `
      <label class="layer-row"><input type="checkbox" data-layer="${k}" ${state.layers.has(k) ? "checked" : ""}><span class="pin small" style="background:${L_.c}">${icon(L_.ic)}</span><span>${esc(L_.t)}</span><small>${count(k)}</small></label>`).join("");
    $("#map-regions").innerHTML = Object.entries(REGIONS).map(([k, v]) => `<button class="chip" data-k="${k}" aria-pressed="false">${esc(v)}</button>`).join("");
    const norm = (x) => fold(x);
    function apply() {
      cluster.clearLayers(); routeLayer.clearLayers();
      const q = norm(state.q).trim();
      const vis = pts.filter((p) => state.layers.has(p.layer) && (!state.regio.size || state.regio.has(p.regio)) &&
        (!state.auth || p.autentic) && (!state.fav || (p.act && favs.has(p.act.id))) && (!q || norm(`${p.nom} ${p.resum || ""}`).includes(q)));
      cluster.addLayers(vis.map((p) => p.marker));
      let nr = 0;
      if (state.layers.has("ruta") && !state.fav && !state.auth) routes.filter((r) => (!state.regio.size || state.regio.has(r.regio)) && (!q || norm(r.nom).includes(q))).forEach((r) => { r.poly.addTo(routeLayer); nr++; });
      $("#map-count").textContent = `${vis.length} llocs${nr ? ` i ${nr} rutes` : ""} al mapa`;
      return vis;
    }
    $("#map-layers").addEventListener("change", (e) => { const k = e.target.dataset.layer; if (!k) return; e.target.checked ? state.layers.add(k) : state.layers.delete(k); apply(); });
    $("#map-regions").addEventListener("click", (e) => {
      const b = e.target.closest(".chip[data-k]"); if (!b) return;
      state.regio.has(b.dataset.k) ? state.regio.delete(b.dataset.k) : state.regio.add(b.dataset.k); b.setAttribute("aria-pressed", state.regio.has(b.dataset.k));
      const vis = apply(); if (vis.length) map.fitBounds(vis.map((p) => [p.lat, p.lng]), { padding: [30, 30], maxZoom: 12 });
    });
    $("#map-auth").addEventListener("click", (e) => { state.auth = !state.auth; e.currentTarget.setAttribute("aria-pressed", state.auth); apply(); });
    $("#map-fav").addEventListener("click", (e) => { state.fav = !state.fav; e.currentTarget.setAttribute("aria-pressed", state.fav); const v = apply(); if (state.fav && v.length) map.fitBounds(v.map((p) => [p.lat, p.lng]), { padding: [30, 30], maxZoom: 12 }); });
    let tq; $("#map-q").addEventListener("input", (e) => { clearTimeout(tq); tq = setTimeout(() => { state.q = e.target.value; const v = apply(); if (state.q.trim().length > 2 && v.length && v.length < 40) map.fitBounds(v.map((p) => [p.lat, p.lng]), { padding: [40, 40], maxZoom: 13 }); }, 200); });
    $("#map-all").addEventListener("click", () => { Object.keys(LAYERS).forEach((k) => state.layers.add(k)); $$("[data-layer]").forEach((c) => (c.checked = true)); apply(); });
    if (matchMedia("(max-width: 860px)").matches) $("#map-panel").classList.add("collapsed");
    $("#map-toggle").addEventListener("click", () => { $("#map-panel").classList.toggle("collapsed"); setTimeout(() => map.invalidateSize(), 250); });
    document.addEventListener("favs-changed", () => { pts.forEach((p) => p.act && p.marker.setIcon(mkIcon(p))); if (state.fav) apply(); });

    // Locate me
    const Loc = L.Control.extend({ options: { position: "topleft" }, onAdd() {
      const b = L.DomUtil.create("button", "loc-btn"); b.type = "button"; b.title = "On soc?"; b.innerHTML = icon("my_location");
      L.DomEvent.on(b, "click", (ev) => { L.DomEvent.stop(ev); map.locate({ setView: true, maxZoom: 14 }); });
      return b; } });
    map.addControl(new Loc());
    let me;
    map.on("locationfound", (e) => { if (me) me.remove(); me = L.layerGroup([L.circle(e.latlng, { radius: e.accuracy, color: "#00658E", weight: 1, fillOpacity: .1 }), L.circleMarker(e.latlng, { radius: 7, color: "#fff", weight: 2, fillColor: "#00658E", fillOpacity: 1 })]).addTo(map); });
    map.on("locationerror", () => alert("No s'ha pogut obtenir la ubicació (cal permís i, a l'iPhone, connexió segura)."));

    const params = new URLSearchParams(location.search);
    if (params.get("q")) { $("#map-q").value = params.get("q"); state.q = params.get("q"); }
    const vis = apply();
    map.fitBounds(vis.map((p) => [p.lat, p.lng]), { padding: [20, 20] });
    setTimeout(() => map.invalidateSize(), 200);
  }

  /* ---------- Curiositats ---------- */
  const FCAT = { geografia: ["Geografia", "public"], historia: ["Història", "history_edu"], llengua: ["Llengua", "translate"], natura: ["Natura", "forest"],
    "religio-societat": ["Religió i societat", "diversity_3"], menjar: ["Menjar", "restaurant"], "musica-art": ["Música i art", "music_note"],
    esport: ["Esport", "sports_soccer"], "vida-quotidiana": ["Vida quotidiana", "storefront"], "catalunya-senegal": ["Catalunya i Senegal", "favorite"] };
  const factHTML = (f) => {
    const [cat, ic] = FCAT[f.categoria] || [f.categoria, "lightbulb"];
    return `<article class="fact-card" id="fet-${f.n}">
      <div class="fact-top"><span class="fact-n">${f.n}</span><span class="badge badge-type">${icon(ic)} ${esc(cat)}</span></div>
      <p class="fact-text">${esc(f.fet)}</p>
      ${f.detall ? `<p class="muted fact-det">${esc(f.detall)}</p>` : ""}
      ${f.font?.url ? `<a class="fact-src" href="${esc(f.font.url)}" target="_blank" rel="noopener">${icon("link")} ${esc(f.font.nom || "Font")}</a>` : ""}
    </article>`;
  };
  async function pageCuriositats() {
    const fets = await load("curiositats");
    $("#n-fets").textContent = fets.length;
    const cats = [...new Set(fets.map((f) => f.categoria))];
    const sel = new Set();
    const filt = $("#f-filters");
    filt.innerHTML = cats.map((c) => `<button class="chip" data-k="${c}" aria-pressed="false">${icon((FCAT[c] || [0, "lightbulb"])[1])} ${esc((FCAT[c] || [c])[0])} <small>${fets.filter((f) => f.categoria === c).length}</small></button>`).join("");
    const grid = $("#fets");
    const render = () => { grid.innerHTML = fets.filter((f) => !sel.size || sel.has(f.categoria)).map(factHTML).join(""); };
    filt.addEventListener("click", (e) => { const b = e.target.closest(".chip[data-k]"); if (!b) return; sel.has(b.dataset.k) ? sel.delete(b.dataset.k) : sel.add(b.dataset.k); b.setAttribute("aria-pressed", sel.has(b.dataset.k)); render(); });
    render();
    $("#random-fet").addEventListener("click", () => {
      sel.clear(); $$(".chip", filt).forEach((c) => c.setAttribute("aria-pressed", "false")); render();
      const f = fets[Math.floor(Math.random() * fets.length)];
      const el = document.getElementById(`fet-${f.n}`); el.scrollIntoView({ behavior: "smooth", block: "center" }); flash(el);
    });
  }

  /* ---------- Guies de ciutat ---------- */
  const kvList = (arr, a, b) => (arr || []).length ? `<dl class="kv">${arr.map((x) => `<dt>${esc(x[a])}</dt><dd>${esc(x[b])}</dd>`).join("")}</dl>` : "";
  const srcLine = (f) => f?.length ? `<p class="muted" style="font-size:13px">Fonts: ${f.map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.nom)}</a>`).join(" · ")}</p>` : "";
  async function pageGuies() {
    const [d, regions, items] = await Promise.all([load("ciutats"), load("regions"), load("activitats")]);
    const regImg = Object.fromEntries(regions.map((r) => [r.id, r.imatge]));
    $("#toc").innerHTML = d.ciutats.map((c) => `<a class="chip" href="#${c.id}">${esc(c.nom)}</a>`).join("");
    $("#cities").innerHTML = d.ciutats.map((c) => {
      const near = items.filter((a) => a.tipus === "activitat" && a.lat && c.lat && Math.hypot(a.lat - c.lat, a.lng - c.lng) < 0.12).slice(0, 14);
      const img = (near.find((a) => a.imatges?.length)?.imatges[0]) || regImg[c.regio];
      return `
      <section class="chapter" id="${esc(c.id)}">
        <span class="label">${icon("location_city")} Guia de ciutat · ${esc(REGIONS[c.regio] || "")}</span>
        <h2>${esc(c.nom)}</h2>
        ${c.resum ? `<p class="lead">${esc(c.resum)}</p>` : ""}
        <div class="chapter-grid">
          <div class="chapter-text">
            ${(Array.isArray(c.orientacio) ? c.orientacio : String(c.orientacio || "").split(/\n\n+/)).map((p) => `<p>${esc(p)}</p>`).join("")}
            ${c.barris?.length ? `<h3>${icon("holiday_village")} Barris</h3><div class="items">${c.barris.map((b) => `<div class="item"><div class="item-body"><h4>${esc(b.nom)}</h4><p>${esc(b.descripcio)}</p></div></div>`).join("")}</div>` : ""}
          </div>
          <aside class="chapter-aside">
            ${img ? `<figure><img src="${esc(img.src)}" alt="${esc(c.nom)}" loading="lazy"><figcaption class="img-credit">${credit(img)}</figcaption></figure>` : ""}
            ${near.length ? `<div class="keypoints"><div class="label" style="color:inherit;margin-bottom:6px">Al catàleg</div><ul class="region-list">${near.map((a) => `<li><a href="cataleg.html#a=${encodeURIComponent(a.id)}">${esc(a.nom)}</a></li>`).join("")}</ul></div>` : ""}
          </aside>
        </div>
        <div class="info-grid" style="margin-top:var(--s-lg)">
          ${c.arribar?.length ? `<article class="info"><h3>${icon("flight_land")} Arribar-hi</h3>${kvList(c.arribar, "mitja", "detall")}</article>` : ""}
          ${c.moure_s?.length ? `<article class="info"><h3>${icon("directions_bus")} Moure's</h3>${kvList(c.moure_s, "mitja", "detall")}</article>` : ""}
          ${c.info_practica?.length ? `<article class="info"><h3>${icon("info")} Informació pràctica</h3>${kvList(c.info_practica, "tema", "detall")}</article>` : ""}
          ${c.compres?.length ? `<article class="info"><h3>${icon("shopping_bag")} Compres</h3>${kvList(c.compres, "nom", "detall")}</article>` : ""}
          ${c.seguretat?.length ? `<article class="info"><h3>${icon("shield")} Seguretat</h3><ul>${c.seguretat.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>` : ""}
        </div>
        ${srcLine(c.fonts)}
      </section>`;
    }).join("");
  }

  /* ---------- Natura i rutes ---------- */
  async function pageNatura() {
    const d = await load("aire_lliure");
    $("#intro").innerHTML = (Array.isArray(d.intro) ? d.intro : String(d.intro || "").split(/\n\n+/)).map((p) => `<p class="lead">${esc(p)}</p>`).join("");
    $("#toc").innerHTML = d.seccions.map((x) => `<a class="chip" href="#${x.id}">${esc(x.titol)}</a>`).join("");
    const routes = [];
    $("#sections").innerHTML = d.seccions.map((sec) => `
      <section class="chapter" id="${esc(sec.id)}">
        <h2>${esc(sec.titol)}</h2>
        ${sec.intro ? String(sec.intro).split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join("") : ""}
        <div class="items">${(sec.llocs || []).map((l, i) => {
          if (l.punts?.length > 1) routes.push({ ...l, sec: sec.titol });
          return `
          <div class="item" id="${esc(sec.id)}-${i}" style="scroll-margin-top:90px"><div class="item-body">
            <h4>${esc(l.nom)}</h4>
            <div class="meta" style="margin:4px 0 8px;padding:0">
              ${l.regio ? `<span>${icon("location_on")}${esc(REGIONS[l.regio] || l.regio)}</span>` : ""}
              ${l.km ? `<span>${icon("straighten")}${esc(l.km)} km</span>` : ""}
              ${l.durada ? `<span>${icon("schedule")}${esc(l.durada)}</span>` : ""}
              ${l.nivell || l.dificultat ? `<span>${icon("signal_cellular_alt")}${esc(l.nivell || l.dificultat)}</span>` : ""}
            </div>
            ${l.inici || l.final ? `<p><strong>${esc(l.inici || "")}${l.final ? " → " + esc(l.final) : ""}</strong></p>` : ""}
            ${l.detall ? `<p>${esc(l.detall)}</p>` : ""}
            ${l.descripcio_ruta ? `<p style="margin-top:6px">${esc(l.descripcio_ruta)}</p>` : ""}
            ${l.on_llogar_bici ? `<p class="where">${icon("pedal_bike")} ${esc(l.on_llogar_bici)}</p>` : ""}
            ${l.lat ? `<p class="where"><a href="https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}" target="_blank" rel="noopener">${icon("map")} Mapa</a></p>` : ""}
          </div></div>`; }).join("")}</div>
        ${sec.especies?.length ? `<h3 style="margin-top:var(--s-lg)">Espècies destacades</h3><div class="table-wrap"><table class="tbl"><thead><tr><th>Espècie</th><th>On</th><th>Quan</th></tr></thead><tbody>${sec.especies.map((e) => `<tr><td><strong>${esc(e.nom_catala)}</strong><br><em class="muted">${esc(e.nom_cientific || "")}</em></td><td>${esc(e.on || "")}</td><td>${esc(e.quan || "")}</td></tr>`).join("")}</tbody></table></div>` : ""}
        ${sec.on_llogar?.length ? `<div class="callout green"><strong>${icon("storefront")} On llogar o fer classes</strong><ul>${sec.on_llogar.map((o) => `<li><strong>${esc(o.nom)}</strong>: ${esc(o.detall)}</li>`).join("")}</ul></div>` : ""}
        ${sec.consells?.length ? `<div class="tips"><div class="label" style="color:inherit;margin-bottom:6px">${icon("lightbulb")} Consells</div><ul>${sec.consells.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>` : ""}
        ${srcLine(sec.fonts)}
      </section>`).join("");
    if (window.L && routes.length) {
      const map = L.map("routes-map", { scrollWheelZoom: false }); tiles(map);
      const all = [];
      const colors = ["#9A4A1C", "#00658E", "#3F6837", "#B8860B", "#6B4E9B", "#C46A2B", "#2E7D5B"];
      routes.forEach((r, i) => {
        const pts = r.punts.filter((p) => Array.isArray(p) && p.length === 2);
        if (pts.length < 2) return;
        all.push(...pts);
        L.polyline(pts, { color: colors[i % colors.length], weight: 4, opacity: .85 }).addTo(map).bindPopup(`<b>${esc(r.nom)}</b><br>${esc(r.sec)}${r.km ? ` · ${esc(r.km)} km` : ""}`);
        L.circleMarker(pts[0], { radius: 5, color: "#fff", weight: 1.5, fillColor: colors[i % colors.length], fillOpacity: 1 }).addTo(map);
      });
      fit(map, all);
    } else { const m = $("#routes-map"); if (m) m.style.display = "none"; }
  }

  /* ---------- Compres i frases ---------- */
  async function pageCompres() {
    const d = await load("compres_idioma");
    const c = d.compres || {}, l = d.idioma || {};
    $("#c-intro").innerHTML = String(c.intro || "").split(/\n\n+/).map((p) => `<p class="lead">${esc(p)}</p>`).join("");
    $("#regatejar-list").innerHTML = (c.regatejar || []).map((x) => `<li>${esc(x)}</li>`).join("");
    $("#objectes-grid").innerHTML = (c.objectes || []).map((o) => `
      <div class="item">${o.imatge ? `<img src="${esc(o.imatge.src)}" alt="${esc(o.nom)}" loading="lazy">` : ""}<div class="item-body"><h4>${esc(o.nom)}</h4><p>${esc(o.descripcio)}</p>
        ${o.on ? `<div class="where">${icon("location_on")} ${esc(o.on)}</div>` : ""}${o.preu ? `<div class="where">${icon("payments")} ${esc(o.preu)}</div>` : ""}</div></div>`).join("");
    $("#llocs-list").innerHTML = (c.llocs || []).map((o) => `<div class="item"><div class="item-body"><h4>${esc(o.nom)}</h4><div class="where">${icon("location_on")} ${esc(REGIONS[o.regio] || o.regio || "")}</div><p>${esc(o.detall)}</p></div></div>`).join("");
    $("#evitar-list").innerHTML = (c.evitar || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const pc = c.portar_a_casa;
    if (pc) $("#evitar").insertAdjacentHTML("afterend", `<div class="callout"><strong>${icon("luggage")} Portar-ho a casa</strong>${Array.isArray(pc) ? `<ul>${pc.map((x) => `<li>${esc(typeof x === "string" ? x : Object.values(x).join(": "))}</li>`).join("")}</ul>` : `<p>${esc(pc)}</p>`}</div>`);
    $("#c-src").innerHTML = srcLine(c.fonts);
    $("#l-intro").innerHTML = String(l.intro || "").split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join("");
    $("#pron-list").innerHTML = (l.pronuncia || []).map((x) => `<li>${esc(x)}</li>`).join("");
    $("#derem").textContent = l["dërëm"] || l.derem || "";
    $("#sit-toc").innerHTML = (l.situacions || []).map((x, i) => `<a class="chip" href="#sit-${i}">${esc(x.titol)}</a>`).join("");
    $("#situacions").innerHTML = (l.situacions || []).map((sit, i) => `
      <h3 id="sit-${i}" style="margin-top:var(--s-lg);scroll-margin-top:90px">${esc(sit.titol)}</h3>
      <div class="table-wrap"><table class="tbl phr"><thead><tr><th>Català</th><th>Wòlof</th><th>Pronúncia</th><th>Francès</th></tr></thead><tbody>
        ${sit.frases.map((f) => `<tr><td>${esc(f.catala)}</td><td><strong>${esc(f.wolof)}</strong></td><td class="muted">${esc(f.pronuncia || "")}</td><td>${esc(f.frances || "")}</td></tr>`).join("")}
      </tbody></table></div>`).join("");
    $("#l-src").innerHTML = (l.nota ? `<p class="muted" style="font-size:13px">${icon("info")} ${esc(l.nota)}</p>` : "") + srcLine(l.fonts);
  }

  /* ---------- Directori (pràctic) ---------- */
  async function renderDirectori() {
    const d = await load("directori").catch(() => null);
    const box = $("#directori"); if (!d || !box) return;
    const sec = (x, id) => `<article class="info" id="${id}" style="scroll-margin-top:90px"><h3>${icon(x.icona || "info")} ${esc(x.tema)}</h3><ul>${x.punts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>${x.fonts?.length ? `<div class="src">Fonts: ${x.fonts.map((f) => `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nom)}</a>`).join(" · ")}</div>` : ""}</article>`;
    box.innerHTML = `
      ${d.necessitat_saber?.length ? `<section class="section" id="cal-saber" style="scroll-margin-top:80px"><h2>Cal saber</h2><div class="table-wrap"><table class="tbl"><tbody>${d.necessitat_saber.map((x) => `<tr><th style="width:34%">${esc(x.tema)}</th><td>${esc(x.valor)}</td></tr>`).join("")}</tbody></table></div></section>` : ""}
      ${d.transport_taula?.length ? `<section class="section" id="trajectes" style="padding-top:0;scroll-margin-top:80px"><h2>Temps de trajecte entre llocs clau</h2><div class="table-wrap"><table class="tbl"><thead><tr><th>Trajecte</th><th>Km</th><th>Temps</th><th>Com</th></tr></thead><tbody>${d.transport_taula.map((t) => `<tr><td><strong>${esc(t.de)} → ${esc(t.a)}</strong>${t.notes ? `<br><span class="muted">${esc(t.notes)}</span>` : ""}</td><td>${esc(t.km ?? "")}</td><td style="white-space:nowrap">${esc(t.temps || "")}</td><td>${esc(t.mitjans || "")}</td></tr>`).join("")}</tbody></table></div></section>` : ""}
      ${d.salut?.length ? `<section class="section" id="salut-det" style="padding-top:0;scroll-margin-top:80px"><h2>Salut</h2><div class="info-grid">${d.salut.map((x, i) => sec({ ...x, icona: x.icona || "medical_services" }, `salut-${i}`)).join("")}</div></section>` : ""}
      ${d.az?.length ? `<section class="section" id="az" style="padding-top:0;scroll-margin-top:80px"><h2>Directori A–Z</h2><div class="info-grid">${d.az.map((x, i) => sec(x, `az-${i}`)).join("")}</div></section>` : ""}`;
    const toc = $("#toc");
    if (toc) toc.insertAdjacentHTML("afterbegin", [["cal-saber", "Cal saber"], ["trajectes", "Trajectes"], ["salut-det", "Salut"], ["az", "Directori A–Z"]].filter(([id]) => document.getElementById(id)).map(([id, t]) => `<a class="chip" href="#${id}">${t}</a>`).join(""));
  }

  /* ---------- Pages ---------- */
  async function pageIndex() {
    const [items, regions] = await Promise.all([load("activitats"), load("regions")]);
    setRegionImgs(regions);
    load("hero").then((h) => { $("#hero-credit").innerHTML = `Foto: ${credit(h)}`; }).catch(() => {});
    load("curiositats").then((fets) => {
      const box = $("#sabies"); if (!box || !fets.length) return;
      const show = () => { const f = fets[Math.floor(Math.random() * fets.length)]; $("#sabies-text").textContent = f.fet; $("#sabies-n").textContent = `#${f.n}`; };
      box.hidden = false; show();
      $("#sabies-next").addEventListener("click", show);
    }).catch(() => {});
    load("esdeveniments").then((ev) => {
      const el = $("#agenda-teaser"); if (!el) return;
      const top = ev.filter((e) => ["cap-d-any", "festival", "lluita", "musica"].includes(e.categoria)).slice(0, 6);
      el.innerHTML = top.map(eventHTML).join("");
    }).catch(() => {});
    const acts = items.filter((a) => a.tipus === "activitat");
    $("#stat-acts").textContent = acts.length;
    $("#stat-total").textContent = items.length;
    $("#stat-regions").textContent = new Set(items.map((a) => a.regio)).size;
    const byId = Object.fromEntries(items.map((a) => [a.id, a]));
    const exp = await load("experiencies").catch(() => ({ top: [], si_tagrada: [] }));
    const grid = $("#must-grid");
    grid.innerHTML = exp.top.filter((t) => byId[t.id]).map((t, i) => cardHTML({ ...byId[t.id], nom: `${i + 1}. ${t.titol}`, resum: t.text }).replace('class="card"', 'class="card top-card"')).join("");
    bindCards(grid, items);
    $("#if-you-like").innerHTML = exp.si_tagrada.map((g) => `
      <article class="info"><h3>${icon(g.icona)} …${esc(g.titol)}</h3>
        <ul class="region-list">${g.ids.filter((id) => byId[id]).map((id) => `<li><a href="cataleg.html#a=${encodeURIComponent(id)}">${esc(byId[id].nom)}</a></li>`).join("")}</ul></article>`).join("");
    overviewMap($("#map"), items);

    const target = new Date("2026-12-27T00:00:00Z").getTime();
    const cd = $("#countdown");
    const tick = () => {
      const d = target - Date.now();
      if (d <= 0) { cd.innerHTML = "<div><b>Ja hi som!</b><span>Bon viatge</span></div>"; return; }
      const days = Math.floor(d / 864e5), h = Math.floor(d / 36e5) % 24, m = Math.floor(d / 6e4) % 60;
      cd.innerHTML = `<div><b>${days}</b><span>dies</span></div><div><b>${h}</b><span>hores</span></div><div><b>${m}</b><span>minuts</span></div>`;
    };
    tick(); setInterval(tick, 30000);
  }

  async function pageCataleg() {
    const [items, regions] = await Promise.all([load("activitats"), load("regions")]);
    setRegionImgs(regions);
    const params = new URLSearchParams(location.search);
    const state = {
      q: "", regio: new Set(params.getAll("regio")), tipus: new Set(params.getAll("tipus")),
      cat: new Set(params.getAll("cat")), must: params.has("imprescindible"), auth: params.has("autentic"), sort: "recomanat", maxh: "",
      fav: params.has("preferits"), shared: params.get("llista") ? new Set(params.get("llista").split(",")) : null,
    };
    const chips = (id, map, set) => {
      const counts = {};
      items.forEach((a) => {
        const vals = id === "cat" ? a.categories || [] : [a[id === "regio" ? "regio" : "tipus"]];
        vals.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
      });
      $(`#f-${id}`).innerHTML += Object.entries(map).filter(([k]) => counts[k])
        .map(([k, v]) => `<button class="chip" data-k="${k}" aria-pressed="${set.has(k)}">${esc(v)} <small>${counts[k]}</small></button>`).join("");
      $(`#f-${id}`).addEventListener("click", (e) => {
        const b = e.target.closest(".chip[data-k]"); if (!b) return;
        set.has(b.dataset.k) ? set.delete(b.dataset.k) : set.add(b.dataset.k);
        b.setAttribute("aria-pressed", set.has(b.dataset.k));
        render();
      });
    };
    chips("regio", REGIONS, state.regio);
    chips("tipus", TYPES, state.tipus);
    chips("cat", CATS, state.cat);
    const mustBtn = $("#f-must");
    mustBtn.setAttribute("aria-pressed", state.must);
    mustBtn.addEventListener("click", () => { state.must = !state.must; mustBtn.setAttribute("aria-pressed", state.must); render(); });
    const favBtnF = $("#f-fav");
    favBtnF.setAttribute("aria-pressed", state.fav);
    favBtnF.addEventListener("click", () => { state.fav = !state.fav; favBtnF.setAttribute("aria-pressed", state.fav); render(); });
    document.addEventListener("favs-changed", () => { updFav(); if (state.fav) render(); });
    const updFav = () => { const n = favs.all().size; $("#fav-count").textContent = n; $("#share-favs").disabled = !n; };
    updFav();
    $("#share-favs").addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}?llista=${[...favs.all()].join(",")}`;
      try { await navigator.clipboard.writeText(url); $("#share-msg").textContent = "Enllaç copiat! Envia'l al grup."; }
      catch { prompt("Copia aquest enllaç:", url); }
    });
    if (state.shared) {
      $("#shared-bar").hidden = false;
      $("#shared-n").textContent = state.shared.size;
      $("#import-shared").addEventListener("click", () => { favs.addMany([...state.shared]); updFav(); $("#import-shared").textContent = "Afegides a la meva llista ✓"; $$("[data-fav]").forEach((x) => x.setAttribute("aria-pressed", favs.has(x.dataset.fav))); });
      $("#clear-shared").addEventListener("click", () => { state.shared = null; $("#shared-bar").hidden = true; history.replaceState(null, "", location.pathname); render(); });
    }
    const authBtn = $("#f-auth");
    authBtn.setAttribute("aria-pressed", state.auth);
    authBtn.addEventListener("click", () => { state.auth = !state.auth; authBtn.setAttribute("aria-pressed", state.auth); render(); });
    $("#q").addEventListener("input", (e) => { state.q = e.target.value.trim().toLowerCase(); render(); });
    $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
    $("#maxh").addEventListener("change", (e) => { state.maxh = e.target.value; render(); });
    const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const grid = $("#grid");
    bindCards(grid, items);
    function render() {
      const q = norm(state.q);
      let list = items.filter((a) =>
        (!state.regio.size || state.regio.has(a.regio)) &&
        (!state.tipus.size || state.tipus.has(a.tipus)) &&
        (!state.cat.size || (a.categories || []).some((c) => state.cat.has(c))) &&
        (!state.must || a.imprescindible) &&
        (!state.auth || a.autentic) &&
        (!state.fav || favs.has(a.id)) &&
        (!state.shared || state.shared.has(a.id)) &&
        (!state.maxh || (a.hores_des_de_dakar ?? 99) <= Number(state.maxh)) &&
        (!q || norm(`${a.nom} ${a.resum} ${a.descripcio} ${a.pel_teu_compte || ""} ${REGIONS[a.regio]}`).includes(q)));
      const s = state.sort;
      if (s === "distancia") list.sort((a, b) => (a.hores_des_de_dakar ?? 99) - (b.hores_des_de_dakar ?? 99));
      else if (s === "preu") list.sort((a, b) => (a.nivell_preu ?? 9) - (b.nivell_preu ?? 9));
      else if (s === "nom") list.sort((a, b) => a.nom.localeCompare(b.nom, "ca"));
      else list.sort((a, b) => (b.imprescindible - a.imprescindible) || ((a.tipus !== "activitat") - (b.tipus !== "activitat")));
      $("#count").textContent = `${list.length} ${list.length === 1 ? "resultat" : "resultats"}`;
      grid.innerHTML = list.length ? list.map(cardHTML).join("") : `<div class="empty">Cap resultat amb aquests filtres.</div>`;
    }
    render();
    $("#reset").addEventListener("click", () => {
      state.regio.clear(); state.tipus.clear(); state.cat.clear(); state.must = false; state.auth = false; state.fav = false; state.q = ""; state.maxh = "";
      $("#q").value = ""; $("#maxh").value = "";
      $$(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      render();
    });
  }

  async function pageRegions() {
    const [regions, items] = await Promise.all([load("regions"), load("activitats")]);
    setRegionImgs(regions);
    $("#toc").innerHTML = regions.map((r) => `<a class="chip" href="#${r.id}">${esc(r.nom)}</a>`).join("");
    $("#regions").innerHTML = regions.map((r) => {
      const its = items.filter((a) => a.regio === r.id);
      const acts = its.filter((a) => a.tipus === "activitat");
      const img = r.imatge;
      return `
        <section class="region" id="${r.id}" style="scroll-margin-top:80px">
          <div class="region-img">${img ? `<img src="${esc(img.src)}" alt="${esc(r.nom)}" loading="lazy"><span class="img-credit">${credit(img)}</span>` : ""}</div>
          <div>
            <span class="label">${esc(r.etiqueta || "")}</span>
            <h2>${esc(r.nom)}</h2>
            ${r.descripcio.split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join("")}
            <dl class="kv">
              <dt>${icon("directions_car")}Des de Dakar</dt><dd>${esc(r.com_arribar)}</dd>
              <dt>${icon("calendar_month")}Dies</dt><dd>${esc(r.dies)}</dd>
              <dt>${icon("thumb_up")}Ideal per a</dt><dd>${esc(r.ideal)}</dd>
            </dl>
            <ul class="region-list">${acts.map((a) => `<li><a href="cataleg.html#a=${encodeURIComponent(a.id)}">${a.imprescindible ? "★ " : ""}${esc(a.nom)}</a></li>`).join("")}</ul>
            <div class="btn-row"><a class="btn btn-tonal" href="cataleg.html?regio=${r.id}">${icon("grid_view")} Veure les ${its.length} fitxes</a></div>
          </div>
        </section>`;
    }).join("");
  }

  async function pageItinerari() {
    const [its, items] = await Promise.all([load("itineraris"), load("activitats")]);
    const byId = Object.fromEntries(items.map((a) => [a.id, a]));
    const tabs = $("#tabs"), body = $("#itinerary");
    const RITME = { tranquil: "Ritme tranquil", moderat: "Ritme moderat", intens: "Ritme intens" };
    tabs.innerHTML = its.map((it, i) => `<button class="chip" data-i="${i}" aria-pressed="${i === 0}">${esc(it.nom.split(":")[0])}</button>`).join("");
    let map;
    const show = (i) => {
      const it = its[i];
      $$(".chip", tabs).forEach((c) => c.setAttribute("aria-pressed", c.dataset.i == i));
      body.innerHTML = `
        <h2>${esc(it.nom)}</h2>
        <p class="lead">${esc(it.resum)}</p>
        <div class="facts">
          ${it.ritme ? `<div class="fact"><div class="label">${icon("speed")}Ritme</div><div>${esc(RITME[it.ritme] || it.ritme)}</div></div>` : ""}
          ${it.km_aprox ? `<div class="fact"><div class="label">${icon("route")}Distància</div><div>≈${Number(it.km_aprox).toLocaleString("ca")} km</div></div>` : ""}
          <div class="fact"><div class="label">${icon("calendar_month")}Dates</div><div>27 des. – 4 gen. (9 dies)</div></div>
        </div>
        <div class="callout green"><strong>${icon("group")} Per a qui:</strong> ${esc(it.per_a_qui)}<br><strong>${icon("route")} Ruta:</strong> ${esc(it.ruta)}<br><strong>${icon("directions_car")} Transport:</strong> ${esc(it.transport)} <a href="cotxe.html#calc" data-need-link>Calcula si el límit de km del lloguer us arriba →</a></div>
        <div class="map" id="it-map" style="height:360px;margin-bottom:var(--s-lg)"></div>
        <div class="timeline">${it.dies.map((d) => `
          <article class="day">
            <div class="when">${esc(d.data)}</div>
            <h3>${esc(d.titol)}</h3>
            <ul>${d.plans.map((p) => `<li>${esc(p.text)}${p.id && byId[p.id] ? ` <a href="cataleg.html#a=${encodeURIComponent(p.id)}" title="${esc(byId[p.id].nom)}">${icon("arrow_outward")}fitxa</a>` : ""}</li>`).join("")}</ul>
            ${d.transport ? `<div class="sleep">${icon("directions_car")} ${esc(d.transport)}</div>` : ""}
            ${d.dormir ? `<div class="sleep">${icon("bed")} ${esc(d.dormir)}</div>` : ""}
          </article>`).join("")}
        </div>
        ${it.notes?.length ? `<div class="callout"><strong>${icon("info")} Notes i alternatives</strong><ul>${it.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>` : ""}
        ${it.fonts?.length ? `<p class="muted" style="font-size:13px">Fonts: ${it.fonts.map((f) => `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nom)}</a>`).join(" · ")}</p>` : ""}`;
      if (window.L) {
        if (map) map.remove();
        map = L.map("it-map", { scrollWheelZoom: false });
        tiles(map);
        const pts = [];
        it.dies.forEach((d, di) => d.plans.forEach((p) => {
          const a = byId[p.id]; if (!a?.lat) return;
          pts.push([a.lat, a.lng]);
          L.circleMarker([a.lat, a.lng], { radius: 7, color: "#fff", weight: 1.5, fillColor: REGION_COLOR[a.regio] || "#9A4A1C", fillOpacity: 1 })
            .addTo(map).bindPopup(`<b>Dia ${di + 1}</b> · ${esc(a.nom)}`);
        }));
        const uniq = pts.filter((p, k) => k === 0 || p[0] !== pts[k - 1][0] || p[1] !== pts[k - 1][1]);
        if (uniq.length > 1) L.polyline(uniq, { color: "#9A4A1C", weight: 2, opacity: .6, dashArray: "6 6" }).addTo(map);
        fit(map, pts);
      }
      history.replaceState(null, "", `#${it.id}`);
    };
    tabs.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) show(+b.dataset.i); });
    const fromHash = its.findIndex((it) => `#${it.id}` === location.hash);
    show(fromHash >= 0 ? fromHash : 0);
  }

  const EV_CAT = { "cap-d-any": ["Cap d'Any", "celebration"], lluita: ["Lluita", "sports_kabaddi"], futbol: ["Futbol", "sports_soccer"], musica: ["Música", "music_note"], festival: ["Festival", "festival"], religios: ["Religiós", "church"], mercat: ["Mercat", "storefront"], art: ["Art", "palette"], esport: ["Esport", "directions_run"] };
  const CONF = { confirmat: ["Confirmat", "badge-auth"], habitual: ["Cada any", "badge-type"], possible: ["Possible", "badge-region"] };
  const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("ca", { weekday: "short", day: "numeric", month: "short" });
  function eventHTML(e) {
    const [cat, ic] = EV_CAT[e.categoria] || [e.categoria, "event"];
    const [cl, ccl] = CONF[e.confirmacio] || [e.confirmacio, "badge-type"];
    const dates = e.data_fi && e.data_fi !== e.data_inici ? `${fmtDate(e.data_inici)} – ${fmtDate(e.data_fi)}` : e.data_inici ? fmtDate(e.data_inici) : "";
    return `
      <article class="media event" id="${esc(e.id)}" style="scroll-margin-top:90px">
        <div class="ico">${icon(ic)}</div>
        <div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"><span class="badge ${ccl}">${esc(cl)}</span><span class="badge badge-region">${esc(REGIONS[e.regio] || e.regio || "")}</span></div>
          <h4>${esc(e.titol)}</h4>
          <div class="by">${icon("event")} ${esc(dates)} · ${esc(cat)}${e.lloc ? ` · ${esc(e.lloc)}` : ""}</div>
          <p>${esc(e.descripcio)}</p>
          ${e.com_anar ? `<p class="tr">${icon("confirmation_number")} ${esc(e.com_anar)}</p>` : ""}
          ${e.fonts?.length ? `<div class="src">${e.fonts.map((f) => `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nom)}</a>`).join(" · ")}</div>` : ""}
        </div>
      </article>`;
  }

  async function pageAgenda() {
    const ev = await load("esdeveniments");
    const filt = $("#ev-filters"), list = $("#ev-list");
    const cats = [...new Set(ev.map((e) => e.categoria))];
    const sel = new Set();
    filt.innerHTML = cats.map((c) => `<button class="chip" data-k="${c}" aria-pressed="false">${icon((EV_CAT[c] || [0, "event"])[1])} ${esc((EV_CAT[c] || [c])[0])}</button>`).join("");
    const render = () => {
      const l = ev.filter((e) => !sel.size || sel.has(e.categoria));
      const span = (e) => e.data_inici && e.data_fi ? (new Date(e.data_fi) - new Date(e.data_inici)) / 864e5 : 0;
      const conf = l.filter((e) => e.confirmacio === "confirmat");
      const days = {};
      l.filter((e) => e.confirmacio !== "confirmat").forEach((e) => {
        const k = !e.data_inici || span(e) >= 4 ? "zz" : (e.data_inici < "2026-12-27" ? "2026-12-27" : e.data_inici);
        (days[k] ??= []).push(e);
      });
      const title = (k) => k === "zz" ? "Durant tot el viatge o diversos dies" : esc(new Date(k + "T12:00:00").toLocaleDateString("ca", { weekday: "long", day: "numeric", month: "long" }));
      list.innerHTML = (conf.length ? `<h3 style="margin-top:var(--s-xl)">${icon("verified")} Confirmats</h3><div class="media-list">${conf.map(eventHTML).join("")}</div>` : "") +
        Object.keys(days).sort().map((k) => `
        <h3 style="margin-top:var(--s-xl)">${title(k)}</h3>
        <div class="media-list">${days[k].map(eventHTML).join("")}</div>`).join("") || `<div class="empty">Cap esdeveniment.</div>`;
    };
    filt.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (!b) return; sel.has(b.dataset.k) ? sel.delete(b.dataset.k) : sel.add(b.dataset.k); b.setAttribute("aria-pressed", sel.has(b.dataset.k)); render(); });
    render();
    if (window.L) {
      const map = L.map("ev-map", { scrollWheelZoom: false }); tiles(map);
      const pts = ev.filter((e) => e.lat && e.lng).map((e) => { L.circleMarker([e.lat, e.lng], { radius: 7, color: "#fff", weight: 1.5, fillColor: REGION_COLOR[e.regio] || "#9A4A1C", fillOpacity: 1 }).addTo(map).bindPopup(`<b>${esc(e.titol)}</b><br>${esc(e.data_inici || "")}`); return [e.lat, e.lng]; });
      fit(map, pts);
    }
  }

  async function pageConeix() {
    const data = await load("coneix");
    $("#toc").innerHTML = data.capitols.map((c) => `<a class="chip" href="#${c.id}">${icon(c.icona || "menu_book")} ${esc(c.titol)}</a>`).join("");
    $("#chapters").innerHTML = data.capitols.map((c) => {
      const L = c.llista;
      const isTimeline = L && L.items?.length && L.items.every((x) => !x.imatge && /^[\d.–\- sXVIaC]+$/.test(String(x.nom).trim().slice(0, 4)));
      let list = "";
      if (L?.items?.length) {
        list = isTimeline
          ? `<h3 style="margin-top:var(--s-lg)">${esc(L.titol)}</h3><ul class="timeline-list">${L.items.map((x) => `<li><b>${esc(x.nom)}</b><span>${esc(x.text)}</span></li>`).join("")}</ul>`
          : `<h3 style="margin-top:var(--s-lg)">${esc(L.titol)}</h3><div class="items">${L.items.map((x) => `
              <div class="item">${x.imatge ? `<img src="${esc(x.imatge.src)}" alt="${esc(x.nom)}" loading="lazy" title="${esc((x.imatge.autor || "") + " · " + (x.imatge.llicencia || ""))}">` : ""}
                <div class="item-body"><h4>${esc(x.nom)}</h4><p>${esc(x.text)}</p>${x.on ? `<div class="where">${icon("location_on")} ${esc(x.on)}</div>` : ""}</div></div>`).join("")}</div>`;
      }
      return `
        <section class="chapter" id="${c.id}">
          <span class="label">${icon(c.icona || "menu_book")} Coneix el Senegal</span>
          <h2>${esc(c.titol)}</h2>
          ${c.subtitol ? `<p class="lead">${esc(c.subtitol)}</p>` : ""}
          <div class="chapter-grid">
            <div class="chapter-text">${c.paragrafs.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
            <aside class="chapter-aside">
              ${(c.imatges || []).slice(0, 2).map((im) => `<figure><img src="${esc(im.src)}" alt="${esc(c.titol)}" loading="lazy"><figcaption class="img-credit">${credit(im)}</figcaption></figure>`).join("")}
              ${c.punts_clau?.length ? `<div class="keypoints"><div class="label" style="color:inherit;margin-bottom:6px">Punts clau</div><ul>${c.punts_clau.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}
            </aside>
          </div>
          ${list}
          ${c.fonts?.length ? `<p class="muted" style="font-size:13px;margin-top:var(--s-md)">Fonts: ${c.fonts.map((f) => `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nom)}</a>`).join(" · ")}</p>` : ""}
        </section>`;
    }).join("");
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }

  async function pageCultura() {
    const d = await load("cultura");
    const src = (f) => f?.length ? `<div class="src">${f.map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.nom)}</a>`).join(" · ")}</div>` : "";
    $("#llibres").innerHTML = d.llibres.map((b, i) => `
      <article class="media" id="b-${i}" style="scroll-margin-top:90px"><div class="ico">${icon(b.genere === "guia" ? "travel_explore" : b.genere === "poesia" ? "history_edu" : "menu_book")}</div>
        <div><h4>${esc(b.titol)}</h4><div class="by">${esc(b.autor)}${b.any ? ` · ${b.any}` : ""}${b.genere ? ` · ${esc(b.genere)}` : ""}${b.titol_original && b.titol_original !== b.titol ? ` · <em>${esc(b.titol_original)}</em>` : ""}</div>
        <p>${esc(b.per_que)}</p>${b.traduccions ? `<div class="tr">${icon("translate")} ${esc(b.traduccions)}</div>` : ""}${src(b.fonts)}</div></article>`).join("");
    $("#pellicules").innerHTML = d.pellicules.map((p, i) => `
      <article class="media" id="f-${i}" style="scroll-margin-top:90px"><div class="ico">${icon(p.tipus === "sèrie" ? "live_tv" : p.tipus === "documental" ? "videocam" : "movie")}</div>
        <div><h4>${esc(p.titol)}</h4><div class="by">${esc(p.director)}${p.any ? ` · ${p.any}` : ""}${p.durada_min ? ` · ${p.durada_min} min` : ""}${p.tipus ? ` · ${esc(p.tipus)}` : ""}</div>
        <p>${esc(p.per_que)}</p>${p.on_veure ? `<div class="tr">${icon("play_circle")} ${esc(p.on_veure)}</div>` : ""}${src(p.fonts)}</div></article>`).join("");
    $("#musica").innerHTML = d.musica.map((m, i) => `
      <article class="media" id="m-${i}" style="scroll-margin-top:90px"><div class="ico">${icon("music_note")}</div>
        <div><h4>${esc(m.artista)}</h4><div class="by">${icon("play_arrow")} «${esc(m.tema)}»</div>
        <p>${esc(m.per_que)}</p>
        <div class="tr"><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(m.artista + " " + m.tema)}" target="_blank" rel="noopener">Escolta-ho a YouTube</a></div>${src(m.fonts)}</div></article>`).join("");
  }

  async function pagePractic() {
    $$("#checklist input").forEach((cb) => {
      cb.checked = store.get("chk-" + cb.dataset.k) === "1";
      cb.addEventListener("change", () => store.set("chk-" + cb.dataset.k, cb.checked ? "1" : "0"));
    });
    const d = await load("practic");
    $("#toc").innerHTML = [...d.seccions.map((s) => [s.id, s.titol]), ["calendari", "Calendari"], ["pressupost", "Pressupost"], ["plats", "Què menjar"], ["wolof", "Wolof bàsic"]]
      .map(([id, t]) => `<a class="chip" href="#${id}">${esc(t)}</a>`).join("");
    $("#clima").textContent = d.clima;
    $("#seccions").innerHTML = d.seccions.map((s) => `
      <article class="info" id="${s.id}" style="scroll-margin-top:80px"><h3>${icon(s.icona || "info")} ${esc(s.titol)}</h3>
        <ul>${s.punts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        ${s.fonts?.length ? `<div class="src">Fonts: ${s.fonts.map((f) => `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nom)}</a>`).join(" · ")}</div>` : ""}
      </article>`).join("");
    $("#cal").innerHTML = d.calendari.map((c) => `<tr><td style="white-space:nowrap"><strong>${esc(new Date(c.data + "T12:00:00").toLocaleDateString("ca", { weekday: "short", day: "numeric", month: "short" }))}</strong></td><td><strong>${esc(c.titol)}</strong><br><span class="muted">${esc(c.descripcio)}</span></td></tr>`).join("");
    $("#budget").innerHTML = d.pressupost.map((p) => `<tr><td>${esc(p.concepte)}</td><td>${esc(p.preu)}</td></tr>`).join("");
    $("#plats-grid").innerHTML = d.plats.map((p) => `
      <div class="item">${p.imatge ? `<img src="${esc(p.imatge.src)}" alt="${esc(p.nom)}" loading="lazy" title="${esc((p.imatge.autor || "") + " · " + (p.imatge.llicencia || ""))}">` : ""}
        <div class="item-body"><h4>${esc(p.nom)}</h4><p>${esc(p.descripcio)}</p></div></div>`).join("");
    $("#wolof-grid").innerHTML = d.wolof.map((w) => `<div class="phrase"><b>${esc(w.wolof)}</b>${esc(w.catala)}${w.pronuncia ? `<br><small>[${esc(w.pronuncia)}]</small>` : ""}</div>`).join("");
    await renderDirectori();
  }

  async function pageFonts() {
    const names = ["activitats", "practic", "cultura", "coneix", "regions", "itineraris", "esdeveniments", "hero", "ciutats", "directori", "aire_lliure", "compres_idioma", "curiositats", "cotxe"];
    const all = await Promise.all(names.map((n) => load(n).catch(() => null)));
    const links = new Map(), photos = new Map();
    const walk = (o) => {
      if (!o || typeof o !== "object") return;
      if (Array.isArray(o)) return o.forEach(walk);
      if (o.url && /^https?:/.test(o.url) && (o.nom !== undefined)) {
        try { const host = new URL(o.url).hostname.replace(/^www\./, ""); if (!links.has(o.url)) links.set(o.url, { nom: o.nom, host }); } catch { /* url invàlida */ }
      }
      if (o.src && o.font) photos.set(o.src, o);
      Object.values(o).forEach(walk);
    };
    all.forEach(walk);
    const byHost = {};
    links.forEach((v, url) => (byHost[v.host] ??= []).push({ url, nom: v.nom }));
    const hosts = Object.keys(byHost).sort((a, b) => byHost[b].length - byHost[a].length || a.localeCompare(b));
    $("#n-links").textContent = links.size;
    $("#n-hosts").textContent = hosts.length;
    $("#n-photos").textContent = photos.size;
    $("#links").innerHTML = hosts.map((h) => `
      <details class="info" style="padding:var(--s-md) var(--s-lg)"><summary><strong>${esc(h)}</strong> <span class="muted">(${byHost[h].length})</span></summary>
        <ul>${byHost[h].map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.nom || l.url)}</a></li>`).join("")}</ul></details>`).join("");
    $("#photos").innerHTML = [...photos.values()].map((p) => `<tr><td><img src="${esc(p.src)}" alt="" loading="lazy" style="width:72px;height:48px;object-fit:cover;border-radius:8px"></td><td>${esc(p.titol || "")}</td><td>${esc(p.autor || "")}</td><td><a href="${esc(p.font)}" target="_blank" rel="noopener">${esc(p.llicencia || "Commons")}</a></td></tr>`).join("");
  }

  /* ---------- Boot ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  document.addEventListener("DOMContentLoaded", () => {
    layout();
    const pages = { cotxe: pageCotxe, mapa: pageMapa, curiositats: pageCuriositats, guies: pageGuies, natura: pageNatura, compres: pageCompres, agenda: pageAgenda, index: pageIndex, cataleg: pageCataleg, regions: pageRegions, itinerari: pageItinerari, coneix: pageConeix, cultura: pageCultura, practic: pagePractic, fonts: pageFonts };
    const fn = pages[document.body.dataset.page];
    if (fn) fn().then(scrollToHash).catch((e) => {
      console.error(e);
      const m = document.querySelector("main");
      m?.insertAdjacentHTML("afterbegin", `<div class="container"><div class="callout warn">No s'han pogut carregar les dades (${esc(e.message)}). Si obres el fitxer en local, serveix la carpeta amb <code>python3 -m http.server</code>.</div></div>`);
    });
  });
})();
