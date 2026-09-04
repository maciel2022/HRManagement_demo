// Cliente de datos de la demo. HOY: lee el dataset en memoria del perfil activo.
// MAÑANA (producción, otro repositorio): reemplazar `request` por fetch a la API.
//
//   const API_URL = import.meta.env.VITE_API_URL ?? '/api';
//   export async function request(path, { method = 'GET', body, params } = {}) {
//     const qs = params ? '?' + new URLSearchParams(params) : '';
//     const res = await fetch(API_URL + path + qs, {
//       method,
//       headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
//       credentials: 'include',
//       body: body ? JSON.stringify(body) : undefined
//     });
//     if (!res.ok) throw new Error('HTTP ' + res.status);
//     return res.json();
//   }

import { getDb } from '@/data/database';

const LATENCIA_MS = 0; // subir a ~250 para simular red durante una demo en vivo

export function resolve(data) {
  if (!LATENCIA_MS) return Promise.resolve(data);
  return new Promise((r) => setTimeout(() => r(data), LATENCIA_MS));
}

export function tabla(nombre) {
  return getDb()[nombre] ?? [];
}

export function conteos() {
  const db = getDb();
  return Object.fromEntries(Object.keys(db).map((k) => [k, Array.isArray(db[k]) ? db[k].length : 0]));
}

let auditSeq = 0;

// Registro de operaciones: toda mutación pasa por acá (equivale a la tabla audit_log).
export function audit(op, entity, ref, detail, user, rol) {
  const db = getDb();
  auditSeq += 1;
  const entry = {
    id: auditSeq,
    at: '03/09/2026 ' + String(9 + (auditSeq % 8)).padStart(2, '0') + ':' + String((12 + auditSeq * 3) % 60).padStart(2, '0'),
    op, entity, ref, detail, user, rol
  };
  db.audit_log = [entry, ...db.audit_log];
  return entry;
}

export function auditLog() {
  return getDb().audit_log;
}
