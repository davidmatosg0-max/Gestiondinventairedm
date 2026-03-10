/**
 * Script para generar el archivo version.json con timestamp del build
 * Se ejecuta antes de cada build
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildTime = new Date().getTime().toString();
const buildDate = new Date().toISOString();
const version = '5.0.0';

const versionData = {
  version,
  buildTime,
  buildDate,
  timestamp: buildTime
};

const outputPath = join(__dirname, '../public/version.json');

writeFileSync(outputPath, JSON.stringify(versionData, null, 2));

console.log('✅ version.json generado:');
console.log('   Versión:', version);
console.log('   Build Time:', buildTime);
console.log('   Build Date:', buildDate);
console.log('   Ruta:', outputPath);
