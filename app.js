/* ===================================================================
   Blessed Family Healthcare Dashboard — app.js
   Vanilla JS, hash-based routing, localStorage persistence.
   No build step: safe to serve as-is from GitHub Pages.
   =================================================================== */

const STORAGE_KEY = "blessedFamilyData";

const FAMILIES = [
  { name: "Nindane", accent: "var(--fam-nindane)", tag: "Chart A", icon: "leaf" },
  { name: "Ninariya", accent: "var(--fam-ninariya)", tag: "Chart B", icon: "sun" },
  { name: "Prasad", accent: "var(--fam-prasad)", tag: "Chart C", icon: "mountain" },
  { name: "Sarsar", accent: "var(--fam-sarsar)", tag: "Chart D", icon: "wave" },
];

const ZONES = [
  { key: "Underweight", from: 10, to: 18.5, color: "var(--zone-under)" },
  { key: "Normal", from: 18.5, to: 25, color: "var(--zone-normal)" },
  { key: "Overweight", from: 25, to: 30, color: "var(--zone-over)" },
  { key: "Obese", from: 30, to: 40, color: "var(--zone-obese)" },
];

const GAUGE_MIN = 10;
const GAUGE_MAX = 40;

/* ---------------- data layer ---------------- */

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedEmpty();
    const parsed = JSON.parse(raw);
    // guard against missing families if the schema grows later
    FAMILIES.forEach((f) => {
      if (!Array.isArray(parsed[f.name])) parsed[f.name] = [];
    });
    return parsed;
  } catch (e) {
    console.error("Could not read saved data, starting fresh.", e);
    return seedEmpty();
  }
}

function seedEmpty() {
  const obj = {};
  FAMILIES.forEach((f) => (obj[f.name] = []));
  return obj;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let DATA = loadData();

/* ---------------- BMI logic ---------------- */

function feetToMeters(feet) {
  return feet * 0.3048;
}

function computeBMI(weightKg, heightFeet) {
  const m = feetToMeters(heightFeet);
  return weightKg / (m * m);
}

function categoryFor(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function colorForCategory(cat) {
  const z = ZONES.find((z) => z.key === cat);
  return z ? z.color : "var(--ink-soft)";
}

/* ---------------- routing ---------------- */

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  if (!hash) return { name: "home" };
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "family" && parts[1]) {
    return { name: "family", family: decodeURIComponent(parts[1]) };
  }
  return { name: "home" };
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);

/* ---------------- icons ----------------
   Small hand-drawn line icons, one per family (leaf / sun / mountain / wave —
   a bit of distinct personality for each) plus a few functional ones. All
   inline SVG so there's no icon-font dependency to load. */

const ICONS = {
  leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 5-13 13-14 0 9-4 13-13 14z"/><path d="M6.5 17.5C9 14 11.5 12 15 10"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 3v2.2M12 18.8V21M4.2 12H2.4M21.6 12h-1.8M5.8 5.8 4.4 4.4M19.6 19.6l-1.4-1.4M18.2 5.8l1.4-1.4M5.8 18.2l-1.4 1.4"/></svg>`,
  mountain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19 9.5 8l3.2 5 2-2.6L21 19H3z"/></svg>`,
  wave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0"/><path d="M3 15c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0"/></svg>`,
  personPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="8" r="3.2"/><path d="M4 20c.8-3.6 3.4-5.5 6-5.5s5.2 1.9 6 5.5"/><path d="M18 8v4M16 10h4"/></svg>`,
  table: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M9 9.5V19.5"/></svg>`,
  bars: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19V10M12 19V5M19 19v-6"/></svg>`,
  pulse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2-6 4 12 2-6h6"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7"/></svg>`,
  pulseLine: `<svg viewBox="0 0 400 80" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M0 40h60l15-28 20 56 15-40 10 20h30l15-30 20 60 15-38h190"/></svg>`,
};

function icon(name, extraClass = "") {
  return el("span", { class: `icon ${extraClass}`.trim(), html: ICONS[name] || "" });
}

/* ---------------- rendering ---------------- */

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const route = currentRoute();

  if (route.name === "family" && FAMILIES.some((f) => f.name === route.family)) {
    app.appendChild(renderFamilyPage(route.family));
  } else {
    app.appendChild(renderHome());
  }

  app.appendChild(
    el("footer", { class: "site-footer" }, "Blessed Family Healthcare Dashboard · data stays on this device")
  );
}

