const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const fs = require('node:fs/promises');
const path = require('node:path');
require('../config/env');
async function backup(){
  const directory=path.resolve(__dirname,'../backups');
  await fs.mkdir(directory,{recursive:true});
  const output=path.join(directory,`elder-dragon-${new Date().toISOString().replace(/[:.]/g,'-')}.sql`);
  const executable=process.env.PG_DUMP_PATH || (process.platform==='win32'?'C:/Program Files/PostgreSQL/18/bin/pg_dump.exe':'pg_dump');
  await promisify(execFile)(executable,['-w','-h',process.env.DB_HOST||'localhost','-p',process.env.DB_PORT||'5432','-U',process.env.DB_USER,'-d',process.env.DB_NAME,'--format=plain','--create','--no-owner','--no-privileges','--encoding=UTF8',`--file=${output}`],{windowsHide:true,env:{...process.env,PGPASSWORD:process.env.DB_PASSWORD}});
  console.log(`Respaldo creado: ${output}`);
}
backup().catch(error=>{console.error(error.message);process.exitCode=1;});
