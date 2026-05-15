/**
 * Docker entrypoint — genera config.json desde variables de entorno
 * y arranca el servidor.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const GOVERNANCE_PATH = path.join(__dirname, '..', 'acdp', 'governance.json');

// Generar config desde env vars si no existe o si ACDP_FORCE_CONFIG=1
if (!fs.existsSync(CONFIG_PATH) || process.env.ACDP_FORCE_CONFIG === '1') {
  const config = {
    port: parseInt(process.env.ACDP_PORT || '3100', 10),
    token: process.env.ACDP_TOKEN || crypto.randomBytes(16).toString('hex'),
    manual_approval_paths: (process.env.ACDP_APPROVAL_PATHS || '').split(',').filter(Boolean),
    default_ttl_minutes: parseInt(process.env.ACDP_TTL_MINUTES || '15', 10),
    pending_commit_timeout_minutes: parseInt(process.env.ACDP_COMMIT_TIMEOUT_MINUTES || '10', 10),
  };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf8');
  console.log(`[ACDP Entrypoint] Config generado en ${CONFIG_PATH} (port=${config.port})`);
}

// Actualizar governance.json si se pasan env vars
if (process.env.ACDP_OWNER) {
  let gov = {};
  try { gov = JSON.parse(fs.readFileSync(GOVERNANCE_PATH, 'utf8')); } catch {}
  gov.project = gov.project || {};
  gov.project.owner = process.env.ACDP_OWNER;
  if (process.env.ACDP_SUB_OWNER) gov.project.sub_owner = process.env.ACDP_SUB_OWNER;
  fs.writeFileSync(GOVERNANCE_PATH, JSON.stringify(gov, null, 2) + '\n', 'utf8');
}

// Arrancar el servidor
require('./index.js');
