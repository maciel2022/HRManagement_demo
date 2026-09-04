// Catálogos genéricos, no específicos de la empresa demo.
// Todo lo que identifica a un cliente (sucursales, áreas, puestos, turnos,
// cursos, EPP, documentos, anuncios) vive en src/config/demo.config.js.

export const NOMBRES_M = ['Juan','Martín','Diego','Nicolás','Facundo','Leandro','Gonzalo','Matías','Sergio','Rubén','Cristian','Emiliano','Hernán','Pablo','Alejandro','Federico','Lucas','Damián','Walter','Iván','Ezequiel','Marcelo'];
export const NOMBRES_F = ['María','Sofía','Valeria','Carla','Romina','Lucía','Daniela','Agustina','Paula','Verónica','Micaela','Julieta','Natalia','Florencia','Gabriela','Andrea','Camila','Rocío','Belén','Silvina'];
export const APELLIDOS = ['Gómez','Fernández','Rodríguez','López','Martínez','Sosa','Quiroga','Benítez','Acosta','Molina','Cabrera','Ferreyra','Ojeda','Ibarra','Villalba','Peralta','Aguirre','Ramírez','Coronel','Medina','Godoy','Suárez','Vera','Escobar','Domínguez','Bustos','Silva','Núñez','Paz','Maldonado'];
export const CALLES = ['Av. Rivadavia','Calle 14','Av. Mitre','Los Álamos','San Martín','Belgrano','Alvear','Ruta 3'];
export const CONTRATOS = ['Tiempo indeterminado', 'Plazo fijo', 'Eventual', 'Pasantía'];

export const TIPOS_LICENCIA = [
  'Vacaciones', 'Enfermedad', 'Accidente', 'Licencia médica', 'Maternidad / paternidad',
  'Estudio / examen', 'Fallecimiento familiar', 'Mudanza', 'Licencia especial',
  'Ausencia justificada', 'Ausencia sin justificar'
];

export const ROLES = [
  { name: 'Recursos Humanos', data_scope: 'all', desc: 'Acceso a todo el personal de la red.' },
  { name: 'Administrador', data_scope: 'all', desc: 'Acceso total al sistema y a la configuración.' },
  { name: 'Gerencia', data_scope: 'all', desc: 'Vista consolidada, sin configuración del sistema.' },
  { name: 'Encargado de sucursal', data_scope: 'branch', desc: 'Solo su unidad asignada.' },
  { name: 'Supervisor', data_scope: 'team', desc: 'Solo los empleados de su turno.' },
  { name: 'Empleado', data_scope: 'self', desc: 'Solo su propia información y solicitudes.' }
];

// Feriados nacionales de Argentina 2026 (el aniversario de la empresa se agrega por perfil)
export const FERIADOS_NACIONALES = [
  ['2026-01-01', '01/01/2026', 'Año Nuevo'],
  ['2026-02-16', '16/02/2026', 'Carnaval'],
  ['2026-02-17', '17/02/2026', 'Carnaval'],
  ['2026-03-24', '24/03/2026', 'Día de la Memoria'],
  ['2026-04-02', '02/04/2026', 'Día del Veterano y de los Caídos en Malvinas'],
  ['2026-05-01', '01/05/2026', 'Día del Trabajador'],
  ['2026-05-25', '25/05/2026', 'Revolución de Mayo'],
  ['2026-06-20', '20/06/2026', 'Paso a la Inmortalidad de Belgrano'],
  ['2026-07-09', '09/07/2026', 'Día de la Independencia'],
  ['2026-08-17', '17/08/2026', 'Paso a la Inmortalidad de San Martín'],
  ['2026-10-12', '12/10/2026', 'Día del Respeto a la Diversidad Cultural'],
  ['2026-11-20', '20/11/2026', 'Día de la Soberanía Nacional'],
  ['2026-12-08', '08/12/2026', 'Inmaculada Concepción'],
  ['2026-12-25', '25/12/2026', 'Navidad']
];

// Usuarios de la demo (el nombre del primero se reemplaza por el usuario configurado)
export const USUARIOS = [
  ['Gustavo Molina', 'gustavo.molina', 'Administrador', null, 'Toda la red', 'Hoy 08:40'],
  ['Silvina Acosta', 'silvina.acosta', 'Gerencia', null, 'Toda la red', 'Ayer 19:05'],
  ['Rubén Quiroga', 'ruben.quiroga', 'Encargado de sucursal', 1, null, 'Hoy 06:03'],
  ['Carla Ibarra', 'carla.ibarra', 'Encargado de sucursal', 3, null, 'Hoy 05:58'],
  ['Damián Sosa', 'damian.sosa', 'Supervisor', 1, null, 'Hoy 22:10'],
  ['Romina Vera', 'romina.vera', 'Supervisor', 4, null, 'Ayer 14:02'],
  ['Nicolás Peralta', 'nicolas.peralta', 'Empleado', 2, 'Solo su legajo', 'Hoy 06:12']
];

export const HOY = { iso: '2026-09-03', label: '03/09/2026', largo: 'Jueves 03/09/2026 · 09:42' };
