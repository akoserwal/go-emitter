#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Simple cleanup script
 * Removes excessive config files that add no value
 */

const filesToRemove = [
  '.sonarcloud.properties',
  '.github/workflows/codeql.yml',
  '.github/workflows/security.yml',
  'jest.config.js',
  '.nvmrc',
];

const dirsToRemove = [
  '.husky',
];

console.log('🧹 Cleaning up excessive tooling...\n');

filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`Removed: ${file}`);
  }
});

dirsToRemove.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Removed: ${dir}/`);
  }
});

console.log('\n✅ Cleanup complete!');
console.log('Kept essential tools: ESLint, Prettier, TypeScript');
console.log('Removed: Over-engineering for a 600-line project');