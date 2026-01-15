#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { engines } = require('../package.json');
const currentVersion = process.version;
const requiredVersion = engines.node;

const semverRegex = /^>=?(\d+)/;
const match = requiredVersion.match(semverRegex);

if (!match) {
  console.error(`❌ No se pudo parsear la versión requerida de Node: ${requiredVersion}`);
  process.exit(1);
}

const requiredMajor = parseInt(match[1], 10);
const currentMajor = parseInt(currentVersion.slice(1).split('.')[0], 10);

if (currentMajor < requiredMajor) {
  console.error('');
  console.error('❌ ERROR: Versión de Node.js incorrecta');
  console.error('');
  console.error(`   Versión actual:    ${currentVersion}`);
  console.error(`   Versión requerida: ${requiredVersion}`);
  console.error('');
  console.error('   Por favor, actualiza Node.js:');
  console.error('   - Usando nvm: nvm install 20 && nvm use 20');
  console.error('   - O desde: https://nodejs.org/');
  console.error('');
  process.exit(1);
}

console.log(`✅ Versión de Node.js correcta: ${currentVersion}`);