function renderHome() {
  const frag = document.createDocumentFragment();

  const masthead = el("div", { class: "masthead" }, [
    el("p", { class: "masthead__eyebrow" }, "Family Health Record"),
    el("h1", { class: "masthead__title" }, [
      "Welcome to ",
      el("br"),
      "Blessed Family ",
      el("em", {}, "Healthcare Dashboard"),
    ]),
    el(
      "p",
      { class: "home-lede" },
      "Four family charts, one shared record. Choose a family to log a member's height and weight and see their BMI plotted against the household."
    ),
    el("div", { class: "masthead__pulse", html: ICONS.pulseLine }),
  ]);
  frag.appendChild(masthead);

  const wrap = el("div", { class: "wrap" });
  const grid = el("div", { class: "family-grid" });

  FAMILIES.forEach((fam, i) => {
    const count = DATA[fam.name]?.length || 0;
    const card = el(
      "button",
      {
        class: "family-card",
        style: `--accent: ${fam.accent}`,
        "data-index": String(i + 1).padStart(2, "0"),
        onclick: () => {
          location.hash = `#/family/${encodeURIComponent(fam.name)}`;
        },
      },
      [
        el("div", { class: "family-card__top" }, [
          el("span", { class: "family-card__icon" }, icon(fam.icon)),
          el("span", { class: "family-card__tab" }, fam.tag),
        ]),
        el("h2", { class: "family-card__name" }, fam.name),
        el("p", { class: "family-card__meta" }, [
          el("strong", {}, String(count)),
          count === 1 ? " member logged" : " members logged",
        ]),
      ]
    );
    grid.appendChild(card);
  });

  wrap.appendChild(grid);
  frag.appendChild(wrap);
  return frag;
}

function renderFamilyPage(familyName) {
  const fam = FAMILIES.find((f) => f.name === familyName);
  const frag = document.createDocumentFragment();

  const masthead = el("div", { class: "masthead" }, [
    el("a", { class: "back-link", href: "#/" }, "← All families"),
    el(
      "div",
      { style: "margin-top:16px;" },
      el("span", { class: "family-tag", style: `--accent:${fam.accent}` }, [
        icon(fam.icon),
        fam.tag,
      ])
    ),
    el("h1", { class: "masthead__title", style: "margin-top:8px;" }, `${fam.name} Family`),
  ]);
  frag.appendChild(masthead);

  const wrap = el("div", { class: "wrap" });

  // ---- entry form ----
  const nameInput = el("input", { id: "f-name", type: "text", placeholder: "Enter your name", autocomplete: "off" });
  const heightInput = el("input", { id: "f-height", type: "number", step: "0.1", min: "1", max: "9", placeholder: "Enter height in feet" });
  const weightInput = el("input", { id: "f-weight", type: "number", step: "0.1", min: "1", max: "400", placeholder: "Enter weight in kg" });
  const errorEl = el("p", { class: "form-error" }, "");

  const submit = () => {
    const name = nameInput.value.trim();
    const heightFeet = parseFloat(heightInput.value);
    const weightKg = parseFloat(weightInput.value);

    if (!name) return (errorEl.textContent = "Enter the member's name.");
    if (!heightFeet || heightFeet <= 0) return (errorEl.textContent = "Enter a valid height in feet, e.g. 5.8.");
    if (!weightKg || weightKg <= 0) return (errorEl.textContent = "Enter a valid weight in kg.");

    errorEl.textContent = "";
    const bmi = Math.round(computeBMI(weightKg, heightFeet) * 10) / 10;
    const category = categoryFor(bmi);

    DATA[fam.name].push({
      name,
      height: heightFeet,
      weight: weightKg,
      bmi,
      category,
      ts: Date.now(),
    });
    saveData(DATA);

    nameInput.value = "";
    heightInput.value = "";
    weightInput.value = "";
    render();
  };

  const form = el("div", { class: "panel", style: `--accent:${fam.accent}` }, [
    el("h2", { class: "panel__title" }, [icon("personPlus"), "Log a member"]),
    el("div", { class: "field-row" }, [
      el("div", { class: "field" }, [el("label", { for: "f-name" }, "Member name"), nameInput]),
      el("div", { class: "field" }, [el("label", { for: "f-height" }, "Height (feet)"), heightInput]),
      el("div", { class: "field" }, [el("label", { for: "f-weight" }, "Weight (kg)"), weightInput]),
      el("button", { class: "btn-primary", style: `--accent:${fam.accent}`, onclick: submit }, "Calculate BMI"),
    ]),
    errorEl,
  ]);
  wrap.appendChild(form);

  const entries = DATA[fam.name] || [];

  // ---- most recent result, with signature gauge ----
  if (entries.length) {
    const latest = entries[entries.length - 1];
    form.appendChild(renderResultCard(latest));
  }

  // ---- members table ----
  const tablePanel = el("div", { class: "panel" }, [
    el("h2", { class: "panel__title" }, [icon("table"), "Members", el("span", { class: "n" }, `${entries.length} logged`)]),
  ]);

  if (!entries.length) {
    tablePanel.appendChild(el("p", { class: "empty-note" }, "No one logged yet — add the first member above."));
  } else {
    const tableWrap = el("div", { class: "table-wrap" });
    const table = el("table", { class: "members" });
    const thead = el("thead", {}, el("tr", {}, [
      el("th", {}, "Name"),
      el("th", {}, "Height (ft)"),
      el("th", {}, "Weight (kg)"),
      el("th", {}, "BMI"),
      el("th", {}, "Category"),
      el("th", {}, ""),
    ]));
    const tbody = el("tbody");
    entries
      .slice()
      .reverse()
      .forEach((entry) => {
        const realIndex = entries.indexOf(entry);
        const tr = el("tr", {}, [
          el("td", {}, entry.name),
          el("td", {}, String(entry.height)),
          el("td", {}, String(entry.weight)),
          el("td", { class: "bmi-figure" }, String(entry.bmi)),
          el("td", {}, el("span", { class: "category-pill", style: `background:${colorForCategory(entry.category)}` }, entry.category)),
          el(
            "td",
            {},
            el("button", {
              class: "row-remove",
              title: "Remove entry",
              onclick: () => {
                DATA[fam.name].splice(realIndex, 1);
                saveData(DATA);
                render();
              },
            }, [icon("trash"), "Remove"])
          ),
        ]);
        tbody.appendChild(tr);
      });
    table.appendChild(thead);
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    tablePanel.appendChild(tableWrap);
  }
  wrap.appendChild(tablePanel);

  // ---- bar chart ----
  const chartPanel = el("div", { class: "panel" }, [
    el("h2", { class: "panel__title" }, [icon("bars"), "BMI distribution"]),
  ]);
  if (!entries.length) {
    chartPanel.appendChild(el("p", { class: "empty-note" }, "Chart will appear once a member is logged."));
  } else {
    chartPanel.appendChild(renderBarChart(entries));
    const legend = el("div", { class: "legend" });
    ZONES.forEach((z) => {
      legend.appendChild(
        el("div", { class: "legend__item" }, [
          el("span", { class: "legend__swatch", style: `background:${z.color}` }),
          `${z.key}`,
        ])
      );
    });
    chartPanel.appendChild(legend);
  }
  wrap.appendChild(chartPanel);

  frag.appendChild(wrap);
  return frag;
}

