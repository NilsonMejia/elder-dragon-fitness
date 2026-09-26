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
  // Keep the notification fixture independent of today's date.
  await pool.query("UPDATE membresias SET fecha_fin=CURRENT_DATE - 1 WHERE id_cliente=9");
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
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog', async dialog=>{errors.push('Unexpected native dialog: '+dialog.type());await dialog.dismiss();});
  const reports=path.resolve(__dirname,'../../.reports');
  await fs.mkdir(reports,{recursive:true});
  async function screenshot(options){
    await page.evaluate(()=>Promise.all(document.getAnimations().filter(animation=>animation.effect?.getTiming().iterations!==Infinity).map(animation=>animation.finished.catch(()=>{}))));
    await page.screenshot(options);
  }
  async function login(email,destination){
    await page.goto(origin+'/login');
    await page.locator('#email').fill(email);await page.locator('#password').fill('Browser-test-123!');
    await page.getByRole('button',{name:'Acceder al Sistema'}).click();
    await page.waitForURL(origin+destination);
  }
  async function notices(options={}) {
    const trigger=page.getByRole('button',{name:/^Notificaciones/});
    await trigger.waitFor();
    assert.equal(await trigger.count(),1,'Exactly one notification button per protected view');
    await trigger.click();
    const dialog=page.getByRole('dialog',{name:'Notificaciones',exact:true});
    await dialog.waitFor();
    await dialog.getByRole('status').waitFor({state:'detached'});
    assert.equal(await dialog.getByRole('alert').count(),0);
    if(options.empty) await dialog.getByText('No tienes avisos por ahora',{exact:true}).waitFor();
    if(options.message) await dialog.getByText(options.message,{exact:true}).waitFor();
    if(options.prefix){
      const hrefs=await dialog.getByRole('link').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
      assert.ok(hrefs.length>0);
      assert.ok(hrefs.every(href=>href.startsWith(options.prefix)),'Role-specific notification destinations');
    }
    return {trigger,dialog};
  }
  async function checkRoute(route,options={}){
    await page.goto(origin+route);
    const {dialog}=await notices(options);
    await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
    const sidebarClass=route.startsWith('/recepcion/')?'.recepcion-sidebar':'.admin-sidebar';
    assert.equal(await page.locator(sidebarClass+' .sidebar-brand').count(),1);
    const workspaceHeadingColors=await page.locator('.workspace-content h2').evaluateAll(headings=>headings.map(heading=>getComputedStyle(heading).color));
    assert.ok(workspaceHeadingColors.every(color=>color==='rgb(245, 247, 251)'),'Workspace headings must remain readable on dark cards');
  }
  async function mobile(name){
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),name+' must not overflow on mobile');
    await screenshot({path:path.join(reports,name+'-mobile.png'),fullPage:true});
    await page.setViewportSize({width:1440,height:1000});
  }
  await page.goto(origin+'/login');
  await page.locator('#email').fill('admin@elderdragon.com');
  await page.locator('#password').fill('Incorrect-password-123!');
  await page.getByRole('button',{name:'Acceder al Sistema'}).click();
  const loginError=page.locator('.notification-stack .notice-error');
  await loginError.getByText('Credenciales invalidas.',{exact:true}).waitFor();
  assert.equal(await loginError.getAttribute('role'),'alert');
  await screenshot({path:path.join(reports,'login-error-notification.png')});
  await loginError.getByRole('button',{name:/Cerrar notificaci/}).click();
  await loginError.waitFor({state:'detached'});
  console.log('OK: invalid login displays a dismissible error notification.');
  await login('admin@elderdragon.com','/admin/dashboard');
  await page.getByRole('heading',{name:'Panel de Control'}).waitFor();
  const sidebar=page.locator('.admin-sidebar');
  const adminLinks=await sidebar.getByRole('link').allTextContents();
  for(const label of ['Clientes','Pagos','Asignaciones']) assert.equal(await sidebar.getByRole('link',{name:label,exact:true}).count(),0);
  assert.equal(await sidebar.locator('.sidebar-brand').count(),1);
  await page.locator('.loader-container').waitFor({state:'detached'});
  const {trigger:membership,dialog:membershipDialog}=await notices({prefix:'/admin/'});
  const dialogBox=await membershipDialog.boundingBox();
  const viewport=page.viewportSize();
  assert.ok(dialogBox.width<=520,'Membership dialog should stay compact');
  assert.ok(Math.abs(dialogBox.x+dialogBox.width/2-viewport.width/2)<=2,'Membership dialog should be horizontally centered');
  assert.ok(Math.abs(dialogBox.y+dialogBox.height/2-viewport.height/2)<=2,'Membership dialog should be vertically centered');
  await screenshot({path:path.join(reports,'membership-dialog.png')});
  await page.keyboard.press('Escape');
  await membershipDialog.waitFor({state:'detached'});
  assert.ok(await membership.evaluate(element=>element===document.activeElement),'Escape should restore trigger focus');
  await sidebar.getByRole('link',{name:'Rutinas',exact:true}).click();
  await page.getByRole('heading',{name:'Cat\u00e1logo de Rutinas',exact:true}).waitFor();
  assert.deepEqual(await sidebar.getByRole('link').allTextContents(),adminLinks);
  assert.equal(await sidebar.locator('.sidebar-brand').count(),1);
  await page.setViewportSize({width:390,height:844});
  await screenshot({path:path.join(reports,'admin-catalog-mobile.png'),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Admin catalog must not overflow horizontally on mobile');
  await page.setViewportSize({width:1440,height:1000});
  for(const route of ['/recepcion/clientes','/recepcion/pagos','/entrenador']){
    await page.goto(origin+route);
    await page.waitForURL(origin+'/admin/dashboard');
    await page.getByRole('heading',{name:'Panel de Control'}).waitFor();
  }
  await page.goto(origin+'/admin/asignaciones');
  await page.waitForURL(origin+'/admin/rutinas');
  console.log('OK: admin navigation, role isolation, mobile catalog and accessible membership dialog.');
  for(const route of ['/admin/dashboard','/admin/usuarios','/admin/planes','/admin/reportes','/admin/configuracion','/admin/rutinas']) await checkRoute(route,{prefix:'/admin/'});
  await page.route('**/api/notificaciones',route=>route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'Error de prueba temporal'})}));
  await page.reload();
  await page.getByRole('button',{name:/^Notificaciones/}).click();
  const retryDialog=page.getByRole('dialog',{name:'Notificaciones',exact:true});
  await retryDialog.getByText('No se pudieron cargar las notificaciones.',{exact:true}).waitFor();
  await page.unroute('**/api/notificaciones');
  await retryDialog.getByRole('button',{name:'Reintentar',exact:true}).click();
  await retryDialog.getByRole('link').first().waitFor();
  assert.equal(await retryDialog.getByRole('alert').count(),0,'Retry must recover the notification feed');
  await page.keyboard.press('Escape');
  console.log('OK: notification error feedback and retry recovery.');
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
  await login('recepcion1@elderdragon.com','/recepcion/clientes');
  for(const route of ['/recepcion/pagos','/recepcion/clientes']) await checkRoute(route,{prefix:'/recepcion/'});
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
  await edited.getByRole('button',{name:'Eliminar',exact:true}).click();
  const confirmation=page.getByRole('dialog',{name:'Confirmar cambio',exact:true});
  await confirmation.getByRole('button',{name:'Cancelar',exact:true}).click();
  await confirmation.waitFor({state:'detached'});
  assert.equal(await edited.count(),1,'Cancel must preserve the client row');
  assert.equal((await pool.query('SELECT count(*)::int AS total FROM usuarios WHERE email=$1',['browser@example.invalid'])).rows[0].total,1,'Cancel must preserve the client in the database');
  await edited.getByRole('button',{name:'Eliminar',exact:true}).click();
  await confirmation.getByRole('button',{name:'Confirmar',exact:true}).click();
  await edited.waitFor({state:'detached'});
  console.log('OK: alta, credenciales temporales, edición y eliminación de clientes.');
  await login('entrenador.carlos@elderdragon.com','/entrenador');
  await checkRoute('/entrenador/catalogo',{empty:true});
  const trainerLinks=await sidebar.getByRole('link').allTextContents();
  await screenshot({path:path.join(reports,'trainer-catalog-desktop.png'),fullPage:true});
  await mobile('trainer-catalog');
  await checkRoute('/entrenador',{empty:true});
  assert.deepEqual(await sidebar.getByRole('link').allTextContents(),trainerLinks);
  assert.equal(await sidebar.getByRole('link',{name:'Usuarios',exact:true}).count(),0);
  await page.getByRole('heading',{name:'Rutinas y seguimiento',exact:true}).waitFor();
  await screenshot({path:path.join(reports,'trainer-assignments-desktop.png'),fullPage:true});
  await mobile('trainer-assignments');
  await page.getByLabel('Cliente',{exact:true}).selectOption('7');
  await page.getByLabel('Plantilla',{exact:true}).selectOption('1');
  await page.getByLabel('Nombre',{exact:true}).fill('Rutina desde navegador');
  await page.getByRole('button',{name:'Asignar rutina',exact:true}).click();
  await page.getByText('Rutina asignada. La anterior queda en el historial.').waitFor();
  await login('jorge.lopez@gmail.com','/cliente/perfil');
  await checkRoute('/cliente/perfil',{prefix:'/cliente/'});
  const clientLinks=await sidebar.getByRole('link').allTextContents();
  await mobile('client-profile');
  await checkRoute('/cliente/rutina',{message:'Rutina desde navegador',prefix:'/cliente/'});
  assert.deepEqual(await sidebar.getByRole('link').allTextContents(),clientLinks);
  assert.equal(await sidebar.getByRole('link',{name:'Usuarios',exact:true}).count(),0);
  await screenshot({path:path.join(reports,'client-routine-desktop.png'),fullPage:true});
  await mobile('client-routine');
  await page.setViewportSize({width:390,height:844});
  const clientNotice=await notices({message:'Rutina desde navegador',prefix:'/cliente/'});
  await screenshot({path:path.join(reports,'client-notifications-mobile.png'),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  await page.keyboard.press('Escape');await clientNotice.dialog.waitFor({state:'detached'});
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('heading',{name:'Rutina desde navegador',exact:true}).waitFor();
  await page.getByLabel('Observaciones',{exact:true}).fill('Seguimiento creado desde el navegador');
  await page.getByLabel('Sesión completada',{exact:true}).check();
  await page.getByRole('button',{name:'Guardar seguimiento'}).click();
  await page.getByText('Seguimiento creado desde el navegador',{exact:true}).waitFor();
  await login('entrenador.carlos@elderdragon.com','/entrenador');
  const progressNotice=await notices({message:'Rutina desde navegador: Seguimiento creado desde el navegador',prefix:'/entrenador'});
  await progressNotice.dialog.getByText(/^Progreso de Jorge/).waitFor();
  await screenshot({path:path.join(reports,'trainer-progress-notifications.png'),fullPage:true});
  await page.keyboard.press('Escape');
  console.log('OK: notifications on every protected route, role isolation, empty state, trainer progress and mobile layouts.');
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
