import Inicio from './inicio/Inicio';
import Empleados from './empleados/Empleados';
import Asistencia from './asistencia/Asistencia';
import Turnos from './turnos/Turnos';
import Vacaciones from './vacaciones/Vacaciones';
import Nomina from './nomina/Nomina';
import Adelantos from './adelantos/Adelantos';
import Desempeno from './desempeno/Desempeno';
import Documentacion from './documentacion/Documentacion';
import Capacitaciones from './capacitaciones/Capacitaciones';
import Anuncios from './anuncios/Anuncios';
import Reportes from './reportes/Reportes';
import Administracion from './administracion/Administracion';

// Registro único de módulos: el sidebar, el router y los títulos salen de acá.
export const MODULOS = [
  { id: 'inicio', label: 'Inicio', icon: 'space_dashboard', titulo: 'Dashboard Recursos Humanos', sub: 'Resumen operativo de la red al 03/09/2026', Component: Inicio },
  { id: 'empleados', label: 'Empleados', icon: 'groups', titulo: 'Empleados', sub: 'Directorio, legajos y perfiles del personal', Component: Empleados },
  { id: 'asistencia', label: 'Asistencia', icon: 'schedule', titulo: 'Asistencia', sub: 'Fichadas, incidencias y control diario de presentismo', Component: Asistencia },
  { id: 'turnos', label: 'Turnos', icon: 'calendar_view_week', titulo: 'Turnos', sub: 'Programación de turnos y cobertura por estación', Component: Turnos },
  { id: 'vacaciones', label: 'Vacaciones y Licencias', icon: 'beach_access', titulo: 'Vacaciones y Licencias', sub: 'Saldos, solicitudes y calendario de equipo', Component: Vacaciones },
  { id: 'nomina', label: 'Nómina', icon: 'payments', titulo: 'Nómina', sub: 'Liquidaciones mensuales y recibos de sueldo', Component: Nomina },
  { id: 'adelantos', label: 'Adelantos', icon: 'request_quote', titulo: 'Adelantos de sueldo', sub: 'Solicitudes, aprobaciones y devoluciones', Component: Adelantos },
  { id: 'desempeno', label: 'Desempeño', icon: 'trending_up', titulo: 'Desempeño', sub: 'Evaluaciones, competencias y objetivos', Component: Desempeno },
  { id: 'documentacion', label: 'Documentación', icon: 'folder_shared', titulo: 'Documentación', sub: 'Documentos del legajo, vencimientos y entrega de EPP', Component: Documentacion },
  { id: 'capacitaciones', label: 'Capacitaciones', icon: 'school', titulo: 'Capacitaciones', sub: 'Cursos obligatorios y cumplimiento por sucursal', Component: Capacitaciones },
  { id: 'anuncios', label: 'Anuncios', icon: 'campaign', titulo: 'Anuncios', sub: 'Comunicados internos a la red', Component: Anuncios },
  { id: 'reportes', label: 'Reportes', icon: 'bar_chart', titulo: 'Reportes', sub: 'Informes de RRHH con filtros y exportación', Component: Reportes },
  { id: 'admin', label: 'Configuración', icon: 'settings', titulo: 'Administración', sub: 'Sucursales, áreas, puestos, turnos, feriados y permisos', Component: Administracion }
];

export const moduloPorId = (id) => MODULOS.find((m) => m.id === id) ?? MODULOS[0];
