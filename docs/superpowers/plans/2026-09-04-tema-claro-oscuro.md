# Tema claro/oscuro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a light/dark theme toggle to the HRM demo, driven entirely by CSS custom properties, without redesigning any screen or changing any behavior.

**Architecture:** All color moves into CSS variables declared on `:root` and overridden on `:root[data-theme='dark']`. Tailwind's semantic color keys stop holding hex and point at those variables, so existing class names keep working. `ConfigProvider` writes the per-tenant brand as *raw inputs* (`--brand-base`), and CSS derives the consumed brand tokens per theme — an inline style on `<html>` outranks any stylesheet rule, so the indirection is what makes dark mode able to override the tint at all. A new `ThemeProvider` writes `data-theme` on `documentElement`.

**Tech Stack:** React 18.3, Vite 5.4, Tailwind 3.4, CSS custom properties, `color-mix(in srgb, …)`. No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-09-04-tema-claro-oscuro-design.md`

## Global Constraints

- **The light theme must not change.** Every light token value in this plan is the exact hex already in the codebase. Light-theme screenshots must match the Task 0 baseline.
- **No behavior changes.** No component's props, state, event handlers, or rendered structure change except where this plan says so explicitly.
- **`src/config/demo.config.js` is not modified.** Client profiles must learn nothing about themes.
- **`src/data/generador.js` is not modified.** Its 21 hex are avatar identity data (`HUES` + `HUE_FG`), each light tint paired with its own dark foreground, legible in both themes.
- **No hardcoded color may remain** in `src/**/*.jsx` outside those two files. The exit check is a grep that must return empty.
- **Contrast floor:** WCAG AA — 4.5:1 for normal text, 3:1 for text ≥18.66px bold or ≥24px.
- **Storage keys already in use — do not collide:** `rrhh-demo-profile`, `rrhh-demo-auth`. The new one is `rrhh-demo-theme`.
- **Spanish (es-AR) for all user-visible copy and code comments**, matching the existing codebase.

### Testing model — read this before Task 1

**This project has no test runner.** There is no Vitest, no Jest, no test file anywhere; `package.json` has three scripts (`dev`, `build`, `preview`). Do not invent a test framework — that is a separate project.

The test cycle for every task in this plan is:

1. `npm run build` — must exit 0.
2. `node <scratch>/auditoria-tema.mjs` — the CDP audit harness built in Task 1, run against a live dev server.

The harness is the failing test. Task 1 builds it and watches it fail in dark mode; Tasks 2–10 make it pass. Treat "the audit reports a contrast failure" exactly as you would a red unit test: fix the token, re-run, do not proceed.

**Paths:** `<scratch>` means the session scratchpad directory. Do not add the harness to the project repo — it is a verification tool, not a deliverable.

---

### Task 0: Safety net and light-theme baseline

No version control exists in this directory (`git rev-parse` fails; there is a `.gitignore` but no `.git`). A 29-file color sweep with no way to diff or roll back is the single largest risk in this plan.

**Files:**
- Create: `<scratch>/src-baseline/` (file snapshot)
- Create: `<scratch>/baseline/` (populated from Task 1's first run — see Step 5)

- [ ] **Step 1: Ask the user whether to initialize git**

Ask exactly once: *"¿Inicializo git en el proyecto para poder revertir el barrido? Si preferís que no, guardo una copia de `src/` en el scratchpad como red de seguridad."*

If yes:

```bash
cd "/Users/macielfernandez/Developer/Proyectos/HRManagement System/HRM-app demo"
git init
git add -A
git commit -m "chore: baseline antes del tema claro/oscuro"
```

If no, or if the user does not answer, continue to Step 2 and skip every `git commit` step in later tasks.

- [ ] **Step 2: Snapshot the source tree**

```bash
SCRATCH=<scratch>
mkdir -p $SCRATCH/src-baseline
cp -R "src" "tailwind.config.js" "$SCRATCH/src-baseline/"
```

- [ ] **Step 3: Start the dev server**

```bash
cd "/Users/macielfernandez/Developer/Proyectos/HRManagement System/HRM-app demo"
npm run dev -- --no-open --port 5199 > $SCRATCH/vite.log 2>&1 &
for i in $(seq 1 30); do curl -sf http://localhost:5199/ -o /dev/null && break; sleep 0.3; done
```

- [ ] **Step 4: Start headless Chrome**

An existing Chrome instance will swallow the debugging port unless a separate `--user-data-dir` is given. Use `127.0.0.1`, not `localhost` — Node's fetch tries `::1` first and gets refused.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --remote-debugging-port=9222 \
  --user-data-dir=$SCRATCH/chrome --no-first-run --no-default-browser-check \
  --disable-gpu --hide-scrollbars about:blank > $SCRATCH/chrome.log 2>&1 &
for i in $(seq 1 40); do curl -sf http://127.0.0.1:9222/json/version -o /dev/null && break; sleep 0.3; done
```

- [ ] **Step 5: Leave the baseline to Task 1**

Do not hand-roll baseline screenshots here. Task 1 Step 2 runs the audit harness against the
untouched light theme and screenshots all 13 modules as a side effect — that run *is* the
baseline. Copy its output once it exists:

```bash
mkdir -p $SCRATCH/baseline && cp $SCRATCH/audit/light-*.png $SCRATCH/baseline/
```

Then verify three of the PNGs show rendered screens rather than blank frames. A blank frame
means the app never mounted and every later comparison is worthless.

---

### Task 1: Contrast audit harness (the failing test)

**Files:**
- Create: `<scratch>/auditoria-tema.mjs`

**Interfaces:**
- Consumes: the dev server on `:5199` and Chrome on `:9222` from Task 0.
- Produces: `node auditoria-tema.mjs` → exit 0 when every text node in every module, in both themes, meets AA; exit 1 with a list of `{módulo, tema, selector, ratio, fg, bg}` otherwise.

