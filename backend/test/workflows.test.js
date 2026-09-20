const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
require('../config/env');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const testDatabase = `edf_test_${process.pid}_${Date.now()}`;
const admin = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 5432), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: 'postgres' });
process.env.DB_NAME = testDatabase;
// No email is sent by integration tests, even if the developer has SMTP credentials.
process.env.GMAIL_APP_PASSWORD = '';
const pool = require('../config/db');
const migrate = require('../database/migrate');
const { syncMemberships } = require('../services/membershipService');
let server, base, tokens = {}, customerId;
const password = 'Test-only-123!';
const details = [{ texto:'Sentadilla', series:'3', repeticiones:'10', peso:'20 lb', descanso_segundos:60 }];
async function request(url, token, method = 'GET', body) {
  const response = await fetch(base + url, { method, headers: { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status:response.status, data:response.status===204 ? null : await response.json() };
}
async function login(email) {
  const r = await request('/auth/login', null, 'POST', {email,password});
  assert.equal(r.status,200,JSON.stringify(r.data));
  return r.data.token;
}
before(async () => {
  assert.match(testDatabase,/^edf_test_[0-9_]+$/);
  await admin.query(`CREATE DATABASE "${testDatabase}"`);
  await pool.query(await fs.readFile(path.join(__dirname,'../database/schema.sql'),'utf8'));
  await pool.query(await fs.readFile(path.join(__dirname,'../database/demo-data.sql'),'utf8'));
  await migrate(); await migrate();
  await pool.query('UPDATE usuarios SET password_hash=$1, debe_cambiar_password=false', [await bcrypt.hash(password,4)]);
  const app = require('../index');
  server = app.listen(0,'127.0.0.1');
  await new Promise(resolve => server.once('listening',resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
  tokens.admin = await login('admin@elderdragon.com');
  tokens.trainer = await login('entrenador.carlos@elderdragon.com');
  tokens.otherTrainer = await login('entrenador.ana@elderdragon.com');
  tokens.client = await login('jorge.lopez@gmail.com');
  tokens.reception = await login('recepcion1@elderdragon.com');
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await pool.end();
  if (/^edf_test_[0-9_]+$/.test(testDatabase)) await admin.query(`DROP DATABASE IF EXISTS "${testDatabase}"`);
  await admin.end();
});

test('authentication, role boundaries and real database health', async () => {
  assert.equal((await request('/health')).status,200);
  assert.equal((await request('/admin/dashboard')).status,401);
  assert.equal((await request('/admin/dashboard',tokens.trainer)).status,403);
  assert.equal((await request('/recepcion/clientes',tokens.client)).status,403);
  assert.equal((await request('/deportivo/clientes',tokens.trainer)).status,200);
  assert.equal((await request('/admin/dashboard',tokens.admin)).status,200);
  assert.equal((await request('/auth/login',null,'POST',{email:'admin@elderdragon.com',password:'123456'})).status,401);
});

test('client creation returns temporary credentials without SMTP and supports initial password change', async () => {
  const created = await request('/recepcion/clientes',tokens.reception,'POST',{nombre:'Prueba',apellido:'Renovación',email:'renewal@example.invalid',telefono:'70000000'});
  assert.equal(created.status,201,JSON.stringify(created.data));
  assert.ok(created.data.temporaryPassword);
  customerId = created.data.cliente.id_usuario;
  const initial = await request('/auth/login',null,'POST',{email:'renewal@example.invalid',password:created.data.temporaryPassword});
  assert.equal(initial.data.requirePasswordChange,true);
  const changed=await request('/auth/cambiar-password-inicial',null,'POST',{email:'renewal@example.invalid',tempPassword:created.data.temporaryPassword,newPassword:password});
  assert.equal(changed.status,200);
  tokens.newClient=changed.data.token;
});

test('payments preserve prepaid days, serialize concurrent renewals and deduplicate retries', async () => {
  const body={id_cliente:customerId,id_plan:3,monto:25,metodo_pago:'efectivo',idempotency_key:randomUUID()};
  const [a,b]=await Promise.all([request('/recepcion/pagos',tokens.reception,'POST',body),request('/recepcion/pagos',tokens.reception,'POST',body)]);
  assert.deepEqual([a.status,b.status].sort(),[200,201]);
  assert.equal(a.data.pago.id_pago,b.data.pago.id_pago);
  const second=await request('/recepcion/pagos',tokens.reception,'POST',{...body,idempotency_key:randomUUID()});
  assert.equal(second.status,201,JSON.stringify(second.data));
  assert.equal(second.data.membresia.fecha_inicio,a.data.membresia.fecha_fin);
  assert.equal((await request('/recepcion/pagos',tokens.reception,'POST',{...body,monto:1})).status,409);
  assert.equal((await request('/recepcion/pagos',tokens.reception,'POST',{...body,monto:-10,idempotency_key:randomUUID()})).status,400);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM membresias WHERE id_cliente=$1',[customerId])).rows[0].n,2);
  const preview=await request(`/recepcion/renovacion?id_cliente=${customerId}&id_plan=3`,tokens.reception);
  assert.equal(preview.data.fecha_inicio,second.data.membresia.fecha_fin.slice(0,10));
});

test('morosity reports ignore old expired memberships when the customer renewed', async () => {
  await pool.query(`INSERT INTO membresias(id_cliente,id_plan,fecha_inicio,fecha_fin,estado) VALUES($1,3,CURRENT_DATE-60,CURRENT_DATE-30,'Morosa')`,[customerId]);
  await syncMemberships();
  const report=await request('/admin/reportes?tipo=morosos',tokens.admin);
  assert.equal(report.status,200);
  assert.ok(!report.data.filas.some(r=>r.id===customerId));
  assert.equal(new Set(report.data.filas.map(r=>r.id)).size,report.data.filas.length);
  await pool.query("UPDATE membresias SET fecha_inicio=CURRENT_DATE-30,fecha_fin=CURRENT_DATE WHERE id_cliente=$1",[customerId]);
  await syncMemberships();
  assert.equal((await pool.query('SELECT estado FROM usuarios WHERE id_usuario=$1',[customerId])).rows[0].estado,'Moroso');
  const overdue=await request('/admin/reportes?tipo=morosos',tokens.admin);
  assert.equal(overdue.data.filas.filter(r=>r.id===customerId).length,1);
  assert.equal((await request('/admin/alertas',tokens.admin)).data.filter(r=>r.id_usuario===customerId).length,1);
  const fresh=await request('/admin/reportes?tipo=nuevos&desde=2000-01-01&hasta=2099-12-31',tokens.admin);
  assert.equal(fresh.status,200,JSON.stringify(fresh.data));
  assert.equal(fresh.data.filas.filter(r=>r.id===customerId).length,1);
  assert.ok(!fresh.data.filas.some(r=>r.id===7)); // Historical registration date is unknown.
});

test('catalog edits, personal assignments, isolated snapshots and progress ownership', async () => {
  const template={nombre:'Rutina test',grupo:'Pierna',nivel:'Principiante',duracion:30,calorias:100,detalles:details};
  assert.equal((await request('/deportivo/rutinas',tokens.trainer,'POST',{...template,detalles:[]})).status,400);
  assert.equal((await request('/deportivo/rutinas',tokens.trainer,'POST',template)).status,201);
  const catalog=await request('/deportivo/rutinas',tokens.trainer);
  const row=catalog.data.find(r=>r.nombre===template.nombre);
  assert.ok(row.id); assert.equal(row.detalles[0].descanso_segundos,60);
  const assigned=await request('/deportivo/asignaciones',tokens.trainer,'POST',{id_cliente:7,id_plantilla:row.id,nombre:'Personalizada',detalles:details,notas:'Técnica controlada'});
  assert.equal(assigned.status,201,JSON.stringify(assigned.data));
  const id=assigned.data.id_asignacion;
  assert.equal((await request(`/deportivo/rutinas/${row.id}`,tokens.admin,'PUT',{...template,nombre:'Plantilla cambiada',detalles:[{...details[0],peso:'40 lb'}]})).status,200);
  const mine=await request('/cliente/rutina',tokens.client);
  assert.equal(mine.data.nombre,'Personalizada');assert.equal(mine.data.detalles[0].peso,'20 lb');
  assert.equal((await request(`/deportivo/asignaciones/${id}/seguimiento`,tokens.otherTrainer,'POST',{observaciones:'Sin permiso'})).status,404);
  assert.equal((await request(`/cliente/asignaciones/${id}/seguimiento`,tokens.newClient)).status,404);
  assert.equal((await request(`/cliente/asignaciones/${id}/seguimiento`,tokens.client,'POST',{observaciones:'Entrenamiento completado',completada:true})).status,201);
  assert.equal((await request(`/deportivo/asignaciones/${id}/seguimiento`,tokens.trainer)).data.length,1);
  assert.equal((await request('/deportivo/asignaciones',tokens.trainer,'POST',{id_cliente:7,nombre:'Segunda',detalles:details})).status,201);
  assert.equal((await request(`/cliente/asignaciones/${id}/seguimiento`,tokens.client,'POST',{observaciones:'Archivada'})).status,409);
  assert.equal((await request(`/deportivo/rutinas/${row.id}`,tokens.admin,'DELETE')).status,204);
  assert.equal((await request(`/deportivo/asignaciones/${id}/seguimiento`,tokens.trainer)).data.length,1);
});

test('configuration persists, maintenance gates clients and deactivation revokes existing sessions',async()=>{
  const settings=(await request('/admin/configuracion',tokens.admin)).data.datos;
  assert.equal((await request('/admin/configuracion',tokens.reception)).status,403);
  assert.equal((await request('/admin/configuracion',tokens.admin,'PUT',{...settings,nombreLegal:'Gimnasio de prueba',modoMantenimiento:true})).status,200);
  assert.equal((await request('/admin/configuracion',tokens.admin)).data.datos.nombreLegal,'Gimnasio de prueba');
  assert.equal((await request('/cliente/perfil',tokens.client)).status,503);
  await request('/admin/configuracion',tokens.admin,'PUT',settings);
  assert.equal((await request('/recepcion/clientes/'+customerId,tokens.reception,'PUT',{estado:'Inactivo'})).status,200);
  assert.equal((await request('/cliente/perfil',tokens.newClient)).status,401);
  assert.equal((await request('/auth/login',null,'POST',{email:'renewal@example.invalid',password})).status,401);
  assert.equal((await request('/recepcion/clientes/'+customerId,tokens.reception,'DELETE')).status,409);
});

test('both registration routes deliver credentials and preserve created accounts when Gmail rejects authentication', async t => {
  const nodemailer = require('nodemailer');
  const emailKeys = ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'SMTP_FROM'];
  const original = Object.fromEntries(emailKeys.map(key => [key, process.env[key]]));
  process.env.GMAIL_USER = 'gym@example.invalid';
  process.env.GMAIL_APP_PASSWORD = 'test-only-password';
  process.env.SMTP_FROM = 'Gym <gym@example.invalid>';
  let smtpFails = false;
  let outgoing;
  t.mock.method(nodemailer, 'createTransport', () => ({
    sendMail: async message => {
      outgoing = message;
      if (smtpFails) throw Object.assign(new Error('Authentication rejected'), { code: 'EAUTH' });
      return { accepted: [message.to] };
    },
    close() {},
  }));
  try {
    for (const [route, token, label] of [['/admin/usuarios', tokens.admin, 'admin'], ['/recepcion/clientes', tokens.reception, 'reception']]) {
      for (const fails of [false, true]) {
        smtpFails = fails;
        const email = `${label}-${fails}@example.invalid`;
        const result = await request(route, token, 'POST', { nombre: 'Correo', apellido: 'Prueba', email, rol: 'Cliente' });
        assert.equal(result.status, 201);
        assert.equal(result.data.correoEnviado, !fails);
        assert.equal(outgoing.to, email);
        const saved = await pool.query('SELECT password_hash, debe_cambiar_password FROM usuarios WHERE email=$1', [email]);
        assert.equal(saved.rowCount, 1);
        assert.equal(saved.rows[0].debe_cambiar_password, true);
        if (fails) {
          assert.equal(result.data.correoError, 'EMAIL_AUTH');
          assert.ok(result.data.temporaryPassword);
          assert.match(result.data.message, /Gmail/);
          assert.ok(await bcrypt.compare(result.data.temporaryPassword, saved.rows[0].password_hash));
        } else {
          assert.equal(result.data.temporaryPassword, undefined);
          const emailedPassword = outgoing.text.match(/Contrasena temporal: ([^\n]+)/)[1];
          assert.ok(await bcrypt.compare(emailedPassword, saved.rows[0].password_hash));
        }
      }
    }
  } finally {
    for (const key of emailKeys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});

test('invalid inputs are rejected and administrator password changes revoke old tokens',async()=>{
  assert.equal((await request('/admin/planes',tokens.admin,'POST',{nombre_plan:'Inválido',precio:-1,duracion_dias:30})).status,400);
  assert.equal((await request('/recepcion/clientes',tokens.reception,'POST',{nombre:'Test',apellido:'Test',email:'incorrecto'})).status,400);
  assert.equal((await request('/admin/reportes?tipo=desconocido',tokens.admin)).status,400);
  assert.equal((await request('/admin/usuarios/1',tokens.admin,'PUT',{id_rol:4})).status,400);
  assert.equal((await request('/admin/password',tokens.admin,'PUT',{actual:password,nueva:'New-password-123!'})).status,200);
  assert.equal((await request('/admin/dashboard',tokens.admin)).status,401);
  assert.equal((await request('/auth/login',null,'POST',{email:'admin@elderdragon.com',password:'New-password-123!'})).status,200);
});
