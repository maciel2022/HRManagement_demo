# Tema claro/oscuro — diseño

**Fecha:** 2026-09-04
**Estado:** aprobado para planificar
**Alcance:** sistema de temas para la demo de RRHH (React 18 + Vite 5 + Tailwind 3)

---

## 1. Contexto

La aplicación tiene hoy un único tema claro. El color llega a los componentes por tres caminos distintos:

1. **Nombres semánticos de Tailwind** definidos con hex fijo en `tailwind.config.js`
   (`canvas`, `surface`, `line`, `ink`, `muted`, y los tonos `ok/warn/bad/info/vio/grey`).
2. **Literales hex en línea** — 176 ocurrencias en 27 archivos, como `bg-[#faf9f7]`,
   `text-[#8b8880]`, `border-[#e2ded6]`.
3. **Valores hex devueltos por JavaScript** — `TONOS`/`tono()` en `src/lib/format.js`
   entrega pares `{fg, bg}` a las insignias de estado, y `ProgressBar` / `BarList` /
   `ColumnChart` reciben el color por prop con un hex por defecto.

Sólo el color de marca es dinámico: `ConfigProvider` escribe `--brand`, `--brand-dark`,
`--brand-soft` y `--secondary` sobre `documentElement` a partir del perfil activo de
`demo.config.js`. El tema oscuro extiende ese mecanismo que ya existe; no introduce uno nuevo.

## 2. Objetivos

- Alternar entre claro y oscuro sin rediseñar la aplicación.
- El tema claro sigue siendo el predeterminado y no cambia de aspecto.
- Cobertura consistente: barra lateral, encabezado, tarjetas, tablas, formularios, modales,
  menús desplegables, gráficos, calendarios e insignias de estado.
- Contraste WCAG AA verificado, no supuesto.
- Un solo origen de verdad para el color; sin hex repartidos por los componentes.
- Preferencia persistida en `localStorage`; si no hay ninguna, se respeta el sistema operativo.
- Ninguna funcionalidad existente se altera.

## 3. No objetivos

- Rediseñar pantallas, cambiar espaciados, tipografía o jerarquía visual.
- Agregar un tercer tema o temas por inquilino.
- Modificar `demo.config.js`. Los perfiles de cliente no deben aprender nada sobre temas.
- Tocar la capa de datos (`src/data/`, `src/api/`) — no interviene en el color.

## 4. Decisiones tomadas

| Decisión | Elección | Motivo |
|---|---|---|
| Mecanismo | Variables CSS + `data-theme` en `<html>` | Alcanza también los `style` en línea y los props de gráficos, que la variante `dark:` de Tailwind no puede tocar |
| Tinte de marca oscuro | Derivado en tiempo de ejecución con `color-mix()` | `demo.config.js` queda intacto; un perfil nuevo obtiene tema oscuro sin configuración |
| Barrido de literales | Tokenización completa (excepto `generador.js`) | Un origen de verdad; ninguna pantalla queda con color claro fijo |
| Ubicación del control | Botón de ícono en el encabezado, junto a la campana | Un clic, visible para quien recorre la demo |
| Arranque | Elección guardada → preferencia del sistema → claro | Muestra la función a quien tiene el sistema en oscuro, sin perder la identidad clara |
| Pantalla de ingreso | También lleva el control | Sin él, quien llega con el sistema en oscuro no puede cambiar antes de entrar |

### Por qué no la variante `dark:` de Tailwind

Duplicaría cada cadena de clases en 27 archivos, seguiría necesitando un segundo mecanismo
para los ~40 colores en `style` en línea (gráficos e insignias), y fijaría cada color **dos
veces** — exactamente lo contrario a reutilizar tokens.

## 5. Arquitectura

### 5.1 Capa de tokens

`src/index.css` define la paleta completa en `:root` y la sobreescribe en
`:root[data-theme='dark']`. La especificidad importa: `:root[data-theme='dark']` (0,2,0) gana
sobre `:root` (0,1,0); un simple `[data-theme='dark']` empataría y no aplicaría.

