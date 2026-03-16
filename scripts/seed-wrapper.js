const { execSync } = require('child_process');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env' });

// Run the seed script
execSync('tsx scripts/seed.ts', { 
  stdio: 'inherit',
  env: { ...process.env }
});
