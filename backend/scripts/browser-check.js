const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
require('../config/env');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { chromium } = require('playwright');
const dbName = `edf_test_${process.pid}_${Date.now()}`;
const admin = new Pool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||5432),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:'postgres'});
process.env.DB_NAME=dbName;
process.env.GMAIL_APP_PASSWORD='';
const pool=require('../config/db');
let server,vite,browser;

async function run(){
  await admin.query(`CREATE DATABASE "${dbName}"`);
  await pool.query(await fs.readFile(path.join(__dirname,'../database/schema.sql'),'utf8'));
  await pool.query(await fs.readFile(path.join(__dirname,'../database/demo-data.sql'),'utf8'));
  await require('../database/migrate')();
  await pool.query('UPDATE usuarios SET password_hash=$1,debe_cambiar_password=false',[await bcrypt.hash('Browser-test-123!',4)]);
  // Ensure the current report has data regardless of when this test is executed.
  await pool.query('UPDATE pagos SET fecha_pago=CURRENT_TIMESTAMP');
  server=require('../index').listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  process.env.VITE_API_URL=`http://127.0.0.1:${server.address().port}/api`;
  const frontend=path.resolve(__dirname,'../../frontend');
  const {createServer}=await import(pathToFileURL(path.join(frontend,'node_modules/vite/dist/node/index.js')).href);
  vite=await createServer({root:frontend,server:{host:'127.0.0.1',port:0},logLevel:'error'});
  await vite.listen();
  const origin=`http://127.0.0.1:${vite.httpServer.address().port}`;
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:process.platform==='win32'?{channel:'msedge'}:{})});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  async function login(email,destination){
    await page.goto(origin+'/login');
    await page.locator('#email').fill(email);await page.locator('#password').fill('Browser-test-123!');
    await page.getByRole('button',{name:'Acceder al Sistema'}).click();
    await page.waitForURL(origin+destination);
  }
  await login('admin@elderdragon.com','/admin/dashboard');
  await page.getByRole('heading',{name:'Panel de Control'}).waitFor();
  await page.goto(origin+'/admin/reportes');
  const excel=page.getByRole('button',{name:'Exportar Excel'});
  await excel.waitFor();
  for(const [button,extension,signature] of [[excel,'.xlsx','PK'],[page.getByRole('button',{name:'Generar PDF'}),'.pdf','%PDF']]){
    const downloadPromise=page.waitForEvent('download');await button.click();const download=await downloadPromise;
    assert.ok(download.suggestedFilename().endsWith(extension));
    const content=await fs.readFile(await download.path());assert.equal(content.subarray(0,signature.length).toString(),signature);
  }
  console.log('OK: descargas XLSX y PDF verificadas.');
  await page.goto(origin+'/admin/configuracion');
  await page.getByLabel('Nombre del gimnasio').fill('Gimnasio persistente');
  await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();
  await page.getByText('Configuración guardada.',{exact:true}).waitFor();await page.reload();
  assert.equal(await page.getByLabel('Nombre del gimnasio').inputValue(),'Gimnasio persistente');
  await page.goto(origin+'/recepcion/clientes');
  await page.getByRole('button',{name:'Nuevo Cliente'}).click();
  await page.getByLabel('Nombre',{exact:true}).fill('Cliente navegador');
  await page.getByLabel('Apellido',{exact:true}).fill('Temporal');
  await page.getByLabel('Correo Electrónico',{exact:true}).fill('browser@example.invalid');
  await page.getByRole('button',{name:'Guardar Cliente'}).click();
  await page.getByText(/Contraseña temporal para browser@example.invalid/).waitFor();
  const clientRow=page.getByRole('row').filter({hasText:'Cliente navegador Temporal'});
  await clientRow.getByRole('button',{name:'Editar',exact:true}).click();
  await page.getByLabel('Nombre',{exact:true}).fill('Cliente editado');
  await page.getByRole('button',{name:'Guardar Cliente'}).click();
  const edited=page.getByRole('row').filter({hasText:'Cliente editado Temporal'});
  await edited.waitFor();
  page.once('dialog',dialog=>dialog.accept());
  await edited.getByRole('button',{name:'Eliminar',exact:true}).click();
  await edited.waitFor({state:'detached'});
  console.log('OK: alta, credenciales temporales, edición y eliminación de clientes.');
  await login('entrenador.carlos@elderdragon.com','/entrenador');
  await page.getByRole('heading',{name:'Rutinas y seguimiento',exact:true}).waitFor();
  await page.getByLabel('Cliente',{exact:true}).selectOption('7');
  await page.getByLabel('Plantilla',{exact:true}).selectOption('1');
  await page.getByLabel('Nombre',{exact:true}).fill('Rutina desde navegador');
  await page.getByRole('button',{name:'Asignar rutina',exact:true}).click();
  await page.getByText('Rutina asignada. La anterior queda en el historial.').waitFor();
  await login('jorge.lopez@gmail.com','/cliente/perfil');
  await page.goto(origin+'/cliente/rutina');
  await page.getByRole('heading',{name:'Rutina desde navegador',exact:true}).waitFor();
  await page.getByLabel('Observaciones',{exact:true}).fill('Seguimiento creado desde el navegador');
  await page.getByLabel('Sesión completada',{exact:true}).check();
  await page.getByRole('button',{name:'Guardar seguimiento'}).click();
  await page.getByText('Seguimiento creado desde el navegador',{exact:true}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('OK: configuración persistente, acceso de entrenador, asignación y seguimiento del cliente.');
}
run().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  if(browser)await browser.close();if(vite)await vite.close();
  if(server)await new Promise(r=>server.close(r));
  await pool.end();
  if(/^edf_test_[0-9_]+$/.test(dbName))await admin.query(`DROP DATABASE IF EXISTS "${dbName}"`);
  await admin.end();
});