function renderResultCard(entry) {
  const pct = Math.max(0, Math.min(100, ((entry.bmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100));

  const track = el("div", { class: "gauge__track" });
  ZONES.forEach((z) => {
    const width = ((Math.min(z.to, GAUGE_MAX) - Math.max(z.from, GAUGE_MIN)) / (GAUGE_MAX - GAUGE_MIN)) * 100;
    track.appendChild(el("div", { class: "gauge__seg", style: `width:${width}%; background:${z.color};` }));
  });

  const gauge = el("div", { class: "gauge" }, [
    track,
    el("div", { class: "gauge__marker", style: `left:${pct}%;` }),
    el("div", { class: "gauge__labels" }, [
      el("span", {}, String(GAUGE_MIN)),
      el("span", {}, "18.5"),
      el("span", {}, "25"),
      el("span", {}, "30"),
      el("span", {}, String(GAUGE_MAX)),
    ]),
  ]);

  return el("div", { class: "result-card" }, [
    el("div", { class: "result-card__head" }, [
      el("span", { class: "result-card__name" }, entry.name),
      el("span", { class: "result-card__bmi-wrap" }, [
        icon("pulse", "result-card__pulse"),
        el("span", { class: "result-card__bmi" }, String(entry.bmi)),
      ]),
      el("span", { class: "result-card__category", style: `background:${colorForCategory(entry.category)}` }, entry.category),
    ]),
    gauge,
  ]);
}

function renderBarChart(entries) {
  const maxBmi = Math.max(GAUGE_MAX, ...entries.map((e) => e.bmi));
  const bars = el("div", { class: "bars" });
  entries.forEach((e) => {
    const heightPct = Math.max(4, Math.min(100, (e.bmi / maxBmi) * 100));
    bars.appendChild(
      el("div", { class: "bar-col" }, [
        el("span", { class: "bar-col__value" }, String(e.bmi)),
        el("div", { class: "bar-col__bar", style: `height:${heightPct}%; background:${colorForCategory(e.category)};` }),
        el("span", { class: "bar-col__label", title: e.name }, e.name),
      ])
    );
  });
  return bars;
}
