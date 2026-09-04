# Sistema RRHH — Demo comercial configurable

Demo local del sistema de gestión de Recursos Humanos, preparada para presentarse en vivo a
clientes potenciales. React + Vite + Tailwind CSS, **datos de demostración ficticios** y una capa
de configuración central que permite adaptar la demo a otra empresa sin tocar las pantallas.

Empresa por defecto: **Red Federal Estaciones** (Estaciones de Servicio, Argentina, ARS).
Toda la interfaz está en español (Argentina): fechas DD/MM/AAAA, horarios de 24 h, montos en ARS.

La plataforma de producción se desarrolla por separado en otro repositorio.

---

## Configuración de la demo (un solo archivo)

`src/config/demo.config.js` define **todo** lo específico de cada empresa:

| Bloque | Contiene |
|---|---|
| `company` | nombre, nombre corto, iniciales, industria, país, moneda, datos de contacto |
| `branding` | color primario, color secundario, logo, favicon |
| `localization` | idioma, locale, formato de fecha, formato de hora, moneda |
| `demoUser` | nombre, rol y avatar del usuario de la demo |
| `catalog` | sucursales, áreas, puestos, turnos, cursos, EPP, tipos de documento, competencias, dispositivos de fichada, anuncios, convenio |

Los colores se aplican como variables CSS (`--brand`, `--brand-dark`, `--brand-soft`,
`--secondary`) que Tailwind consume vía `bg-brand`, `text-brand`, `bg-brand-soft`, etc.
Ningún componente tiene el nombre de la empresa, un color de marca ni una sucursal escritos a mano.

### Selector de empresa de la demo

El bloque de marca del sidebar abre un selector con tres perfiles ficticios:

1. **Red Federal Estaciones** — Estaciones de Servicio
2. **Grupo Horizonte** — Retail
3. **Logística Austral** — Logística

Al cambiar de perfil se actualizan nombre, logo, colores, sucursales, áreas, puestos, turnos,
cursos, EPP, anuncios, empleados y todas las métricas del dashboard. La elección se recuerda en
`localStorage`. Para dejar habilitada solo la empresa por defecto: `CLIENT_SWITCHER_ENABLED = false`
en `demo.config.js`.

El indicador **“Entorno de demostración”** aparece de forma discreta en la barra superior y en el
pie del sidebar (texto configurable en `DEMO_ENV_LABEL`).

---

## 1. Instalar dependencias

Requiere Node.js 18 o superior.

```bash
cd app
npm install
```

## 2. Correr el proyecto localmente

```bash
npm run dev        # http://localhost:5173
```

Otros comandos:

```bash
npm run build      # build de producción en dist/
npm run preview    # sirve el build para verificarlo
```

## 3. Estructura de carpetas

```
app/
├── index.html                 Punto de entrada (fuentes + #root)
├── package.json               Dependencias y scripts
├── vite.config.js             Vite + alias "@" → src/ (+ proxy /api comentado)
├── tailwind.config.js         Paleta, tipografías y animaciones del diseño aprobado
├── postcss.config.js
├── public/
│   ├── logo.svg               Marca por defecto
│   ├── logo-horizonte.svg
│   └── logo-austral.svg
└── src/
    ├── main.jsx               Bootstrap de React
    ├── App.jsx                ConfigProvider + SessionProvider + AppShell
    ├── index.css              Tailwind + variables de marca + clases base
    ├── config/                CONFIGURACIÓN CENTRAL DE LA DEMO
    │   ├── demo.config.js     Perfiles de empresa (marca, localización, catálogos)
    │   └── ConfigContext.jsx  Perfil activo, cambio de empresa, colores, favicon, título
    ├── api/                   CAPA DE ACCESO A DATOS (única que tocan los módulos)
    │   ├── client.js          request/resolve + registro de auditoría
    │   └── index.js           empleadosApi, asistenciaApi, turnosApi, licenciasApi,
    │                          nominaApi, adelantosApi, desempenoApi, documentosApi,
    │                          capacitacionesApi, anunciosApi, reportesApi, adminApi,
    │                          dashboardApi
    ├── data/                  DATOS DE DEMOSTRACIÓN (ficticios)
    │   ├── catalogos.js       Genéricos: nombres, roles, feriados, tipos de licencia
    │   ├── generador.js       Generador determinístico parametrizado por el catálogo del perfil
    │   └── database.js        Dataset normalizado en memoria, uno por perfil (con caché)
    ├── lib/
    │   ├── permissions.js     Entidades, habilidades CRUD y matriz de permisos por rol
    │   └── format.js          ARS, fechas, porcentajes y tonos de estado
    ├── context/
    │   └── SessionContext.jsx Rol activo, sucursal, filtros, búsqueda, toasts, ctx de API
    ├── components/
    │   ├── layout/            AppShell, Sidebar, Topbar
    │   └── ui/                Componentes reutilizables: Icon, Chip, Avatar, Card, Panel,
    │                          ProgressBar, BarList, ColumnChart, KpiCard, StatCard,
    │                          DataTable, Modal, ModalFooter, FormFields, Tabs,
    │                          FilterBar, Select, EmptyState, Toast
    └── modules/               UN MÓDULO POR SECCIÓN DEL SISTEMA
        ├── registry.js        Registro de módulos (sidebar + router + títulos)
        ├── inicio/
        ├── empleados/         Empleados.jsx + EmpleadoPerfil.jsx (8 pestañas)
        ├── asistencia/        Asistencia.jsx + HikvisionWizard.jsx (6 pasos)
        ├── turnos/
        ├── vacaciones/
        ├── nomina/            Nomina.jsx + ReciboModal.jsx
        ├── adelantos/
        ├── desempeno/
        ├── documentacion/
        ├── capacitaciones/
        ├── anuncios/
        ├── reportes/
        └── administracion/    Incluye la pestaña "Modelo de datos"
```