**Superficies y bordes**

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--canvas` | `#f6f5f2` | `#171614` | Fondo de página |
| `--surface` | `#ffffff` | `#1e1d1a` | Tarjetas, modales, barra lateral |
| `--surface-2` | `#faf9f7` | `#232220` | Campos, encabezado de tabla, hover suave |
| `--surface-3` | `#f2f0ec` | `#2b2a26` | Hover marcado, botón fantasma, pistas |
| `--line` | `#e6e3dd` | `#35322c` | Bordes de tarjeta y separadores |
| `--line-2` | `#f0eeea` | `#2a2824` | Separadores sutiles |
| `--line-strong` | `#e2ded6` | `#403c35` | Bordes de campo y de control |

**Texto**

| Token | Claro | Oscuro | Contraste sobre `--surface` (oscuro) |
|---|---|---|---|
| `--ink` | `#262521` | `#ece9e3` | ~13:1 |
| `--ink-2` | `#55534c` | `#c3bfb7` | ~9:1 |
| `--muted` | `#7c7a72` | `#9a958c` | ~6:1 |
| `--muted-2` | `#a5a29a` | `#837e75` | ~4.6:1 |
| `--muted-3` | `#8b8880` | `#8f8a81` | ~5:1 |

**Tonos de estado** — valores elegidos a mano, no derivados: el contraste de las insignias es
donde más fallan los temas oscuros, y estos tonos no dependen del inquilino.

| Tono | Claro `fg` / `bg` | Oscuro `fg` / `bg` |
|---|---|---|
| ok | `#1f7a4d` / `#e7f3ec` | `#5fc98f` / `#14312a` |
| warn | `#9a6a10` / `#fbf1de` | `#e0b452` / `#33280f` |
| bad | `#a83232` / `#fbeaea` | `#f08a86` / `#3a1c1c` |
| info | `#2f5fa8` / `#e9eff9` | `#7fb0ee` / `#16263f` |
| vio | `#6b4a9e` / `#f0eaf9` | `#b79ae8` / `#241c3a` |
| grey | `#6b6a63` / `#eeece7` | `#b0aaa0` / `#2c2a26` |

**Chrome**

| Token | Claro | Oscuro |
|---|---|---|
| `--overlay` | `rgba(38,37,33,.42)` | `rgba(10,9,8,.62)` |
| `--toast-bg` | `var(--ink)` | `var(--ink)` |
| `--toast-ink` | `var(--canvas)` | `var(--canvas)` |
| `--scrollbar` | `#dcd8d0` | `#3a3831` |

El brindis (`Toast`) se invierte solo: fondo `--ink` y texto `--canvas` dan tostada oscura
sobre tema claro y tostada clara sobre tema oscuro, que es el patrón habitual.

### 5.2 Marca por inquilino

`ConfigProvider` deja de escribir los tokens consumidos y pasa a escribir **entradas crudas**:

```js
r.style.setProperty('--brand-base', profile.branding.primaryColor);
r.style.setProperty('--brand-base-dark', profile.branding.primaryDark);
r.style.setProperty('--brand-soft-base', profile.branding.primarySoft);
r.style.setProperty('--secondary-base', profile.branding.secondaryColor);
```

Esto es obligatorio, no cosmético: un `style` en línea sobre `<html>` gana a cualquier regla
de hoja de estilos, así que si el proveedor siguiera escribiendo `--brand-soft` directamente,
el tema oscuro **nunca** podría sobreescribirlo.

El CSS deriva los tokens consumidos por tema:

```css
:root {
  --brand:      var(--brand-base);
  --brand-dark: var(--brand-base-dark);
  --brand-soft: var(--brand-soft-base);
  --brand-ink:  #ffffff;
  --secondary:  var(--secondary-base);
}
:root[data-theme='dark'] {
  --brand:      color-mix(in srgb, var(--brand-base) 45%, white);
  --brand-dark: color-mix(in srgb, var(--brand-base) 32%, white);  /* hover aclara */
  --brand-soft: color-mix(in srgb, var(--brand-base) 20%, var(--surface));
  --brand-ink:  #10120f;
  --secondary:  color-mix(in srgb, var(--secondary-base) 45%, white);
}
```

