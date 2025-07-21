#!/usr/bin/env node

process.env.NODE_OPTIONS = '--max-old-space-size=8192';
process.env.GENERATE_SOURCEMAP = 'false';

const { execSync } = require('child_process');

try {
  console.log('🔧 Installing dependencies...');
  execSync('yarn install --legacy-peer-deps', { 
    stdio: 'inherit', 
    cwd: __dirname 
  });
  
  console.log('🏗️ Building application...');
  execSync('yarn craco build', { 
    stdio: 'inherit', 
    cwd: __dirname 
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}