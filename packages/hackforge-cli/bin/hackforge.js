#!/usr/bin/env node

try {
  // Attempt to load the bundled/compiled version first
  require('../dist/index.js');
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    try {
      // If bundled version not found, try to load the source directly
      // This allows development without rebuilding
      require('../src/index.js');
    } catch (innerError) {
      // If that fails too, try TypeScript source
      try {
        // Use ts-node to run the TypeScript source directly
        // This requires ts-node to be installed
        require('ts-node').register();
        require('../src/index.ts');
      } catch (tsError) {
        // If all attempts fail, show a helpful error
        console.error('\x1b[31mError: Could not load the Hackforge CLI.\x1b[0m');
        console.error('\x1b[33mPlease make sure the package is properly installed and built:\x1b[0m');
        console.error('  npm install -g hackforge-cli');
        console.error('  npm run build (in the package directory)');
        console.error('\nOriginal error:');
        console.error(error.message);
        process.exit(1);
      }
    }
  } else {
    // If it's some other error, show it
    console.error('\x1b[31mError running Hackforge CLI:\x1b[0m', error.message);
    process.exit(1);
  }
} 