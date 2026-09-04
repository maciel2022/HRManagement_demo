// ============================================================================
// CONFIGURACIÓN CENTRAL DE LA DEMO
// Todo lo específico de cada empresa vive acá. Ningún componente de UI define
// nombres, colores, sucursales, áreas, puestos, turnos, cursos ni EPP.
// Para adaptar la demo a otro cliente: agregar/editar un perfil y listo.
// ============================================================================

export const DEMO_ENV_LABEL = 'Entorno de demostración';

// Perfil activo por defecto
export const DEFAULT_PROFILE_ID = 'red-federal';

// Mostrar u ocultar el selector de empresa de la demo
export const CLIENT_SWITCHER_ENABLED = true;

// Acceso de prueba de la pantalla de ingreso (único para todos los perfiles)
export const ACCESO_DEMO = { email: 'demo@redfederal.com', password: 'demo123' };

const REDES_ARG = { country: 'Argentina', locale: 'es-AR', language: 'es-AR', currency: 'ARS', currencySymbol: '$', dateFormat: 'DD/MM/YYYY', timeFormat: '24h' };

export const DEMO_PROFILES = [
  // --------------------------------------------------------------------------
  // 1. Estaciones de servicio (perfil por defecto)
  // --------------------------------------------------------------------------
  {
    id: 'red-federal',
    company: {
      name: 'Red Federal Estaciones',
      shortName: 'Red Federal',
      initials: 'RF',
      industry: 'Estaciones de Servicio',
      tagline: 'Gestión de Personas',
      country: 'Argentina',
      currency: 'ARS',
      contact: {
        address: 'Av. Belgrano 1240, CABA',
        phone: '+54 11 4000-1200',
        email: 'rrhh@redfederal.com.ar',
        web: 'redfederal.com.ar'
      }
    },
    branding: {
      primaryColor: '#12665c',
      primaryDark: '#0d4a43',
      primarySoft: '#e6f0ee',
      secondaryColor: '#9a6a10',
      logo: '/logo.svg',
      favicon: '/logo.svg'
    },
    localization: { ...REDES_ARG },
    demoUser: { name: 'Mariela Ferreyra', role: 'Recursos Humanos', initials: 'MF', avatar: null },
    catalog: {
      emailDomain: 'redfederal.com.ar',
      unidad: 'Estación',
      branches: [
        { name: 'Estación Centro', address: 'Av. Corrientes 2340', city: 'CABA', province: 'Buenos Aires' },
        { name: 'Estación Constitución', address: 'Lima 1580', city: 'CABA', province: 'Buenos Aires' },
        { name: 'Estación Puerto', address: 'Av. Costanera 450', city: 'Mar del Plata', province: 'Buenos Aires' },
        { name: 'Estación Ruta 2', address: 'Ruta 2 Km 45,5', city: 'Cañuelas', province: 'Buenos Aires' },
        { name: 'Estación Independencia', address: 'Av. Independencia 3120', city: 'La Plata', province: 'Buenos Aires' }
      ],
      departments: [
        { name: 'Playa', positions: ['Playero', 'Playero senior'], salaryRange: [820000, 960000], weight: 20 },
        { name: 'Tienda', positions: ['Vendedor de tienda', 'Repositor'], salaryRange: [790000, 880000], weight: 9 },
        { name: 'Caja', positions: ['Cajero', 'Cajero senior'], salaryRange: [860000, 980000], weight: 8 },
        { name: 'Administración', positions: ['Administrativo', 'Analista administrativo'], salaryRange: [1050000, 1280000], weight: 5 },
        { name: 'Supervisión', positions: ['Supervisor de turno'], salaryRange: [1420000, 1620000], weight: 6 },
        { name: 'Encargados', positions: ['Encargado de estación'], salaryRange: [1780000, 1950000], weight: 5 },
        { name: 'Mantenimiento', positions: ['Operario de mantenimiento'], salaryRange: [900000, 1020000], weight: 4 },
        { name: 'Limpieza', positions: ['Auxiliar de limpieza'], salaryRange: [740000, 800000], weight: 4 },
        { name: 'Recursos Humanos', positions: ['Analista de RRHH', 'Responsable de RRHH'], salaryRange: [1200000, 1650000], weight: 3 },
        { name: 'Gerencia', positions: ['Gerente de operaciones', 'Gerente general'], salaryRange: [2600000, 3400000], weight: 2 }
      ],
      officeDepartments: ['Gerencia', 'Recursos Humanos', 'Administración'],
      managerDepartment: 'Encargados',
      shifts: [
        { name: 'Mañana', start: '06:00', end: '14:00', tolerance: 10, night: false, rotating: false, required: 5 },
        { name: 'Tarde', start: '14:00', end: '22:00', tolerance: 10, night: false, rotating: false, required: 5 },
        { name: 'Noche', start: '22:00', end: '06:00', tolerance: 15, night: true, rotating: false, required: 3 },
        { name: 'Rotativo', start: null, end: null, tolerance: 10, night: null, rotating: true, required: 0 }
      ],
      trainings: [
        { name: 'Seguridad e higiene', mandatory: true, hours: 8, validityMonths: 12 },
        { name: 'Prevención de incendios', mandatory: true, hours: 6, validityMonths: 12 },
        { name: 'Manipulación segura de combustibles', mandatory: true, hours: 10, validityMonths: 24 },
        { name: 'Uso de EPP', mandatory: true, hours: 4, validityMonths: 12 },
        { name: 'Atención al cliente', mandatory: false, hours: 6, validityMonths: null },
        { name: 'Manejo de caja', mandatory: false, hours: 8, validityMonths: null },
        { name: 'Primeros auxilios', mandatory: false, hours: 12, validityMonths: 24 },
        { name: 'Procedimientos internos', mandatory: true, hours: 4, validityMonths: 12 }
      ],
      cursoCritico: 'Manipulación segura de combustibles',
      ppe: [
        { name: 'Uniforme de playa (camisa + pantalón)', ppe: false, replacementMonths: 6, qty: '2' },
        { name: 'Calzado de seguridad', ppe: true, replacementMonths: 12, qty: '1' },
        { name: 'Chaleco reflectivo', ppe: true, replacementMonths: 9, qty: '2' },
        { name: 'Guantes de nitrilo', ppe: true, replacementMonths: 3, qty: '6' },
        { name: 'Campera impermeable', ppe: true, replacementMonths: 24, qty: '1' }
      ],
      documentTypes: [
        'DNI', 'CUIL', 'Contrato de trabajo', 'Certificado de domicilio',
        'Carnet de manipulación de combustibles', 'Certificado médico preocupacional',
        'Constancia de capacitación EPP', 'Libreta sanitaria'
      ],
      documentoCritico: 'Carnet de manipulación de combustibles',
      competencies: [
        'Atención al cliente', 'Puntualidad', 'Responsabilidad', 'Trabajo en equipo',
        'Cumplimiento de procedimientos', 'Seguridad', 'Manejo de caja', 'Resolución de problemas'
      ],
      devices: ['DS-K1T804 Playa', 'DS-K1T671 Ingreso', 'DS-K1T343 Tienda'],
      accessPoints: ['Molinete ingreso', 'Reloj playa', 'Acceso oficinas'],
      announcements: [
        { id: 1, title: 'Nuevo procedimiento de cierre de caja', body: 'Desde el 08/09 el cierre de caja se realiza con doble firma: cajero y encargado de turno. El formulario nuevo está disponible en la intranet.', audience: 'Toda la empresa', priority: 'Alta', published_at: '02/09/2026 18:20', author: 'Recursos Humanos' },
        { id: 2, title: 'Cambio de horarios — Estación Ruta 2', body: 'Durante la obra de repavimentación, el turno Noche comienza a las 23:00 hasta el 20/09. Se abona el adicional correspondiente.', audience: 'Estación Ruta 2', priority: 'Alta', published_at: '01/09/2026 09:05', author: 'Operaciones' },
        { id: 3, title: 'Capacitación obligatoria: manipulación de combustibles', body: 'Comisión el 11/09 de 09:00 a 13:00 en Estación Centro. Presentismo obligatorio para playa y encargados.', audience: 'Playa · Encargados', priority: 'Alta', published_at: '31/08/2026 12:40', author: 'Seguridad e Higiene' },
        { id: 4, title: 'Cumpleaños de septiembre', body: 'Saludamos a los compañeros que cumplen años este mes. El brindis mensual será el viernes 26/09 en la oficina central.', audience: 'Toda la empresa', priority: 'Informativa', published_at: '30/08/2026 10:00', author: 'Recursos Humanos' },
        { id: 5, title: 'Aniversarios laborales', body: 'Este mes celebramos 10 años de trayectoria de dos compañeros de Estación Constitución y 5 años de tres compañeros de Puerto.', audience: 'Toda la empresa', priority: 'Informativa', published_at: '30/08/2026 09:30', author: 'Recursos Humanos' },
        { id: 6, title: 'Feriado del 12/10 — cronograma de guardias', body: 'Las estaciones operan con dotación reducida. El cronograma de guardias se publica el 25/09 y el trabajo en feriado se abona al 100%.', audience: 'Toda la empresa', priority: 'Media', published_at: '29/08/2026 16:15', author: 'Operaciones' },
        { id: 7, title: 'Nuevo convenio con farmacias', body: 'Beneficio de 15% de descuento presentando la credencial de la empresa en farmacias adheridas.', audience: 'Toda la empresa', priority: 'Media', published_at: '28/08/2026 11:00', author: 'Beneficios' }
      ],
      convenio: 'Convenio estaciones de servicio',
      aniversarioEmpresa: ['2026-09-15', '15/09/2026', 'Aniversario de la empresa']
    }
  },

  // --------------------------------------------------------------------------
  // 2. Retail
  // --------------------------------------------------------------------------
  {
    id: 'grupo-horizonte',
    company: {
      name: 'Grupo Horizonte',
      shortName: 'Horizonte',
      initials: 'GH',
      industry: 'Retail',
      tagline: 'Gestión de Personas',
      country: 'Argentina',
      currency: 'ARS',
      contact: {
        address: 'Av. Santa Fe 3480, CABA',
        phone: '+54 11 5200-8800',
        email: 'personas@grupohorizonte.com.ar',
        web: 'grupohorizonte.com.ar'
      }
    },
    branding: {
      primaryColor: '#2f5fa8',
      primaryDark: '#22467c',
      primarySoft: '#e9eff9',
      secondaryColor: '#6b4a9e',
      logo: '/logo-horizonte.svg',
      favicon: '/logo-horizonte.svg'
    },
    localization: { ...REDES_ARG },
    demoUser: { name: 'Verónica Ledesma', role: 'Recursos Humanos', initials: 'VL', avatar: null },
    catalog: {
      emailDomain: 'grupohorizonte.com.ar',
      unidad: 'Sucursal',
      branches: [
        { name: 'Sucursal Alto Palermo', address: 'Av. Santa Fe 3253', city: 'CABA', province: 'Buenos Aires' },
        { name: 'Sucursal Unicenter', address: 'Paraná 3745', city: 'Martínez', province: 'Buenos Aires' },
        { name: 'Sucursal Córdoba Shopping', address: 'Av. Rafael Núñez 3675', city: 'Córdoba', province: 'Córdoba' },
        { name: 'Sucursal Rosario Centro', address: 'Córdoba 1250', city: 'Rosario', province: 'Santa Fe' },
        { name: 'Sucursal Mendoza Plaza', address: 'Av. Acceso Este 3280', city: 'Guaymallén', province: 'Mendoza' }
      ],
      departments: [
        { name: 'Salón', positions: ['Vendedor de salón', 'Vendedor senior'], salaryRange: [840000, 980000], weight: 20 },
        { name: 'Caja', positions: ['Cajero', 'Cajero senior'], salaryRange: [860000, 990000], weight: 9 },
        { name: 'Depósito', positions: ['Repositor', 'Operario de depósito'], salaryRange: [800000, 900000], weight: 8 },
        { name: 'Visual', positions: ['Visual merchandiser'], salaryRange: [1000000, 1180000], weight: 4 },
        { name: 'Supervisión', positions: ['Supervisor de piso'], salaryRange: [1450000, 1650000], weight: 6 },
        { name: 'Encargados', positions: ['Encargado de sucursal'], salaryRange: [1800000, 2000000], weight: 5 },
        { name: 'Administración', positions: ['Administrativo', 'Analista de compras'], salaryRange: [1080000, 1300000], weight: 5 },
        { name: 'Limpieza', positions: ['Auxiliar de limpieza'], salaryRange: [740000, 810000], weight: 4 },
        { name: 'Recursos Humanos', positions: ['Analista de RRHH', 'Responsable de RRHH'], salaryRange: [1200000, 1650000], weight: 3 },
        { name: 'Gerencia', positions: ['Gerente comercial', 'Gerente general'], salaryRange: [2600000, 3500000], weight: 2 }
      ],
      officeDepartments: ['Gerencia', 'Recursos Humanos', 'Administración'],
      managerDepartment: 'Encargados',
      shifts: [
        { name: 'Mañana', start: '09:00', end: '17:00', tolerance: 10, night: false, rotating: false, required: 6 },
        { name: 'Tarde', start: '14:00', end: '22:00', tolerance: 10, night: false, rotating: false, required: 6 },
        { name: 'Noche', start: '22:00', end: '06:00', tolerance: 15, night: true, rotating: false, required: 2 },
        { name: 'Rotativo', start: null, end: null, tolerance: 10, night: null, rotating: true, required: 0 }
      ],
      trainings: [
        { name: 'Seguridad e higiene', mandatory: true, hours: 8, validityMonths: 12 },
        { name: 'Prevención de incendios', mandatory: true, hours: 6, validityMonths: 12 },
        { name: 'Prevención de pérdidas', mandatory: true, hours: 6, validityMonths: 24 },
        { name: 'Uso de EPP', mandatory: true, hours: 4, validityMonths: 12 },
        { name: 'Experiencia del cliente', mandatory: false, hours: 8, validityMonths: null },
        { name: 'Manejo de caja y medios de pago', mandatory: false, hours: 8, validityMonths: null },
        { name: 'Primeros auxilios', mandatory: false, hours: 12, validityMonths: 24 },
        { name: 'Procedimientos internos', mandatory: true, hours: 4, validityMonths: 12 }
      ],
      cursoCritico: 'Prevención de pérdidas',
      ppe: [
        { name: 'Uniforme de salón (blazer + pantalón)', ppe: false, replacementMonths: 6, qty: '2' },
        { name: 'Calzado antideslizante', ppe: true, replacementMonths: 12, qty: '1' },
        { name: 'Faja lumbar (depósito)', ppe: true, replacementMonths: 9, qty: '1' },
        { name: 'Guantes de manipulación', ppe: true, replacementMonths: 3, qty: '6' },
        { name: 'Credencial identificatoria', ppe: false, replacementMonths: 24, qty: '1' }
      ],
      documentTypes: [
        'DNI', 'CUIL', 'Contrato de trabajo', 'Certificado de domicilio',
        'Certificado de antecedentes', 'Certificado médico preocupacional',
        'Constancia de capacitación EPP', 'Libreta sanitaria'
      ],
      documentoCritico: 'Certificado de antecedentes',
      competencies: [
        'Experiencia del cliente', 'Puntualidad', 'Responsabilidad', 'Trabajo en equipo',
        'Cumplimiento de procedimientos', 'Prevención de pérdidas', 'Manejo de caja', 'Resolución de problemas'
      ],
      devices: ['DS-K1T804 Salón', 'DS-K1T671 Ingreso personal', 'DS-K1T343 Depósito'],
      accessPoints: ['Molinete ingreso', 'Reloj salón', 'Acceso depósito'],
      announcements: [
        { id: 1, title: 'Nuevo procedimiento de cierre de caja', body: 'Desde el 08/09 el cierre de caja se realiza con doble firma: cajero y encargado de turno. El formulario nuevo está disponible en la intranet.', audience: 'Toda la empresa', priority: 'Alta', published_at: '02/09/2026 18:20', author: 'Recursos Humanos' },
        { id: 2, title: 'Extensión horaria — Sucursal Unicenter', body: 'Por la campaña de primavera, el turno Tarde se extiende hasta las 23:00 del 12/09 al 30/09. Se abona el adicional correspondiente.', audience: 'Sucursal Unicenter', priority: 'Alta', published_at: '01/09/2026 09:05', author: 'Operaciones' },
        { id: 3, title: 'Capacitación obligatoria: prevención de pérdidas', body: 'Comisión el 11/09 de 09:00 a 13:00 en Alto Palermo. Presentismo obligatorio para salón, caja y encargados.', audience: 'Salón · Caja · Encargados', priority: 'Alta', published_at: '31/08/2026 12:40', author: 'Seguridad e Higiene' },
        { id: 4, title: 'Cumpleaños de septiembre', body: 'Saludamos a los compañeros que cumplen años este mes. El brindis mensual será el viernes 26/09 en la oficina central.', audience: 'Toda la empresa', priority: 'Informativa', published_at: '30/08/2026 10:00', author: 'Recursos Humanos' },
        { id: 5, title: 'Aniversarios laborales', body: 'Este mes celebramos 10 años de trayectoria de dos compañeras de Rosario Centro y 5 años de tres compañeros de Córdoba Shopping.', audience: 'Toda la empresa', priority: 'Informativa', published_at: '30/08/2026 09:30', author: 'Recursos Humanos' },
        { id: 6, title: 'Feriado del 12/10 — cronograma de guardias', body: 'Los locales operan con dotación reducida. El cronograma se publica el 25/09 y el trabajo en feriado se abona al 100%.', audience: 'Toda la empresa', priority: 'Media', published_at: '29/08/2026 16:15', author: 'Operaciones' },
        { id: 7, title: 'Nuevo convenio con farmacias', body: 'Beneficio de 15% de descuento presentando la credencial de la empresa en farmacias adheridas.', audience: 'Toda la empresa', priority: 'Media', published_at: '28/08/2026 11:00', author: 'Beneficios' }
      ],
      convenio: 'Convenio empleados de comercio',
      aniversarioEmpresa: ['2026-09-15', '15/09/2026', 'Aniversario de la empresa']
    }
  },

  // --------------------------------------------------------------------------
  // 3. Logística
  // --------------------------------------------------------------------------
  {
    id: 'logistica-austral',
    company: {
      name: 'Logística Austral',
      shortName: 'Austral',
      initials: 'LA',
      industry: 'Logística',
      tagline: 'Gestión de Personas',
      country: 'Argentina',
      currency: 'ARS',
      contact: {
        address: 'Parque Industrial Pilar, Colectora 1450',
        phone: '+54 230 442-9000',
        email: 'rrhh@logisticaaustral.com.ar',
        web: 'logisticaaustral.com.ar'
      }
    },
    branding: {
      primaryColor: '#8a4b1f',
      primaryDark: '#663615',
      primarySoft: '#f6ece3',
      secondaryColor: '#2f5fa8',
      logo: '/logo-austral.svg',
      favicon: '/logo-austral.svg'
    },
    localization: { ...REDES_ARG },
    demoUser: { name: 'Hernán Villanueva', role: 'Recursos Humanos', initials: 'HV', avatar: null },
    catalog: {
      emailDomain: 'logisticaaustral.com.ar',
      unidad: 'Centro',
      branches: [
        { name: 'Centro Pilar', address: 'Colectora Panamericana 1450', city: 'Pilar', province: 'Buenos Aires' },
        { name: 'Centro Avellaneda', address: 'Av. Mitre 2870', city: 'Avellaneda', province: 'Buenos Aires' },
        { name: 'Centro Rosario', address: 'Ruta 9 Km 285', city: 'Rosario', province: 'Santa Fe' },
        { name: 'Centro Córdoba', address: 'Av. Circunvalación 4100', city: 'Córdoba', province: 'Córdoba' },
        { name: 'Centro Neuquén', address: 'Ruta 22 Km 1210', city: 'Neuquén', province: 'Neuquén' }
      ],
      departments: [
        { name: 'Depósito', positions: ['Operario de depósito', 'Preparador de pedidos'], salaryRange: [860000, 1000000], weight: 20 },
        { name: 'Distribución', positions: ['Chofer de reparto', 'Chofer de larga distancia'], salaryRange: [1050000, 1350000], weight: 12 },
        { name: 'Autoelevadores', positions: ['Operador de autoelevador'], salaryRange: [980000, 1120000], weight: 6 },
        { name: 'Control de stock', positions: ['Controlador de stock'], salaryRange: [920000, 1060000], weight: 5 },
        { name: 'Supervisión', positions: ['Supervisor de turno'], salaryRange: [1480000, 1700000], weight: 6 },
        { name: 'Encargados', positions: ['Jefe de centro'], salaryRange: [1850000, 2100000], weight: 5 },
        { name: 'Mantenimiento', positions: ['Mecánico de flota'], salaryRange: [1000000, 1180000], weight: 4 },
        { name: 'Administración', positions: ['Administrativo', 'Analista de operaciones'], salaryRange: [1080000, 1320000], weight: 4 },
        { name: 'Recursos Humanos', positions: ['Analista de RRHH', 'Responsable de RRHH'], salaryRange: [1200000, 1650000], weight: 3 },
        { name: 'Gerencia', positions: ['Gerente de operaciones', 'Gerente general'], salaryRange: [2700000, 3600000], weight: 2 }
      ],
      officeDepartments: ['Gerencia', 'Recursos Humanos', 'Administración'],
      managerDepartment: 'Encargados',
      shifts: [
        { name: 'Mañana', start: '06:00', end: '14:00', tolerance: 10, night: false, rotating: false, required: 6 },
        { name: 'Tarde', start: '14:00', end: '22:00', tolerance: 10, night: false, rotating: false, required: 5 },
        { name: 'Noche', start: '22:00', end: '06:00', tolerance: 15, night: true, rotating: false, required: 4 },
        { name: 'Rotativo', start: null, end: null, tolerance: 10, night: null, rotating: true, required: 0 }
      ],
      trainings: [
        { name: 'Seguridad e higiene', mandatory: true, hours: 8, validityMonths: 12 },
        { name: 'Prevención de incendios', mandatory: true, hours: 6, validityMonths: 12 },
        { name: 'Manejo defensivo', mandatory: true, hours: 10, validityMonths: 24 },
        { name: 'Uso de EPP', mandatory: true, hours: 4, validityMonths: 12 },
        { name: 'Operación de autoelevador', mandatory: true, hours: 12, validityMonths: 24 },
        { name: 'Carga y descarga segura', mandatory: false, hours: 6, validityMonths: null },
        { name: 'Primeros auxilios', mandatory: false, hours: 12, validityMonths: 24 },
        { name: 'Procedimientos internos', mandatory: true, hours: 4, validityMonths: 12 }
      ],
      cursoCritico: 'Manejo defensivo',
      ppe: [
        { name: 'Uniforme de depósito (camisa + pantalón)', ppe: false, replacementMonths: 6, qty: '2' },
        { name: 'Calzado de seguridad con puntera', ppe: true, replacementMonths: 12, qty: '1' },
        { name: 'Chaleco reflectivo', ppe: true, replacementMonths: 9, qty: '2' },
        { name: 'Guantes anticorte', ppe: true, replacementMonths: 3, qty: '6' },
        { name: 'Faja lumbar', ppe: true, replacementMonths: 24, qty: '1' }
      ],
      documentTypes: [
        'DNI', 'CUIL', 'Contrato de trabajo', 'Certificado de domicilio',
        'Licencia nacional de conducir profesional', 'Certificado médico preocupacional',
        'Constancia de capacitación EPP', 'CNRT — libreta de trabajo'
      ],
      documentoCritico: 'Licencia nacional de conducir profesional',
      competencies: [
        'Atención al cliente interno', 'Puntualidad', 'Responsabilidad', 'Trabajo en equipo',
        'Cumplimiento de procedimientos', 'Seguridad vial', 'Cuidado de la mercadería', 'Resolución de problemas'
      ],
      devices: ['DS-K1T804 Depósito', 'DS-K1T671 Portería', 'DS-K1T343 Playa de camiones'],
      accessPoints: ['Molinete portería', 'Reloj depósito', 'Acceso oficinas'],
      announcements: [
        { id: 1, title: 'Nuevo procedimiento de precintado', body: 'Desde el 08/09 el precintado de unidades se registra con doble firma: chofer y supervisor de turno. El formulario está disponible en la intranet.', audience: 'Toda la empresa', priority: 'Alta', published_at: '02/09/2026 18:20', author: 'Recursos Humanos' },
        { id: 2, title: 'Cambio de horarios — Centro Rosario', body: 'Por obras en el acceso, el turno Noche comienza a las 23:00 hasta el 20/09. Se abona el adicional correspondiente.', audience: 'Centro Rosario', priority: 'Alta', published_at: '01/09/2026 09:05', author: 'Operaciones' },
        { id: 3, title: 'Capacitación obligatoria: manejo defensivo', body: 'Comisión el 11/09 de 09:00 a 13:00 en Centro Pilar. Presentismo obligatorio para distribución y jefes de centro.', audience: 'Distribución · Encargados', priority: 'Alta', published_at: '31/08/2026 12:40', author: 'Seguridad e Higiene' },
        { id: 4, title: 'Cumpleaños de septiembre', body: 'Saludamos a los compañeros que cumplen años este mes. El brindis mensual será el viernes 26/09 en la oficina central.', audience: 'Toda la empresa', priority: 'Informativa', published_at: '30/08/2026 10:00', author: 'Recursos Humanos' },
        { id: 5, title: 'Aniversarios laborales', body: 'Este mes celebramos 10 años de trayectoria de dos compañeros de Centro Avellaneda y 5 años de tres compañeros de Pilar.', audience: 'Toda la empresa', priority: 'Informativa', published_at: '30/08/2026 09:30', author: 'Recursos Humanos' },
        { id: 6, title: 'Feriado del 12/10 — cronograma de guardias', body: 'Los centros operan con dotación reducida. El cronograma se publica el 25/09 y el trabajo en feriado se abona al 100%.', audience: 'Toda la empresa', priority: 'Media', published_at: '29/08/2026 16:15', author: 'Operaciones' },
        { id: 7, title: 'Nuevo convenio con farmacias', body: 'Beneficio de 15% de descuento presentando la credencial de la empresa en farmacias adheridas.', audience: 'Toda la empresa', priority: 'Media', published_at: '28/08/2026 11:00', author: 'Beneficios' }
      ],
      convenio: 'Convenio de camioneros',
      aniversarioEmpresa: ['2026-09-15', '15/09/2026', 'Aniversario de la empresa']
    }
  }
];

export const perfilPorId = (id) => DEMO_PROFILES.find((p) => p.id === id) ?? DEMO_PROFILES[0];
