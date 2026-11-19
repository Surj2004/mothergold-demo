"use strict";

// EDITABLE DAILY OVERRIDE: use Dubai date (YYYY-MM-DD). Supply spot USD per
// troy ounce, a 24K AED/g board rate, or both. When only a board rate is set,
// the USD price is explicitly marked as an implied equivalent, not spot.
const DAILY_OVERRIDE = { date: "", aedPerGram24: null, spotUsd: null };
// Local testing only. A browser key is readable by visitors. In production,
// keep the key server-side and set DAILY_ENDPOINT to your shared WordPress feed.
const GOLD_API_KEY = "YOUR_GOLDAPI_KEY";
const DAILY_ENDPOINT = ""; // e.g. "/wp-json/mother-gold/v1/rate"
const GOLD_API_URL = "https://www.goldapi.io/api/price/XAU/USD";

(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const motion = matchMedia("(prefers-reduced-motion: no-preference)");
  const small = matchMedia("(max-width: 850px)");
  const mobileHero = matchMedia("(max-width: 560px)");
  document.documentElement.classList.add("enhanced");
  if (motion.matches && !location.hash) document.documentElement.classList.add("motion");
  const header = $("#site-header");
  const menu = $("#primary-nav");
  const toggle = $(".nav-toggle");
  const serviceMenu = $(".nav-dropdown");
  function setMenu(open, restoreFocus = false) {
    toggle.setAttribute("aria-expanded", String(open));
    menu.toggleAttribute("data-open", open);
    if (!open) serviceMenu.open = false;
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  small.addEventListener("change", () => setMenu(false));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || $("#info-dialog").open) return;
    if (serviceMenu.open) {
      serviceMenu.open = false;
      $("summary", serviceMenu).focus();
    } else if (small.matches && menu.hasAttribute("data-open")) setMenu(false, true);
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("#primary-nav a, .nav-inner .brand");
    if (link) {
      setMenu(false);
      const section = document.getElementById(link.hash.slice(1));
      if (section) {
        section.setAttribute("tabindex", "-1");
        section.focus({ preventScroll: true });
      }
    } else if (!header.contains(event.target)) {
      const restore = small.matches && menu.contains(document.activeElement);
      setMenu(false, restore);
    }
  });
  let scrollFrame = 0;
  function scrollState() {
    scrollFrame = 0;
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 30);
    if (motion.matches && !mobileHero.matches && y < 1100) {
      $(".hero-image").style.setProperty("--drift", `${Math.min(y * 0.075, 32)}px`);
    }
  }
  addEventListener("scroll", () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollState); }, { passive: true });
  scrollState();

  const number = new Intl.NumberFormat("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function countTo(element, value, format = number.format, start = 0) {
    if (!motion.matches) { element.textContent = format(value); return; }
    const at = performance.now();
    function tick(now) {
      const t = Math.min((now - at) / 440, 1);
      element.textContent = format(start + (value - start) * (1 - (1 - t) ** 3));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        if (entry.target.dataset.counter) countTo(entry.target, Number(entry.target.dataset.counter), (n) => String(Math.round(n)));
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15 });
    $$(".reveal,[data-counter]").forEach((element) => observer.observe(element));
  }

  const countries = {
    Ghana: ["377.4 194.6", "West Africa"],
    "Sierra Leone": ["355.7 193.2", "West Africa"],
    Angola: ["415.9 242.9", "Southern Africa"],
    Tanzania: ["451.8 228.6", "East Africa"],
    UAE: ["490.9 153.1", "Dubai trading hub and showroom"],
    India: ["540.6 158.9", "South Asia"]
  };
  $$("[data-country]").forEach((button) => button.addEventListener("click", () => {
    $$("[data-country]").forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
    const country = button.dataset.country;
    const [coordinates, text] = countries[country];
    $("#map-focus").setAttribute("transform", `translate(${coordinates})`);
    $("#map-caption").textContent = `${country} · ${text}`;
  }));

  const serviceDetails = {
    "Ethical Mining": "Speak with us about gold and diamond sourcing, the material you need and the origin records available for your enquiry.",
    "Global Trading": "Share the metal or stone, volume and destination. We can discuss product availability, documentation, payment terms and delivery before any trade is agreed.",
    "Gemstone Lab": "For diamond cutting or grading, tell us the number of stones, their current condition and what you want to achieve. Ask which grading reports are available.",
    "Precious Metals": "Enquire about gold bullion, bars and nuggets, or discuss refining. Share the weight, preferred specifications and whether you’d like to visit the Dubai showroom."
  };
  const dialog = $("#info-dialog");
  const dialogCta = $("#dialog-cta");
  let dialogTrigger = null;
  let activeService = "";
  $$("[data-service],[data-info]").forEach((link) => link.addEventListener("click", (event) => {
    if (typeof dialog.showModal !== "function") return;
    event.preventDefault();
    dialogTrigger = link;
    activeService = link.dataset.service || "";
    const title = activeService || link.dataset.info;
    const social = ["Facebook", "Instagram", "LinkedIn"].includes(title);
    $("#dialog-kicker").textContent = activeService ? "OUR SERVICES" : (social ? "SOCIAL PROFILE" : "POLICIES");
    $("#dialog-title").textContent = title;
    $("#dialog-copy").textContent = activeService ? serviceDetails[activeService] : social
      ? "The official profile link has not yet been confirmed. You can reach the team directly using the contact details below."
      : "The approved policy text has not been added to this demo. Contact our team if you need the current policy.";
    dialog.showModal();
  }));
  dialog.addEventListener("close", () => dialogTrigger?.focus({ preventScroll: true }));
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialogCta.addEventListener("click", () => {
    if (activeService) {
      $("#service").value = activeService;
      $("#service").dispatchEvent(new Event("change"));
    }
    dialogTrigger = null;
    dialog.close();
    $("#name").focus({ preventScroll: true });
  });

  const form = $("#inquiry");
  const status = $("#form-status");
  const draft = $("#email-draft");
  $("button[type=submit]", form).disabled = false;
  const fields = ["name", "email", "phone", "service", "message"].map((id) => document.getElementById(id));
  function check(field) {
    const value = field.value.trim();
    const friendly = { name: "Please enter your name.", email: "Please enter a valid email address.", service: "Please choose a service.", message: "Please tell us a little about your enquiry." };
    let error = "";
    if ((field.required && !value) || (field.type === "email" && !field.validity.valid)) error = friendly[field.id];
    if (field.type === "tel" && value && (!/^[+\d ().-]+$/.test(value) || value.replace(/\D/g, "").length < 7 || value.replace(/\D/g, "").length > 15)) error = "Enter a phone number with 7 to 15 digits, including the country code if applicable.";
    field.setAttribute("aria-invalid", String(Boolean(error)));
    document.getElementById(`${field.id}-error`).textContent = error;
    return !error;
  }
  fields.forEach((field) => ["input", "change"].forEach((name) => field.addEventListener(name, () => {
    if (field.hasAttribute("aria-invalid")) check(field);
    if (!draft.hidden) { draft.hidden = true; draft.removeAttribute("href"); status.textContent = ""; }
  })));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const first = fields.filter((field) => !check(field))[0];
    if (first) {
      status.textContent = "Please review the highlighted fields.";
      status.className = "form-status is-error";
      first.focus();
      return;
    }
    const [name, email, phone, service, message] = fields.map((field) => field.value.trim());
    const body = `Name: ${name}\r\nEmail: ${email}\r\nPhone: ${phone || "Not provided"}\r\nService: ${service}\r\n\r\n${message}`;
    draft.href = `mailto:info@mother-gold.com?subject=${encodeURIComponent(`Mother Gold enquiry: ${service}`)}&body=${encodeURIComponent(body)}`;
    draft.hidden = false;
    status.textContent = "Your email draft is ready. Open it in your email app to review and send. Nothing has been sent yet.";
    status.className = "form-status is-success";
  });

  // DAILY RATE MODULE: no real data is manufactured or mixed with demo history.
  const ZONE = "Asia/Dubai";
  const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
  const longDay = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, dateStyle: "full" });
  const shortDay = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, day: "2-digit", month: "short" });
  const updateTime = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const STORAGE_KEY = "mother-gold-daily-v1";
  const AED_PER_USD = 3.6725;
  const GRAMS_PER_TROY_OZ = 31.1035;
  const toAed = (usd) => usd / GRAMS_PER_TROY_OZ * AED_PER_USD;
  const toUsd = (aed) => aed / AED_PER_USD * GRAMS_PER_TROY_OZ;
  const atDay = (key) => new Date(`${key}T00:00:00+04:00`);
  const shiftDay = (key, offset) => dayKey.format(atDay(key).getTime() + offset * 86400000);
  const positive = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;
  const validRow = (r) => r && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && Number.isFinite(atDay(r.date).getTime()) && positive(r.spotUsd) && positive(r.aed24)
    && ["api", "manual"].includes(r.source) && Number.isFinite(Date.parse(r.updatedAt));
  let memory = { rows: [], attempt: null };
  function readStore() {
    try {
      const saved = window.motherGoldRateCache?.read(STORAGE_KEY);
      if (saved && Array.isArray(saved.rows)) memory = { rows: saved.rows.filter(validRow), attempt: saved.attempt };
    } catch { /* Embedded previews or privacy mode may not grant storage. */ }
    return memory;
  }
  function writeStore(value) {
    memory = value;
    try { window.motherGoldRateCache?.write(STORAGE_KEY, value); } catch { /* In-memory fallback. */ }
  }
  function recordRows(rows) {
    const store = readStore();
    const byDate = new Map(store.rows.map((r) => [r.date, r]));
    for (const row of rows) if (validRow(row)) byDate.set(row.date, row);
    store.rows = [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 21);
    writeStore(store);
    return store.rows;
  }

  // Isolated data adapter: replace this with a server-side WordPress call.
  // Shared endpoint returns { current: row | null, history: [row, ...] }.
  async function fetchDailyGoldRate(today) {
    const headers = { Accept: "application/json" };
    if (!DAILY_ENDPOINT) headers["x-access-token"] = GOLD_API_KEY;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    try {
      const result = await fetch(DAILY_ENDPOINT || GOLD_API_URL, { headers, signal: controller.signal, cache: "no-store", credentials: "omit" });
      if (!result.ok) throw new Error("Price provider unavailable");
      const payload = await result.json();
      if (DAILY_ENDPOINT) return [payload.current, ...(Array.isArray(payload.history) ? payload.history : [])].filter(validRow);
      if (!positive(payload.price)) throw new Error("Invalid gold price");
      const quoteDate = payload.datetime ? new Date(payload.datetime) : positive(payload.timestamp) ? new Date(payload.timestamp * 1000) : null;
      const hasQuoteDate = quoteDate && Number.isFinite(quoteDate.getTime());
      const date = hasQuoteDate ? dayKey.format(quoteDate) : today;
      const updatedAt = hasQuoteDate ? quoteDate.toISOString() : new Date().toISOString();
      return [{ date, updatedAt, source: "api", spotUsd: payload.price, aed24: toAed(payload.price) }];
    } finally { clearTimeout(timeout); }
  }
  function manualRow(today) {
    if (DAILY_OVERRIDE.date !== today) return null;
    const hasAed = positive(DAILY_OVERRIDE.aedPerGram24);
    const hasSpot = positive(DAILY_OVERRIDE.spotUsd);
    if (!hasAed && !hasSpot) return null;
    const aed24 = hasAed ? DAILY_OVERRIDE.aedPerGram24 : toAed(DAILY_OVERRIDE.spotUsd);
    const spotUsd = hasSpot ? DAILY_OVERRIDE.spotUsd : toUsd(aed24);
    const prior = readStore().rows.find((r) => r.date === today && r.source === "manual");
    const same = prior && prior.aed24 === aed24 && prior.spotUsd === spotUsd && Boolean(prior.implied) === !hasSpot && Boolean(prior.board) === hasAed;
    return { date: today, aed24, spotUsd, updatedAt: same ? prior.updatedAt : new Date().toISOString(), source: "manual", implied: !hasSpot, board: hasAed };
  }
  function sampleRows(today) {
    return [3084, 3098, 3089, 3120, 3107, 3142, 3160].map((spotUsd, index) => {
      const date = shiftDay(today, index - 6);
      return { date, spotUsd, aed24: toAed(spotUsd), updatedAt: `${date}T09:00:00+04:00`, source: "demo" };
    });
  }
  function drawHistory(points) {
    const svg = $("#rate-chart");
    const chartData = points.filter(({ row }) => row).map(({ row }) => row.aed24);
    const min = Math.min(...chartData) - 0.5;
    const max = Math.max(...chartData) + 0.5;
    const y = (price) => 113 - (price - min) / (max - min) * 90;
    const x = (index) => 8 + index * 404 / 6;
    const ns = "http://www.w3.org/2000/svg";
    function draw(tag, attrs, parent = svg) {
      const node = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
      parent.append(node);
      return node;
    }
    svg.replaceChildren();
    const fill = draw("linearGradient", { id: "history-fill", x2: "0%", y2: "100%" }, draw("defs", {}));
    draw("stop", { offset: "0%", "stop-color": "#d7ba76", "stop-opacity": ".28" }, fill);
    draw("stop", { offset: "100%", "stop-color": "#d7ba76", "stop-opacity": "0" }, fill);
    [22, 58, 95, 126].forEach((line) => draw("path", { d: `M0 ${line} H420`, stroke: "#413623", "stroke-width": "1", "stroke-dasharray": "3 5" }));
    let segment = [];
    function endSegment() {
      if (segment.length > 1) {
        const line = `M${segment.map(([a, b]) => `${a} ${b}`).join(" L")}`;
        draw("path", { d: `${line} L${segment.at(-1)[0]} 126 L${segment[0][0]} 126 Z`, fill: "url(#history-fill)" });
        draw("path", { d: line, stroke: "#e6c766", "stroke-width": "2", fill: "none", "vector-effect": "non-scaling-stroke", "stroke-linejoin": "round" });
      }
      segment = [];
    }
    points.forEach(({ row }, index) => {
      if (!row) endSegment();
      else segment.push([x(index), y(row.aed24)]);
    });
    endSegment();
    const body = $("#history-body");
    body.replaceChildren();
    for (const [index, { date, row }] of points.entries()) {
      if (row) draw("circle", { cx: x(index), cy: y(row.aed24), r: index === 6 ? 4 : 2.5, fill: "#f4d98c" });
      const tr = body.insertRow();
      tr.insertCell().textContent = shortDay.format(atDay(date));
      tr.insertCell().textContent = row ? number.format(row.aed24) : "Not recorded";
    }
    $("#chart-start").textContent = shortDay.format(atDay(points[0].date));
    $("#chart-end").textContent = shortDay.format(atDay(points.at(-1).date));
  }
  function render(today, current, rows) {
    const label = current.source === "demo" ? "Demo data" : current.date !== today ? `Last saved · ${shortDay.format(atDay(current.date))}`
      : current.source === "manual" ? (current.board ? "Manual board rate" : "Manual rate") : "Daily snapshot";
    $$("[data-source]").forEach((el) => { el.textContent = label; });
    $$("[data-day]").forEach((el) => { el.textContent = longDay.format(atDay(today)); el.dateTime = today; });
    const values = { spot: current.spotUsd, 24: current.aed24, 22: current.aed24 * .9167, 21: current.aed24 * .875, 18: current.aed24 * .75 };
    $$(".spot-label").forEach((el) => { el.textContent = current.implied ? "IMPLIED EQUIVALENT · USD / TROY OZ" : "GOLD SPOT · USD / TROY OZ"; });
    $(".strip-values>div:last-child>small").firstChild.textContent = current.implied ? "IMPLIED " : "SPOT ";
    $$("[data-rate]").forEach((el) => {
      const value = values[el.dataset.rate];
      const start = Number(el.textContent.replaceAll(",", ""));
      if (Number.isFinite(start) && Math.abs(start - value) > .005) countTo(el, value, number.format, start);
      else el.textContent = number.format(value);
    });
    $("#rate-updated").textContent = `Updated: ${updateTime.format(new Date(current.updatedAt))} Dubai${current.source === "demo" ? " (sample)" : ""}`;
    const previous = rows.find((row) => row.date === shiftDay(current.date, -1) && Boolean(row.board) === Boolean(current.board));
    const change = $("#rate-change");
    if (previous) {
      const diff = Math.round((current.aed24 - previous.aed24) * 100) / 100;
      const pct = (current.aed24 / previous.aed24 - 1) * 100;
      change.className = `rate-change${diff > 0 ? " up" : diff < 0 ? " down" : ""}`;
      change.textContent = `${diff > 0 ? "↑ +" : diff < 0 ? "↓ −" : "↔ "}${number.format(Math.abs(diff))} AED/g (${diff > 0 ? "+" : diff < 0 ? "−" : ""}${number.format(Math.abs(pct))}%) vs previous day · 24K`;
    } else {
      change.className = "rate-change";
      change.textContent = "No comparable previous-day rate recorded";
    }
    const points = Array.from({ length: 7 }, (_, index) => {
      const date = shiftDay(today, index - 6);
      return { date, row: rows.find((row) => row.date === date) };
    });
    drawHistory(points);
  }
  async function initRates() {
    const today = dayKey.format(new Date());
    $("#year").textContent = today.slice(0, 4);
    const fallback = sampleRows(today);
    const override = manualRow(today);
    function show(rows) {
      const known = rows.filter((r) => r.date <= today);
      const current = override || known.find((r) => r.date === today) || known[0];
      render(today, current || fallback.at(-1), current ? known : fallback);
    }
    if (override) { show(recordRows([override])); return; }
    show(readStore().rows);
    if (!DAILY_ENDPOINT && (!GOLD_API_KEY || GOLD_API_KEY === "YOUR_GOLDAPI_KEY")) return;
    async function refresh() {
      const store = readStore();
      if (store.attempt === today || store.rows.some((r) => r.date === today)) return;
      writeStore({ ...store, attempt: today });
      try { show(recordRows(await fetchDailyGoldRate(today))); } catch { /* The labelled saved/sample view stays visible. */ }
    }
    // Serialize same-origin browser tabs where Web Locks is available. Production
    // still requires one shared server cache for all visitors.
    if (navigator.locks?.request) {
      try { await navigator.locks.request(STORAGE_KEY, refresh); return; } catch { /* Fallback for restricted frames. */ }
    }
    await refresh();
  }
  initRates();
})();
