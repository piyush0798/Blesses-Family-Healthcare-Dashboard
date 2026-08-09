# Blessed Family Healthcare Dashboard

A small, static BMI tracker for four families — **Nindane, Ninariya, Prasad, Sarsar**. Pick a family, log a member's height and weight, and see their BMI plotted against the household. No build step, no backend — plain HTML/CSS/JS, data saved to the browser's `localStorage`.

## Folder structure

```
blessed-family-dashboard/
├── index.html      # single page shell, loads style.css + app.js
├── style.css        # design tokens, layout, components
├── app.js            # hash-router, BMI logic, rendering, localStorage
└── README.md
```

There's deliberately no `/family/*.html` per family — the app uses hash routing (`#/family/Nindane`) inside `index.html`, which is the simplest thing that works reliably on GitHub Pages without a server.

## BMI logic

Height is entered as **feet and inches separately** (e.g. 5 ft 11 in) to avoid the ambiguity of a single decimal field:

```
total_inches = (feet * 12) + inches
height_in_meters = total_inches * 0.0254
BMI = weight_kg / (height_in_meters ^ 2)
```

Categories: Underweight `< 18.5`, Normal `18.5–24.9`, Overweight `25–29.9`, Obese `30+`.

## Data storage

All entries live in `localStorage` under the key `blessedFamilyData`, structured as:

```json
{
  "Nindane": [{ "name": "Piyush", "heightFeet": 5, "heightInches": 11, "weight": 70, "bmi": 21.6, "category": "Normal", "ts": 1733740000000 }],
  "Ninariya": [],
  "Prasad": [],
  "Sarsar": []
}
```

This is per-browser, per-device — it won't sync across phones/laptops unless you later wire it to a real backend.

## Run it locally

No install needed — it's static files. Either:

- Open `index.html` directly in a browser, **or**
- Serve it locally so routing behaves exactly like it will on GitHub Pages:
  ```bash
  cd blessed-family-dashboard
  python3 -m http.server 8000
  # then visit http://localhost:8000
  ```

## Deploy to GitHub Pages

Your repo is already created at:
**https://github.com/piyush0798/Blesses-Family-Healthcare-Dashboard**

> Note: the repo name is `Blesses-Family-Healthcare-Dashboard` (not `blessed-family-healthcare` as in the original spec) — the steps below use your actual repo name. Rename the repo first (Settings → Rename) if you'd rather match the original.

1. **Clone your repo** (skip if you already have it locally):
   ```bash
   git clone https://github.com/piyush0798/Blesses-Family-Healthcare-Dashboard.git
   cd Blesses-Family-Healthcare-Dashboard
   ```
2. **Copy in these four files** (`index.html`, `style.css`, `app.js`, `README.md`) at the repo root — not inside a subfolder, so GitHub Pages can find `index.html`.
3. **Commit and push to `main`:**
   ```bash
   git add .
   git commit -m "Add BMI dashboard"
   git branch -M main
   git push -u origin main
   ```
4. **Enable GitHub Pages:**
   - Go to your repo → **Settings → Pages**
   - Under **Build and deployment → Source**, choose **Deploy from a branch**
   - Branch: **main**, Folder: **/ (root)**
   - Save
5. Wait a minute for the first deploy, then visit:
   ```
   https://piyush0798.github.io/Blesses-Family-Healthcare-Dashboard/
   ```

That's it — every visitor gets their own local copy of the data (it's stored in their browser, not shared between devices).
