#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Define all directories to create
const directories = [
  // App pages
  'app/login',
  'app/signup',
  'app/requests',
  'app/student/dashboard',
  'app/student/create-request',
  'app/student/requests',
  'app/staff/dashboard',
  'app/staff/requests',
  'app/cellule/dashboard',
  'app/cellule/requests',
  // Components
  'components/shared',
  'components/tables',
  'components/ui',
  'components/forms',
  // Lib
  'lib',
  // Public assets
  'public/images',
];

// Define all files to create
const files = [
  // App pages
  'app/login/page.tsx',
  'app/signup/page.tsx',
  'app/requests/[id]/page.tsx',
  'app/student/dashboard/page.tsx',
  'app/student/create-request/page.tsx',
  'app/student/requests/page.tsx',
  'app/student/requests/[id]/page.tsx',
  'app/staff/dashboard/page.tsx',
  'app/staff/requests/page.tsx',
  'app/staff/requests/[id]/page.tsx',
  'app/cellule/dashboard/page.tsx',
  'app/cellule/requests/page.tsx',
  'app/cellule/requests/[id]/page.tsx',
  // Shared components
  'components/shared/navbar.tsx',
  'components/shared/sidebar.tsx',
  'components/shared/layout-wrapper.tsx',
  'components/shared/progress-map.tsx',
  'components/shared/timeline-popover.tsx',
  'components/shared/response-modal.tsx',
  // Table components
  'components/tables/data-table.tsx',
  'components/tables/columns.tsx',
  // Form components
  'components/forms/request-form.tsx',
  'components/forms/response-form.tsx',
  // Lib files
  'lib/api.ts',
  'lib/utils.ts',
  'lib/types.ts',
  'lib/pdf-export.ts',
  'lib/tanstack-table-utils.ts',
];

console.log('🚀 Setting up Request Management System structure...\n');

// Create directories
console.log('📁 Creating directories...');
directories.forEach((dir) => {
  const fullPath = path.join(rootDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`   ✓ ${dir}`);
  } else {
    console.log(`   - ${dir} (already exists)`);
  }
});

console.log('\n📄 Creating files...');
files.forEach((file) => {
  const fullPath = path.join(rootDir, file);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, '', 'utf8');
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   - ${file} (already exists)`);
  }
});

console.log('\n✅ Project structure created successfully!');
console.log('\n📋 Summary:');
console.log(`   - ${directories.length} directories created/verified`);
console.log(`   - ${files.length} files created/verified`);
console.log('\n🎉 Ready to start development!');