`--brand-ink` es el texto que se apoya sobre `--brand`: blanco en claro, casi negro en oscuro.
`.btn-primary` pasa de `bg-brand text-white` a `bg-brand text-brand-ink`.

`demo.config.js` no se modifica. Un cuarto perfil de cliente obtiene tema oscuro sin trabajo extra.

### 5.3 Mapa de Tailwind

`tailwind.config.js` deja de contener hex y apunta cada clave a su variable. **Se conservan
los nombres de clave actuales** (`ink2`, `muted2`, `line2`) para que las clases que ya
funcionan sigan funcionando; se agregan claves nuevas para los literales barridos.

```js
colors: {
  canvas: 'var(--canvas)',
  surface: 'var(--surface)',
  surface2: 'var(--surface-2)',
  surface3: 'var(--surface-3)',
  line: 'var(--line)',
  line2: 'var(--line-2)',
  linestrong: 'var(--line-strong)',
  ink: 'var(--ink)',
  ink2: 'var(--ink-2)',
  muted: 'var(--muted)',
  muted2: 'var(--muted-2)',
  muted3: 'var(--muted-3)',
  brand: { DEFAULT: 'var(--brand)', dark: 'var(--brand-dark)',
           soft: 'var(--brand-soft)', ink: 'var(--brand-ink)' },
  secondary: 'var(--secondary)',
  ok:   { DEFAULT: 'var(--ok-fg)',   soft: 'var(--ok-bg)' },
  warn: { DEFAULT: 'var(--warn-fg)', soft: 'var(--warn-bg)' },
  bad:  { DEFAULT: 'var(--bad-fg)',  soft: 'var(--bad-bg)' },
  info: { DEFAULT: 'var(--info-fg)', soft: 'var(--info-bg)' },
  vio:  { DEFAULT: 'var(--vio-fg)',  soft: 'var(--vio-bg)' },
  grey: { DEFAULT: 'var(--grey-fg)', soft: 'var(--grey-bg)' }
}
```

### 5.4 `tono()` conserva su firma

`TONOS` pasa a devolver `var(--ok-fg)` / `var(--ok-bg)` en lugar de hex. La forma `{fg, bg}`
no cambia, así que **los ~15 puntos de uso de insignias y `Chip` no se tocan**. Es el cambio
de mayor alcance con el menor diámetro de modificación del plan.

### 5.5 Contexto de tema

`src/context/ThemeContext.jsx`, siguiendo las convenciones de `ConfigContext` y `AuthContext`
(inicializador perezoso de `useState`, valor con `useMemo`, hook que lanza fuera del proveedor,
acceso a almacenamiento envuelto en `try/catch`):

- Estado `tema`: `'light' | 'dark'`; acción `alternarTema()`.
- Clave `rrhh-demo-theme`.
- Resolución al arrancar: valor guardado → `prefers-color-scheme: dark` → `'light'`.
- Mientras no haya valor guardado, escucha los cambios del sistema y sigue al sistema en vivo.
  Al elegir explícitamente, deja de seguirlo.
- Efecto: escribe `data-theme` en `document.documentElement`.

Orden de proveedores en `App.jsx`:

```
ConfigProvider > ThemeProvider > AuthProvider > (Login | SessionProvider > AppShell)
```

`ThemeProvider` queda por dentro de `ConfigProvider` (las variables de marca ya existen) y por
fuera de `AuthProvider`, para que **la pantalla de ingreso también tenga tema**.

### 5.6 Control de alternancia

Un componente compartido, `ThemeToggle`, en `src/components/ui/`:

- Botón de 38 px con ícono `light_mode` / `dark_mode`, con el estilo exacto del botón de
  notificaciones que ya existe en `Topbar`.
- `aria-label` que describe la acción destino ("Cambiar a tema oscuro" / "…claro") y
  `aria-pressed` con el estado.
- Se monta en `Topbar` junto a la campana y en `Login`, arriba a la derecha de la columna
  del formulario.

## 6. Archivos afectados

**Nuevos (2)**

- `src/context/ThemeContext.jsx`
- `src/components/ui/ThemeToggle.jsx` (exportado desde `components/ui/index.js`)