Regla de dependencias: `modules/*` → `api/*` → `data/*`.
Ningún componente importa `src/data` directamente (salvo catálogos estáticos para poblar
selects), así que el día que exista backend sólo cambia `src/api`.

## 4. Dónde están los datos de la demo

- `src/config/demo.config.js` — catálogos por empresa: sucursales, áreas, puestos, turnos,
  cursos, EPP, tipos de documento, competencias, dispositivos de fichada y anuncios.
- `src/data/catalogos.js` — listas genéricas: nombres y apellidos, tipos de licencia, roles,
  feriados nacionales 2026, usuarios del sistema.
- `src/data/generador.js` — generación determinística de empleados, fichadas del día, detalle por
  legajo (asistencia, documentos, cursos, EPP, competencias, recibos), solicitudes de licencia,
  adelantos e incidencias de fichadas. Recibe el catálogo del perfil activo.
- `src/data/database.js` — arma el dataset normalizado en memoria de cada perfil
  (`employees`, `attendance_records`, `attendance_incidents`, `leave_requests`, `leave_balances`,
  `payroll_periods`, `payslips`, `salary_advances`, `documents`, `training_records`,
  `performance_reviews`, `equipment_issues`, `announcements`, `users`, `roles`, `holidays`,
  `import_batches`, `audit_log`, …).

La semilla es fija: cada recarga muestra exactamente los mismos datos. Todos los datos son
ficticios; no hay información real de personas.

### Escenarios incluidos para la presentación

Empleados en distintas sucursales, turnos rotativos y nocturnos, llegadas tarde, ausencias
justificadas e injustificadas, horas extra, francos, solicitudes de vacaciones y licencias médicas
pendientes de aprobación, adelantos de sueldo a revisar, fichadas sin salida, documentos próximos
a vencer, capacitación obligatoria pendiente, cumpleaños y aniversarios del mes, y una sucursal
con falta de personal en el turno nocturno.

## 5. Qué archivos conectar cuando exista backend

(La producción se construye en otro repositorio; esta demo no depende de ningún backend,
autenticación externa ni API.)

| Archivo | Qué cambiar |
|---|---|
| `src/api/client.js` | Reemplazar `resolve()`/`tabla()` por `fetch` a `VITE_API_URL` (el ejemplo comentado ya está en el archivo). Auth por Sanctum: `credentials: 'include'`. |
| `src/api/index.js` | Cambiar el cuerpo de cada método por su endpoint. Las firmas y los tipos de retorno no cambian. |
| `src/lib/permissions.js` | La matriz debe pasar a venir del backend (`GET /api/me`). |
| `src/context/SessionContext.jsx` | Reemplazar el rol elegible por el usuario autenticado real. |
| `src/config/demo.config.js` | Los datos de empresa pasan a venir de la organización del tenant. |
| `src/data/**` | Se elimina por completo cuando la API responde datos reales. |

Endpoints sugeridos para el primer sprint de backend:

```
GET    /api/employees                     GET  /api/attendance?date=
POST   /api/employees                     POST /api/attendance/import
PUT    /api/employees/{id}                POST /api/attendance-incidents/{id}/resolve
GET    /api/leave-requests                POST /api/leave-requests/{id}/approve|reject
GET    /api/leave-balances                GET  /api/payroll-periods/{id}/payslips
GET    /api/salary-advances               POST /api/salary-advances/{id}/approve|reject
GET    /api/documents?status=              POST /api/documents
GET    /api/trainings/compliance          POST /api/trainings/{id}/assign
GET    /api/announcements                 POST /api/announcements
GET    /api/reports/{slug}?filters        GET  /api/reports/{slug}/export?format=
```

El detalle del esquema (tablas, claves foráneas, índices sugeridos, alcance por rol y
operaciones por controlador) está en `../HR-ARQUITECTURA.md`.

## Roles para probar la demo

El selector de rol del pie del sidebar cambia el alcance de datos y las acciones visibles:

| Rol | Qué ve |
|---|---|
| Recursos Humanos | Todo el ciclo de RRHH de la red |
| Administrador | Todo, incluida la configuración y los usuarios |
| Gerencia | Lectura y exportación; aprueba licencias y adelantos |
| Encargado de sucursal | Su estación |
| Supervisor | Su equipo/turno |
| Empleado | Sólo su legajo, sus solicitudes y sus recibos |
