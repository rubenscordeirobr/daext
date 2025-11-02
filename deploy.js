#!/usr/bin/env node

/**
 * Deployment helper script for different hosting scenarios
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const deploymentTypes = {
  'root': {
    description: 'Root domain (https://yourdomain.com)',
    command: 'npm run build',
    basePath: '/'
  },
  'relative': {
    description: 'Relative paths (CDN, file system)',
    command: 'npm run build:relative',
    basePath: './'
  },
  'subdirectory': {
    description: 'Subdirectory (https://yourdomain.com/daext/)',
    command: 'npm run build:subdirectory',
    basePath: '/daext/'
  },
  'github-pages': {
    description: 'GitHub Pages deployment',
    command: 'npm run build:github-pages',
    basePath: '/daext/'
  }
};

function showHelp() {
  console.log('🚀 DAEx Deployment Helper\n');
  console.log('Usage: node deploy.js [type]\n');
  console.log('Available deployment types:');
  
  Object.entries(deploymentTypes).forEach(([type, config]) => {
    console.log(`  ${type.padEnd(15)} - ${config.description}`);
  });
  
  console.log('\nExample:');
  console.log('  node deploy.js relative');
  console.log('  node deploy.js github-pages');
}

function deploy(type) {
  const config = deploymentTypes[type];
  
  if (!config) {
    console.error(`❌ Unknown deployment type: ${type}`);
    showHelp();
    process.exit(1);
  }
  
  console.log(`🚀 Building for: ${config.description}`);
  console.log(`📁 Base path: ${config.basePath}`);
  console.log(`⚡ Command: ${config.command}\n`);
  
  try {
    execSync(config.command, { stdio: 'inherit' });
    
    console.log('\n✅ Build completed successfully!');
    console.log('📦 Output directory: out/');
    
    // Show next steps
    console.log('\n📋 Next steps:');
    switch (type) {
      case 'github-pages':
        console.log('  1. Push your code to GitHub');
        console.log('  2. Enable GitHub Pages in repository settings');
        console.log('  3. Deploy the out/ directory');
        break;
      case 'relative':
        console.log('  1. Upload the out/ directory to your hosting provider');
        console.log('  2. The app will work from any location');
        break;
      case 'subdirectory':
        console.log('  1. Upload the out/ directory to /daext/ on your server');
        console.log('  2. Configure your web server to serve from the subdirectory');
        break;
      default:
        console.log('  1. Upload the out/ directory to your web server root');
        console.log('  2. Configure your web server to serve the files');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Main execution
const type = process.argv[2];

if (!type) {
  showHelp();
  process.exit(0);
}

deploy(type);