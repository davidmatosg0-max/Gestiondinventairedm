#!/usr/bin/env node

/**
 * Script de Actualización Automática de Versión
 * 
 * Este script se ejecuta automáticamente antes de cada build/deploy y:
 * 1. Incrementa el buildNumber
 * 2. Actualiza la releaseDate al día actual
 * 3. Marca automáticamente el sistema para actualización
 * 
 * Uso: node scripts/update-version.js [patch|minor|major]
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, '../src/app/version.ts');

// Leer archivo actual
const content = fs.readFileSync(VERSION_FILE, 'utf-8');

// Obtener fecha actual en formato YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

// Extraer versión actual
const versionMatch = content.match(/version:\s*'(\d+)\.(\d+)\.(\d+)'/);
const buildMatch = content.match(/buildNumber:\s*(\d+)/);
const releaseDateMatch = content.match(/releaseDate:\s*'([^']+)'/);

if (!versionMatch || !buildMatch || !releaseDateMatch) {
  console.error('❌ Error: No se pudo extraer la información de versión');
  process.exit(1);
}

let [_, major, minor, patch] = versionMatch.map(Number);
let buildNumber = parseInt(buildMatch[1]);
const currentDate = releaseDateMatch[1];

// Determinar tipo de actualización
const updateType = process.argv[2] || 'auto';

// Si la fecha cambió, es una nueva versión
if (currentDate !== today) {
  console.log('📅 Nueva fecha detectada - Incrementando versión...');
  
  switch (updateType) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
    case 'auto':
    default:
      patch++;
      break;
  }
  
  buildNumber++;
}

// Crear nueva versión
const newVersion = `${major}.${minor}.${patch}`;

console.log('🔄 Actualizando versión...');
console.log(`   Versión anterior: ${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}`);
console.log(`   Nueva versión: ${newVersion}`);
console.log(`   Build: ${buildNumber}`);
console.log(`   Fecha: ${today}`);

// Actualizar contenido
let newContent = content;

// Actualizar version
newContent = newContent.replace(
  /version:\s*'[^']+'/,
  `version: '${newVersion}'`
);

// Actualizar releaseDate
newContent = newContent.replace(
  /releaseDate:\s*'[^']+'/,
  `releaseDate: '${today}'`
);

// Actualizar buildNumber
newContent = newContent.replace(
  /buildNumber:\s*\d+/,
  `buildNumber: ${buildNumber}`
);

// También actualizar la primera versión en RELEASE_NOTES si existe
newContent = newContent.replace(
  /(RELEASE_NOTES:\s*ReleaseNote\[\]\s*=\s*\[\s*{[\s\S]*?version:\s*)'[^']+'/,
  `$1'${newVersion}'`
);

newContent = newContent.replace(
  /(RELEASE_NOTES:\s*ReleaseNote\[\]\s*=\s*\[\s*{[\s\S]*?date:\s*)'[^']+'/,
  `$1'${today}'`
);

// Guardar archivo actualizado
fs.writeFileSync(VERSION_FILE, newContent, 'utf-8');

console.log('✅ Versión actualizada exitosamente');
console.log('');
console.log('💡 Recuerda actualizar RELEASE_NOTES en version.ts con los cambios de esta versión');
console.log('');

// Crear un archivo de timestamp para marcar la actualización
const timestampFile = path.join(__dirname, '../.last-update');
fs.writeFileSync(timestampFile, new Date().toISOString(), 'utf-8');

process.exit(0);