- [ ] **Step 1: Write the harness**

```js
import { writeFileSync } from 'node:fs';

const OUT = process.env.OUT ?? '.';
const MODULOS = ['inicio','empleados','asistencia','turnos','vacaciones','nomina','adelantos',
                 'desempeno','documentacion','capacitaciones','anuncios','reportes','admin'];
const ETIQUETAS = { inicio:'Inicio', empleados:'Empleados', asistencia:'Asistencia', turnos:'Turnos',
  vacaciones:'Vacaciones y Licencias', nomina:'Nómina', adelantos:'Adelantos', desempeno:'Desempeño',
  documentacion:'Documentación', capacitaciones:'Capacitaciones', anuncios:'Anuncios',
  reportes:'Reportes', admin:'Administración' };

let id = 0; const pending = new Map();
const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id); pending.delete(msg.id);
    msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const n = ++id; pending.set(n, { res, rej }); ws.send(JSON.stringify({ id: n, method, params }));
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evaluate = async (expr) => {
  const { result, exceptionDetails } = await send('Runtime.evaluate',
    { expression: expr, awaitPromise: true, returnByValue: true });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'eval failed');
  return result.value;
};
const shot = async (name) => {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64'));
};

// Auditoría de contraste: corre dentro de la página.
// Recorre cada nodo de texto visible, resuelve el fondo real subiendo por los ancestros
// hasta encontrar uno opaco, y calcula la relación WCAG.
const AUDITORIA = `(() => {
  const lum = (r, g, b) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const parse = (s) => {
    const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const mezcla = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1
  });
  const fondoDe = (el) => {
    let capa = { r: 255, g: 255, b: 255, a: 1 }, pila = [];
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) { pila.push(c); if (c.a === 1) break; }
    }
    for (let i = pila.length - 1; i >= 0; i--) capa = mezcla(pila[i], capa);
    return capa;
  };
  const ratio = (a, b) => {
    const l1 = lum(a.r, a.g, a.b), l2 = lum(b.r, b.g, b.b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const fallos = [];
  document.querySelectorAll('body *').forEach((el) => {
    const texto = [...el.childNodes]
      .filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim()).join(' ');
    if (!texto) return;
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none' || parseFloat(st.opacity) < 0.5) return;
    const caja = el.getBoundingClientRect();
    if (!caja.width || !caja.height) return;
    // Los íconos de Material Symbols son ligaduras tipográficas, no texto legible.
    if (el.classList.contains('ms')) return;
    const fg = parse(st.color); if (!fg) return;
    const bg = fondoDe(el);
    const r = ratio(fg.a < 1 ? mezcla(fg, bg) : fg, bg);
    const px = parseFloat(st.fontSize);
    const grande = px >= 24 || (px >= 18.66 && parseInt(st.fontWeight, 10) >= 700);
    const minimo = grande ? 3 : 4.5;
    if (r < minimo) fallos.push({
      texto: texto.slice(0, 42), ratio: Math.round(r * 100) / 100, minimo,
      fg: st.color, bg: \`rgb(\${Math.round(bg.r)},\${Math.round(bg.g)},\${Math.round(bg.b)})\`,
      px, tag: el.tagName.toLowerCase(), clase: (el.className || '').toString().slice(0, 60)
    });
  });
  return fallos;
})()`;

await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',
  { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });

const entrar = async () => {
  await send('Page.navigate', { url: 'http://localhost:5199/' });
  await sleep(1200);
  const enLogin = await evaluate(`!!document.getElementById('login-email')`);
  if (!enLogin) return;
  await evaluate(`(() => {
    const set = (el, v) => {
      Object.getOwnPropertyDescriptor(el.constructor.prototype, 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    set(document.getElementById('login-email'), 'demo@redfederal.com');
    set(document.getElementById('login-password'), 'demo123');
    document.querySelector('button[type=submit]').click();
  })()`);
  await sleep(1300);
};

const irA = async (mod) => {
  await evaluate(`(() => {
    const b = [...document.querySelectorAll('aside button')]
      .find(x => x.textContent.includes(${JSON.stringify(ETIQUETAS[mod])}));
    if (b) b.click();
  })()`);
  await sleep(700);
};

const ponerTema = async (tema) => {
  await evaluate(`localStorage.setItem('rrhh-demo-theme', '${tema}')`);
  await send('Page.reload');
  await sleep(1400);
};

let totalFallos = 0;
for (const tema of ['light', 'dark']) {
  await entrar();
  await ponerTema(tema);
  await entrar();
  const real = await evaluate(`document.documentElement.getAttribute('data-theme')`);
  console.log(`\\n=== tema ${tema} (data-theme=${real}) ===`);
  for (const mod of MODULOS) {
    await irA(mod);
    const fallos = await evaluate(AUDITORIA);
    await shot(`${tema}-${mod}`);
    if (fallos.length) {
      totalFallos += fallos.length;
      console.log(`FALLA  ${mod} — ${fallos.length} nodo(s) bajo el mínimo`);
      fallos.slice(0, 6).forEach((f) =>
        console.log(`   ${f.ratio}:1 (min ${f.minimo})  "${f.texto}"  ${f.fg} sobre ${f.bg}  [${f.clase}]`));
    } else {
      console.log(`OK     ${mod}`);
    }
  }
}
console.log(`\\n${totalFallos ? `TOTAL DE FALLOS: ${totalFallos}` : 'SIN FALLOS DE CONTRASTE'}`);
ws.close();
process.exit(totalFallos ? 1 : 0);
```

- [ ] **Step 2: Run it against the current light theme — must pass**

```bash
OUT=$SCRATCH/audit node $SCRATCH/auditoria-tema.mjs
```

Expected: the `light` pass reports `OK` for all 13 modules. The `dark` pass **also** reports OK right now, because `data-theme` does nothing yet and both passes render the same light theme.

If the light pass reports failures, **stop**. Either the harness has a bug or the existing light theme has a real contrast problem. Diagnose before writing a single token — a harness that fails on known-good input cannot validate anything.

- [ ] **Step 3: Prove the harness detects darkness (the red state)**

Temporarily force a dark canvas with no token support and confirm the harness screams:

```bash
node -e "
const s=require('fs').readFileSync('src/index.css','utf8');
require('fs').writeFileSync('src/index.css.bak',s);
require('fs').writeFileSync('src/index.css',s.replace('--canvas: #f6f5f2;','--canvas: #171614;'));
"
OUT=$SCRATCH/audit node $SCRATCH/auditoria-tema.mjs; echo "exit=$?"
mv src/index.css.bak src/index.css
```

Expected: non-zero exit with contrast failures on the page background. This is the failing test that Tasks 2–10 turn green. If it exits 0, the harness is not reading real computed styles — fix it before proceeding.

---

### Task 2: Token layer — `index.css` and `tailwind.config.js`

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

**Interfaces:**
- Produces: the complete CSS variable palette, and Tailwind color keys resolving to it. Every later task consumes these names.

- [ ] **Step 1: Replace the `@layer base` variable block in `src/index.css`**

Replace the existing `:root { --brand … }` block with:

```css
@layer base {
  /* ---------- Tema claro (predeterminado) ---------- */
  /* ConfigProvider escribe las entradas crudas de marca (--brand-base y compañía)
     sobre <html>. Un style en línea gana a cualquier regla de hoja de estilos, así
     que los tokens consumidos se derivan acá y nunca se escriben desde JS. */
  :root {
    --canvas: #f6f5f2;
    --surface: #ffffff;
    --surface-2: #faf9f7;
    --surface-3: #f2f0ec;
    --surface-translucent: rgba(255, 255, 255, 0.92);

    --line: #e6e3dd;
    --line-2: #f0eeea;
    --line-strong: #e2ded6;

    --ink: #262521;
    --ink-2: #55534c;
    --muted: #7c7a72;
    --muted-2: #a5a29a;
    --muted-3: #8b8880;

    --ok-fg: #1f7a4d;   --ok-bg: #e7f3ec;
    --warn-fg: #9a6a10; --warn-bg: #fbf1de;
    --bad-fg: #a83232;  --bad-bg: #fbeaea;
    --info-fg: #2f5fa8; --info-bg: #e9eff9;
    --vio-fg: #6b4a9e;  --vio-bg: #f0eaf9;
    --grey-fg: #6b6a63; --grey-bg: #eeece7;

    --brand: var(--brand-base, #12665c);
    --brand-dark: var(--brand-base-dark, #0d4a43);
    --brand-soft: var(--brand-soft-base, #e6f0ee);
    --brand-ink: #ffffff;
    --secondary: var(--secondary-base, #9a6a10);

    --overlay: rgba(38, 37, 33, 0.42);
    --toast-bg: var(--ink);
    --toast-ink: var(--canvas);
    --toast-accent: #7fd1b9;
    --scrollbar: #dcd8d0;

    color-scheme: light;
  }

  /* ---------- Tema oscuro ---------- */
  /* La especificidad importa: :root[data-theme='dark'] (0,2,0) gana sobre :root (0,1,0).
     Un [data-theme='dark'] a secas empataría y no aplicaría. */
  :root[data-theme='dark'] {
    --canvas: #171614;
    --surface: #1e1d1a;
    --surface-2: #232220;
    --surface-3: #2b2a26;
    --surface-translucent: rgba(30, 29, 26, 0.92);

    --line: #35322c;
    --line-2: #2a2824;
    --line-strong: #403c35;

    --ink: #ece9e3;
    --ink-2: #c3bfb7;
    --muted: #9a958c;
    --muted-2: #837e75;
    --muted-3: #8f8a81;

    --ok-fg: #5fc98f;   --ok-bg: #14312a;
    --warn-fg: #e0b452; --warn-bg: #33280f;
    --bad-fg: #f08a86;  --bad-bg: #3a1c1c;
    --info-fg: #7fb0ee; --info-bg: #16263f;
    --vio-fg: #b79ae8;  --vio-bg: #241c3a;
    --grey-fg: #b0aaa0; --grey-bg: #2c2a26;

    --brand: color-mix(in srgb, var(--brand-base, #12665c) 45%, white);
    --brand-dark: color-mix(in srgb, var(--brand-base, #12665c) 32%, white);
    --brand-soft: color-mix(in srgb, var(--brand-base, #12665c) 20%, var(--surface));
    --brand-ink: #10120f;
    --secondary: color-mix(in srgb, var(--secondary-base, #9a6a10) 45%, white);

    --overlay: rgba(10, 9, 8, 0.62);
    --toast-accent: #2f7d64;
    --scrollbar: #3a3831;

    color-scheme: dark;
  }
```

Note `--brand: var(--brand-base, #12665c)` — the fallback keeps the app rendering correctly on the very first paint, before `ConfigProvider`'s effect runs.

- [ ] **Step 2: Tokenize the rest of `index.css`**

In the same file, apply these replacements:

| Current | Replacement |
|---|---|
| `::-webkit-scrollbar-thumb { background: #dcd8d0; … border: 3px solid #f6f5f2; }` | `background: var(--scrollbar); … border: 3px solid var(--canvas);` |
| `.card` → `@apply bg-surface border border-line rounded-[13px];` | unchanged (already tokens) |
| `.th` → `text-[#8b8880]` | `text-muted3` |
| `.input` → `border-[#e2ded6] bg-[#faf9f7]` | `border-linestrong bg-surface2` |
| `.btn-primary` → `bg-brand text-white` | `bg-brand text-brandink` |
| `.btn-ghost` → `border-[#e2ded6] hover:bg-[#f2f0ec]` | `border-linestrong hover:bg-surface3` |

- [ ] **Step 3: Replace the `colors` block in `tailwind.config.js`**

Existing key names are preserved so no working class breaks; new keys are added for the swept literals.

```js
      colors: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        surface3: 'var(--surface-3)',
        translucent: 'var(--surface-translucent)',
        line: 'var(--line)',
        line2: 'var(--line-2)',
        linestrong: 'var(--line-strong)',
        ink: 'var(--ink)',
        ink2: 'var(--ink-2)',
        muted: 'var(--muted)',
        muted2: 'var(--muted-2)',
        muted3: 'var(--muted-3)',
        overlay: 'var(--overlay)',
        toast: 'var(--toast-bg)',
        toastink: 'var(--toast-ink)',
        brand: {
          DEFAULT: 'var(--brand)',
          dark: 'var(--brand-dark)',
          soft: 'var(--brand-soft)',
          ink: 'var(--brand-ink)'
        },
        brandink: 'var(--brand-ink)',
        secondary: 'var(--secondary)',
        ok: { DEFAULT: 'var(--ok-fg)', soft: 'var(--ok-bg)' },
        warn: { DEFAULT: 'var(--warn-fg)', soft: 'var(--warn-bg)' },
        bad: { DEFAULT: 'var(--bad-fg)', soft: 'var(--bad-bg)' },
        info: { DEFAULT: 'var(--info-fg)', soft: 'var(--info-bg)' },
        vio: { DEFAULT: 'var(--vio-fg)', soft: 'var(--vio-bg)' },
        grey: { DEFAULT: 'var(--grey-fg)', soft: 'var(--grey-bg)' }
      },
```

Also update the comment above `export default` to say the palette now lives in `src/index.css`.

- [ ] **Step 4: Build and audit**

```bash
npm run build
OUT=$SCRATCH/audit node $SCRATCH/auditoria-tema.mjs
```

Expected: exit 0. Dark mode still renders light (nothing sets `data-theme` yet) — that is correct at this stage.

- [ ] **Step 5: Verify the light theme did not move**

Compare three `<scratch>/audit/light-*.png` against the Task 0 baseline for the same modules. They must be visually identical. If anything shifted, a token value is wrong — fix it before continuing.

- [ ] **Step 6: Commit** (skip if git was declined in Task 0)

```bash
git add src/index.css tailwind.config.js
git commit -m "refactor: paleta de temas en variables CSS"
```

---

### Task 3: Brand indirection in `ConfigContext`

**Files:**
- Modify: `src/config/ConfigContext.jsx` (function `aplicarBranding`)

**Interfaces:**
- Consumes: `--brand-base`, `--brand-base-dark`, `--brand-soft-base`, `--secondary-base` from Task 2.
- Produces: nothing new to JS consumers. `useConfig()` is unchanged.

- [ ] **Step 1: Rewrite `aplicarBranding`**

```js
function aplicarBranding(profile) {
  const r = document.documentElement;
  // Entradas crudas: el CSS deriva de acá los tokens consumidos según el tema.
  // Escribirlas con el nombre final rompería el tema oscuro — un style en línea
  // sobre <html> gana a cualquier regla de hoja de estilos.
  r.style.setProperty('--brand-base', profile.branding.primaryColor);
  r.style.setProperty('--brand-base-dark', profile.branding.primaryDark);
  r.style.setProperty('--brand-soft-base', profile.branding.primarySoft);
  r.style.setProperty('--secondary-base', profile.branding.secondaryColor);
  document.title = profile.company.name + ' — Gestión de Personas';
  const link = document.querySelector('link[rel="icon"]');
  if (link && profile.branding.favicon) link.setAttribute('href', profile.branding.favicon);
}
```

- [ ] **Step 2: Verify no stale variable names remain**

```bash
grep -rn "setProperty('--brand'\|setProperty('--secondary'\|setProperty('--brand-dark'\|setProperty('--brand-soft'" src/
```

Expected: no output. Any hit is a leftover write that will freeze the brand tint in dark mode.

- [ ] **Step 3: Build and audit**

```bash
npm run build && OUT=$SCRATCH/audit node $SCRATCH/auditoria-tema.mjs
```

Expected: exit 0, light theme unchanged.

- [ ] **Step 4: Verify all three profiles still brand correctly**

In the browser console via CDP, for each profile id (`red-federal`, `grupo-horizonte`, `logistica-austral`): set `localStorage['rrhh-demo-profile']`, reload, and read
`getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()`.

Expected: `#12665c`, `#2f5fa8`, `#8a4b1f` respectively.

- [ ] **Step 5: Commit**

```bash
git add src/config/ConfigContext.jsx
git commit -m "refactor: ConfigProvider escribe entradas crudas de marca"
```

---

### Task 4: `ThemeContext`

**Files:**
- Create: `src/context/ThemeContext.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: `ThemeProvider` (component) and `useTheme()` → `{ tema, esOscuro, alternarTema, ponerTema, siguiendoAlSistema }`.
  - `tema`: `'light' | 'dark'`
  - `esOscuro`: `boolean`
  - `alternarTema()`: `() => void` — flips and persists
  - `ponerTema(t)`: `(t: 'light'|'dark') => void`
  - `siguiendoAlSistema`: `boolean` — true while no explicit choice is stored
- Task 5 consumes `esOscuro` and `alternarTema`.

- [ ] **Step 1: Write `src/context/ThemeContext.jsx`**

```jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'rrhh-demo-theme';
const TEMAS = ['light', 'dark'];

function leerGuardado() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return TEMAS.includes(v) ? v : null;
  } catch {
    return null;
  }
}

function preferenciaDelSistema() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

// Elección guardada → preferencia del sistema → claro.
function temaInicial() {
  return leerGuardado() ?? preferenciaDelSistema();
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial);
  const [siguiendoAlSistema, setSiguiendo] = useState(() => leerGuardado() === null);

  // El atributo va en <html> para que la paleta esté disponible antes de pintar.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  // Mientras no haya elección explícita, la aplicación sigue al sistema en vivo.
  useEffect(() => {
    if (!siguiendoAlSistema) return undefined;
    let mq;
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return undefined;
    }
    const alCambiar = (e) => setTema(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, [siguiendoAlSistema]);

  const ponerTema = useCallback((t) => {
    if (!TEMAS.includes(t)) return;
    setTema(t);
    setSiguiendo(false);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* sin persistencia disponible */
    }
  }, []);

  const alternarTema = useCallback(() => {
    setTema((actual) => {
      const proximo = actual === 'dark' ? 'light' : 'dark';
      setSiguiendo(false);
      try {
        localStorage.setItem(STORAGE_KEY, proximo);
      } catch {
        /* sin persistencia disponible */
      }
      return proximo;
    });
  }, []);

  const value = useMemo(
    () => ({ tema, esOscuro: tema === 'dark', alternarTema, ponerTema, siguiendoAlSistema }),
    [tema, alternarTema, ponerTema, siguiendoAlSistema]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
```

- [ ] **Step 2: Mount the provider in `src/App.jsx`**

`ThemeProvider` goes inside `ConfigProvider` (brand variables already written) and outside `AuthProvider` (so the login screen is themed too).

```jsx
import { ConfigProvider } from '@/config/ConfigContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SessionProvider } from '@/context/SessionContext';
import AppShell from '@/components/layout/AppShell';
import Login from '@/modules/auth/Login';

function Ruteo() {
  const { autenticado } = useAuth();
  if (!autenticado) return <Login />;
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <AuthProvider>
          <Ruteo />
        </AuthProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}
```

- [ ] **Step 3: Add the anti-flash script to `index.html`**

Without this the page paints light for one frame before React mounts, which reads as a flash on every load in dark mode. Insert immediately before `</head>`:

```html
    <script>
      // Aplica el tema antes del primer pintado para evitar el destello claro.
      (function () {
        try {
          var g = localStorage.getItem('rrhh-demo-theme');
          var t = g === 'light' || g === 'dark'
            ? g
            : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', t);
        } catch (e) {}
      })();
    </script>
```

- [ ] **Step 4: Build and run the audit — expect failures**

```bash
npm run build && OUT=$SCRATCH/audit node $SCRATCH/auditoria-tema.mjs; echo "exit=$?"
```

Expected: **non-zero exit.** Dark mode now actually applies, and every component still carrying a hardcoded light color fails contrast. Record the failure count — it is the work queue for Tasks 6–10.

This is the red state. Do not fix anything here; Task 5 adds the control, then the sweep turns it green.

- [ ] **Step 5: Verify persistence and OS following**

Via CDP:
- Set `localStorage['rrhh-demo-theme']='dark'`, reload → `document.documentElement.dataset.theme === 'dark'`.
- Remove the key, use `Emulation.setEmulatedMedia` with `prefers-color-scheme: dark`, reload → `'dark'`.
- Same with `prefers-color-scheme: light` → `'light'`.

- [ ] **Step 6: Commit**

```bash
git add src/context/ThemeContext.jsx src/App.jsx index.html
git commit -m "feat: contexto de tema con persistencia y preferencia del sistema"
```

---

### Task 5: `ThemeToggle` component

**Files:**
- Create: `src/components/ui/ThemeToggle.jsx`
- Modify: `src/components/ui/index.js`
- Modify: `src/components/layout/Topbar.jsx`
- Modify: `src/modules/auth/Login.jsx`

**Interfaces:**
- Consumes: `useTheme()` from Task 4.
- Produces: `<ThemeToggle />`, and `<ThemeToggle className="…" />` for placement tweaks.

- [ ] **Step 1: Write `src/components/ui/ThemeToggle.jsx`**

```jsx
import { useTheme } from '@/context/ThemeContext';
import { Icon } from './primitives';

export function ThemeToggle({ className = '' }) {
  const { esOscuro, alternarTema } = useTheme();
  return (
    <button
      onClick={alternarTema}
      aria-label={esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      aria-pressed={esOscuro}
      title={esOscuro ? 'Tema claro' : 'Tema oscuro'}
      className={
        'w-[38px] h-[38px] border border-linestrong rounded-[10px] bg-surface hover:bg-surface2 grid place-items-center ' +
        className
      }
    >
      <Icon name={esOscuro ? 'light_mode' : 'dark_mode'} size={20} className="text-ink2" />
    </button>
  );
}
```

- [ ] **Step 2: Export it from the barrel**

In `src/components/ui/index.js` add:

```js
export * from './ThemeToggle';
```

- [ ] **Step 3: Mount in `Topbar`**

Add `ThemeToggle` to the existing import from `@/components/ui`, then place it immediately **before** the notifications `<div className="relative">` block:

```jsx
      <ThemeToggle />
```

- [ ] **Step 4: Mount in `Login`**

Add `ThemeToggle` to the import from `@/components/ui`. In the `<main>` element, wrap the top of the form column so the control sits above the heading, right-aligned:

```jsx
        <div className="w-full max-w-[420px]">
          <div className="flex justify-end mb-3">
            <ThemeToggle />
          </div>
          <div className="mb-6">
```

- [ ] **Step 5: Build and verify the control works**

```bash
npm run build
```

Via CDP: click the toggle, assert `document.documentElement.dataset.theme` flips, `localStorage['rrhh-demo-theme']` is written, and the `aria-label` text changes. Confirm the toggle is present on the login screen before authenticating.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ThemeToggle.jsx src/components/ui/index.js \
        src/components/layout/Topbar.jsx src/modules/auth/Login.jsx
git commit -m "feat: control de alternancia de tema en encabezado e ingreso"
```

---

### Task 6: Status tones — `format.js`

**Files:**
- Modify: `src/lib/format.js` (the `TONOS` object only)

**Interfaces:**
- Produces: `TONOS[t]` → `{ fg: string, bg: string }` where the strings are now `var(--…)` references. **The shape is unchanged**, so `tono()`, `Chip`, and all ~15 badge call sites need no edits.

- [ ] **Step 1: Replace `TONOS`**

```js
// Los valores son variables CSS: el mismo objeto sirve para ambos temas.
export const TONOS = {
  ok: { fg: 'var(--ok-fg)', bg: 'var(--ok-bg)' },
  warn: { fg: 'var(--warn-fg)', bg: 'var(--warn-bg)' },
  bad: { fg: 'var(--bad-fg)', bg: 'var(--bad-bg)' },
  info: { fg: 'var(--info-fg)', bg: 'var(--info-bg)' },
  vio: { fg: 'var(--vio-fg)', bg: 'var(--vio-bg)' },
  grey: { fg: 'var(--grey-fg)', bg: 'var(--grey-bg)' },
  brand: { fg: 'var(--brand)', bg: 'var(--brand-soft)' }
};
```

`ESTADO_TONO` and `tono()` are untouched.

- [ ] **Step 2: Build and audit**

```bash
npm run build && OUT=$SCRATCH/audit node $SCRATCH/auditoria-tema.mjs; echo "exit=$?"
```

Expected: still non-zero (the sweep hasn't happened), but every badge-related failure should be gone from the dark report. Compare the failure list against Task 4's — badge entries must have disappeared.

- [ ] **Step 3: Commit**

```bash
git add src/lib/format.js
git commit -m "refactor: tonos de estado en variables CSS"
```

---

### Task 7: Shared UI sweep

**Files:**
- Modify: `src/components/ui/primitives.jsx` (11 hex)
- Modify: `src/components/ui/DataTable.jsx` (3)
- Modify: `src/components/ui/Modal.jsx` (2)
- Modify: `src/components/ui/Tabs.jsx` (2)

**Interfaces:**
- Consumes: Tailwind keys from Task 2.
- Produces: chart primitives whose default `color` is a token, so module call sites can pass tokens too.

**The replacement map — use it in every sweep task (7, 8, 9, 10):**

| Literal | Token class | Inline value |
|---|---|---|
| `#faf9f7` | `surface2` | `var(--surface-2)` |
| `#f2f0ec`, `#efeee9` | `surface3` | `var(--surface-3)` |
| `#fdfcfa` | `surface2` | `var(--surface-2)` |
| `#f6f5f2` | `canvas` | `var(--canvas)` |
| `#e6e3dd`, `#ebe8e2` | `line` | `var(--line)` |
| `#f0eeea` | `line2` | `var(--line-2)` |
| `#e2ded6`, `#d8d4cc`, `#cfcac1` | `linestrong` | `var(--line-strong)` |
| `#262521` | `ink` | `var(--ink)` |
| `#55534c` | `ink2` | `var(--ink-2)` |
| `#7c7a72` | `muted` | `var(--muted)` |
| `#a5a29a` | `muted2` | `var(--muted-2)` |
| `#8b8880` | `muted3` | `var(--muted-3)` |
| `#1f7a4d` / `#e7f3ec` | `ok` / `ok-soft` | `var(--ok-fg)` / `var(--ok-bg)` |
| `#9a6a10` / `#fbf1de` | `warn` / `warn-soft` | `var(--warn-fg)` / `var(--warn-bg)` |
| `#a83232` / `#fbeaea` / `#f0d4d4` | `bad` / `bad-soft` | `var(--bad-fg)` / `var(--bad-bg)` |
| `#2f5fa8` / `#e9eff9` | `info` / `info-soft` | `var(--info-fg)` / `var(--info-bg)` |
| `#6b4a9e` / `#f0eaf9` | `vio` / `vio-soft` | `var(--vio-fg)` / `var(--vio-bg)` |
| `#6b6a63` / `#eeece7` | `grey` / `grey-soft` | `var(--grey-fg)` / `var(--grey-bg)` |
| `#12665c` | `brand` | `var(--brand)` |
| `#0d4a43` | `brand-dark` | `var(--brand-dark)` |
| `#e6f0ee` | `brand-soft` | `var(--brand-soft)` |
| `rgba(255,255,255,.92)` | `translucent` | `var(--surface-translucent)` |
| `rgba(38,37,33,.42)` | `overlay` | `var(--overlay)` |
| `text-white` on a brand background | `text-brandink` | — |
| `text-white` on a fixed dark surface (Toast) | `text-toastink` | — |

`#f0d4d4` is a light red border used on two "reject" buttons; `bad-soft` is its dark-theme-safe equivalent.

- [ ] **Step 1: `primitives.jsx`**

```jsx
export function ProgressBar({ pct, color = 'var(--brand)', height = 8 }) {
  return (
    <div className="flex-1 rounded-md overflow-hidden bg-surface3" style={{ height }}>
      <div className="h-full rounded-md" style={{ width: pct + '%', background: color }} />
    </div>
  );
}

export function BarList({ items, color = 'var(--brand)', labelWidth = 100 }) { /* cuerpo sin cambios */ }

export function ColumnChart({ title, subtitle, items, color = 'var(--ok-fg)' }) {
  /* … subtitle: className="text-[11.5px] text-muted3 mb-4" … */
}

export function EmptyState({ icon = 'inbox', title, body, tone = 'var(--muted-2)' }) {
  return (
    <div className="bg-surface border border-dashed border-linestrong rounded-[14px] p-11 text-center">
      {/* … */}
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed right-6 bottom-6 z-[200] flex items-center gap-[11px] px-[17px] py-[13px] bg-toast text-toastink rounded-xl shadow-2xl text-[13px] font-semibold animate-pop max-w-[380px]">
      <Icon name="check_circle" size={19} style={{ color: 'var(--toast-accent)' }} />
      {message}
    </div>
  );
}

export function FilterBar({ children, right }) {
  /* … <Icon name="filter_alt" size={19} className="text-muted3" /> … */
}

export function Select({ value, onChange, options, prefix, className = '' }) {
  /* … 'px-[10px] py-[7px] border border-linestrong rounded-lg bg-surface2 …' … */
}
```

- [ ] **Step 2: `DataTable.jsx`**

`<tr className="bg-[#faf9f7]">` → `bg-surface2`; `border-t border-[#f6f5f2]` → `border-t border-canvas`; `hover:bg-[#faf9f7]` → `hover:bg-surface2`.

- [ ] **Step 3: `Modal.jsx`**

Overlay `bg-[rgba(38,37,33,.42)]` → `bg-overlay`; close button `bg-[#f2f0ec]` → `bg-surface3`; read-only field `bg-[#f2f0ec]` → `bg-surface3`.

- [ ] **Step 4: `Tabs.jsx`**

Track `bg-[#efeee9]` → `bg-surface3`; inactive hover `hover:bg-[#f2f0ec]` → `hover:bg-surface3`.

- [ ] **Step 5: Verify no hex remains in `components/ui/`**

```bash
grep -rn '#[0-9a-fA-F]\{3,8\}' src/components/ui/
```

Expected: no output.

- [ ] **Step 6: Build and audit**

```bash
npm run build && OUT=$SCRATCH/audit node $SCRATCH/auditoria-tema.mjs; echo "exit=$?"
```

Expected: failure count drops substantially. Still non-zero.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/
git commit -m "refactor: componentes compartidos en tokens de tema"
```

---

### Task 8: Layout and login sweep

**Files:**
- Modify: `src/components/layout/Topbar.jsx` (19 hex + 1 rgba)
- Modify: `src/components/layout/Sidebar.jsx` (8)
- Modify: `src/components/layout/AppShell.jsx` (1)
- Modify: `src/modules/auth/Login.jsx` (3)

- [ ] **Step 1: `Topbar.jsx`**

Apply the Task 7 map. Specific spots:
- Header: `bg-[rgba(255,255,255,.92)]` → `bg-translucent`.
- Search input: `border-[#e2ded6] bg-[#faf9f7]` → `border-linestrong bg-surface2`.
- The `notifs` array has per-item `color:` hex — `'#a83232'` → `'var(--bad-fg)'`, `'#9a6a10'` → `'var(--warn-fg)'`, `'#2f5fa8'` → `'var(--info-fg)'`, `'var(--brand)'` stays.
- Notification rows: `hover:bg-[#faf9f7]` → `hover:bg-surface2`; unread `bg-[#fdfcfa]` → `bg-surface2`.
- Dropdown hovers: `hover:bg-[#f2f0ec]` → `hover:bg-surface3`.
- Date text and menu meta: `text-[#8b8880]` → `text-muted3`.
- User-menu divider: `border-[#ebe8e2]` → `border-line`.
- Notification badge: `bg-bad text-white` → `bg-bad text-surface`. In dark, `--bad-fg` is light, so white text on it fails; `--surface` is the dark card color and passes. Verify with the audit.

- [ ] **Step 2: `Sidebar.jsx`**

Apply the map. The role `<select>` uses `border-[#e2ded6] bg-[#faf9f7]` → `border-linestrong bg-surface2`; company-switcher hovers `hover:bg-[#faf9f7]` → `hover:bg-surface2`; helper text `text-[#8b8880]` → `text-muted3`. The active-module pill already uses `bg-brand-soft`, which now themes itself.

- [ ] **Step 3: `AppShell.jsx`**

`text-[#8b8880]` → `text-muted3`.

- [ ] **Step 4: `Login.jsx`**

- Checkbox: `border-[#d8d4cc]` → `border-linestrong`.
- The brand panel keeps its inline gradient from `branding.primaryColor` / `primaryDark` — that is tenant identity, correct in both themes. Do not tokenize it.
- Confirm `bg-brand-soft` / `text-brand` in the credentials box now theme automatically.

- [ ] **Step 5: Verify**

```bash
grep -rn '#[0-9a-fA-F]\{3,8\}' src/components/layout/ src/modules/auth/
```

Expected: no output.

- [ ] **Step 6: Build and audit, then eyeball dark**

```bash
npm run build && OUT=$SCRATCH/audit node $SCRATCH/auditoria-tema.mjs; echo "exit=$?"
```

Open `<scratch>/audit/dark-inicio.png` and look at it. The shell (sidebar, topbar, page background) must read as a coherent dark theme. Module content may still be wrong — that is Tasks 9–10.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/ src/modules/auth/
git commit -m "refactor: encabezado, barra lateral e ingreso en tokens de tema"
```

---

### Task 9: Module sweep — part 1

**Files:**
- Modify: `src/modules/inicio/Inicio.jsx` (9 hex)
- Modify: `src/modules/asistencia/HikvisionWizard.jsx` (15)
- Modify: `src/modules/asistencia/Asistencia.jsx` (5)
- Modify: `src/modules/reportes/Reportes.jsx` (8)
- Modify: `src/modules/anuncios/Anuncios.jsx` (7)
- Modify: `src/modules/capacitaciones/Capacitaciones.jsx` (6)

- [ ] **Step 1: Sweep each file with the Task 7 map**

Work one file at a time. For each: `grep -n '#[0-9a-fA-F]\{3,8\}\|text-white\|bg-white' <file>`, replace each hit per the map, then re-grep to confirm empty.

Two categories need judgment rather than mechanical replacement:

- **Chart color props.** Calls like `<BarList color="#2f5fa8" />` become `color="var(--info-fg)"`. Pick the token matching the semantic already in use, not the nearest hex.
- **Calendar cells** in `Asistencia.jsx` (`grid grid-cols-7`). Day cells use tone backgrounds via `tono()`, which Task 6 already themed; only the container borders and the empty/other-month cells need the map.

- [ ] **Step 2: Verify**

```bash
grep -rn '#[0-9a-fA-F]\{3,8\}' src/modules/inicio src/modules/asistencia \
      src/modules/reportes src/modules/anuncios src/modules/capacitaciones
```

Expected: no output.

- [ ] **Step 3: Build and audit**

```bash
npm run build && OUT=$SCRATCH/audit node $SCRATCH/auditoria-tema.mjs; echo "exit=$?"
```

Expected: `inicio`, `asistencia`, `reportes`, `anuncios`, `capacitaciones` report `OK` in both themes.

- [ ] **Step 4: Open the modal and wizard in dark**

The audit only sees what is on screen. Via CDP, on `asistencia` click "Importar fichadas" to open `HikvisionWizard`, run the audit expression against the open modal, and screenshot it. Repeat for one modal in `anuncios`.

- [ ] **Step 5: Commit**

```bash
git add src/modules/inicio src/modules/asistencia src/modules/reportes \
        src/modules/anuncios src/modules/capacitaciones
git commit -m "refactor: módulos de inicio, asistencia, reportes, anuncios y capacitaciones en tokens"
```

---

### Task 10: Module sweep — part 2

**Files:**
- Modify: `src/modules/nomina/Nomina.jsx` (5), `src/modules/nomina/ReciboModal.jsx` (3)
- Modify: `src/modules/administracion/Administracion.jsx` (5)
- Modify: `src/modules/turnos/Turnos.jsx` (4)
- Modify: `src/modules/vacaciones/Vacaciones.jsx` (3)
- Modify: `src/modules/empleados/EmpleadoPerfil.jsx` (3), `src/modules/empleados/Empleados.jsx` (1)
- Modify: `src/modules/documentacion/Documentacion.jsx` (3)
- Modify: `src/modules/desempeno/Desempeno.jsx` (3)
- Modify: `src/modules/adelantos/Adelantos.jsx` (2)

- [ ] **Step 1: Sweep each file with the Task 7 map**

Same procedure as Task 9. Specific spots worth care:

- `Vacaciones.jsx` team calendar and `Adelantos.jsx`: the reject buttons use `border-[#f0d4d4]` → `border-bad-soft`.
- `ReciboModal.jsx`: the payslip total rule `border-t-2 border-[#efeee9]` → `border-surface3`. This modal is a printed-document mimic; check it visually in dark — a document-like surface may warrant staying on `--surface` rather than `--canvas`.
- `Adelantos.jsx`: `text-[#cfcac1]` on a chevron → `text-muted2`.

- [ ] **Step 2: Verify — the global exit check**

```bash
grep -rn '#[0-9a-fA-F]\{3,8\}' src --include='*.jsx' | grep -v 'data/generador.js'
grep -rn 'text-white\|bg-white' src --include='*.jsx'
```

Expected: both empty. (`demo.config.js` is `.js`, not `.jsx`, and is excluded by the include filter; `generador.js` likewise — the explicit `grep -v` is belt-and-braces.)

- [ ] **Step 3: Build and audit**

```bash
npm run build && OUT=$SCRATCH/audit node $SCRATCH/auditoria-tema.mjs; echo "exit=$?"
```

Expected: **exit 0.** All 13 modules, both themes, zero contrast failures.

- [ ] **Step 4: Commit**

```bash
git add src/modules/
git commit -m "refactor: módulos restantes en tokens de tema"
```

---

### Task 11: Full verification

**Files:** none modified — this task only runs checks.

- [ ] **Step 1: Contrast audit across all three tenant profiles**

Extend the harness loop over `['red-federal','grupo-horizonte','logistica-austral']`, setting `localStorage['rrhh-demo-profile']` before each pass. The derived dark brand differs per tenant, so a tint that passes for the teal profile can fail for the brown one.

Expected: exit 0 for all three.

- [ ] **Step 2: Login regression suite**

```bash
OUT=$SCRATCH node $SCRATCH/drive.mjs
```

Expected: 27/27 PASS. This proves the theme work broke no existing behavior.

- [ ] **Step 3: Light-theme fidelity**

Compare every `<scratch>/audit/light-*.png` against the Task 0 baseline for the same module. Any visible difference is a regression in the default theme — investigate before declaring done.

- [ ] **Step 4: Responsive check in dark**

At 390×844, screenshot the login and two modules in dark. Confirm no horizontal overflow (`scrollWidth - clientWidth <= 1`) and no unreadable text.

- [ ] **Step 5: Theme persistence matrix**

Verify each: explicit dark survives reload; explicit light survives reload; no stored key + OS dark → dark; no stored key + OS light → light; changing tenant profile preserves the theme; logging out and back in preserves the theme.

- [ ] **Step 6: Console must be clean**

Confirm the harness reports zero `Runtime.exceptionThrown` and zero console errors across every module in both themes.

- [ ] **Step 7: Final build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 8: Commit and stop the servers**

```bash
git add -A && git commit -m "feat: tema claro/oscuro completo"
pkill -f "remote-debugging-port=9222"; pkill -f "vite --no-open --port 5199"
```

---

## Notes for the executor

- **Do not restyle anything.** If a screen looks improvable in dark mode, note it and move on. Redesign is explicitly out of scope.
- **When a contrast failure has two fixes** — change the token or change the component — change the token. The whole point is one source of truth.
- **`color-mix()` fallback:** if the derived brand renders wrong, check browser support before rewriting the approach. Chrome/Edge 111+, Safari 16.2+, Firefox 113+.
- **The audit cannot see closed overlays.** Modals, dropdowns and the notification panel must be opened explicitly (Tasks 9 Step 4). A green audit with every overlay closed proves nothing about them.