**Modificados (29)**

| Archivo | Cambio |
|---|---|
| `src/index.css` | Paleta de ambos temas; clases `.card`, `.input`, `.btn*`, `.th`, `.td`, `.chip`, `.label` y barra de desplazamiento pasan a tokens |
| `tailwind.config.js` | Colores hex → variables |
| `src/config/ConfigContext.jsx` | Escribe entradas crudas de marca |
| `src/App.jsx` | Monta `ThemeProvider` |
| `src/lib/format.js` | `TONOS` → variables |
| `src/components/ui/primitives.jsx` | `ProgressBar`/`BarList`/`ColumnChart` por defecto a tokens; `EmptyState`, `Toast`, `FilterBar`, `Select` |
| `src/components/ui/DataTable.jsx` | Encabezado, borde de fila y hover |
| `src/components/ui/Modal.jsx` | Superposición, botón de cierre, campo de sólo lectura |
| `src/components/ui/Tabs.jsx` | Pista y hover |
| `src/components/layout/Topbar.jsx` | Control de tema + 19 literales |
| `src/components/layout/Sidebar.jsx` | 8 literales |
| `src/components/layout/AppShell.jsx` | 1 literal |
| `src/modules/auth/Login.jsx` | Control de tema + 3 literales |
| 16 archivos de `src/modules/**` | Barrido de literales, incluidas las celdas de calendario de `Asistencia` y `Vacaciones` |

De los 27 archivos con hex, se barren 25: quedan fuera `data/generador.js` (ver abajo) y
`config/demo.config.js` (sus 12 hex son la marca de cada cliente — datos de configuración, no
cromo). A esos 25 se suman `index.css`, `tailwind.config.js`, `ConfigContext.jsx` y `App.jsx`,
que no contienen hex pero sí cambian.

**Excepción deliberada:** `src/data/generador.js` (21 literales) queda **sin tocar**. `HUES` y
`HUE_FG` son los colores de identidad de los avatares — datos generados, no cromo de interfaz —
y cada tinte claro va emparejado con su propio texto oscuro, así que los avatares siguen
legibles en tema oscuro. Tokenizarlos colapsaría las identidades en un solo color.

## 7. Verificación

1. `npm run build` sin errores.
2. **Auditoría de contraste automatizada** (extiende el guion CDP ya usado para el ingreso):
   recorre los 13 módulos en ambos temas, abre un modal y un menú desplegable donde existan,
   calcula la relación WCAG real de cada nodo de texto contra su fondo renderizado, y falla
   por debajo de 4.5:1 (3:1 para texto grande). Captura cada pantalla en ambos temas.
3. **Regresión de funcionalidad:** se vuelve a correr la batería de 27 comprobaciones del
   ingreso para probar que nada se rompió.
4. Persistencia: elección guardada sobrevive al refresco; sin valor guardado se sigue al
   sistema; el cambio de empresa conserva el tema.

Criterio de aceptación: cero fallos de contraste, cero errores de consola, las 27
comprobaciones del ingreso en verde, y el tema claro idéntico al actual píxel a píxel.

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| `color-mix()` no soportado en un navegador viejo | La declaración inválida se descarta y queda el valor previo (el tinte claro). Degradación visible pero no rota. Soportado en Chrome/Edge 111+, Safari 16.2+, Firefox 113+ |
| El tema claro se desvía al tokenizar | Los valores de la tabla de tokens son los hex actuales exactos; la auditoría captura ambos temas para comparar |
| Un literal se escapa del barrido | `grep -rE '#[0-9a-fA-F]{3,8}' src --include='*.jsx'` debe devolver sólo `generador.js` al terminar |
| Contraste de marca insuficiente en oscuro para un perfil | La auditoría corre sobre los tres perfiles, no sólo el predeterminado |

## 9. Trabajo futuro fuera de alcance

- El panel de marca del ingreso conserva el degradado saturado en ambos temas (es identidad,
  no cromo). Si molestara en oscuro, se le agrega una capa de oscurecimiento.
- El proyecto no tiene corredor de pruebas; la verificación es por guion CDP. Montar Vitest +
  Testing Library sería su propia tarea.
