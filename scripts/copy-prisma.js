const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '..', 'node_modules', '.prisma', 'client');

if (!fs.existsSync(sourceDir)) {
  console.warn('[copy-prisma] Prisma client directory not found, skipping copy.');
  process.exit(0);
}

const destinations = [
  path.resolve(__dirname, '..', '.next', 'server', 'node_modules', '.prisma', 'client'),
  path.resolve(__dirname, '..', '.next', 'server', '.prisma', 'client'),
  path.resolve(__dirname, '..', '.next', 'server', 'app', '.prisma', 'client'),
];

const copyRecursive = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  const entries = fs.readdirSync(from, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(from, entry.name);
    const destPath = path.join(to, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

for (const destination of destinations) {
  try {
    copyRecursive(sourceDir, destination);
    console.log(`[copy-prisma] Copied Prisma client to ${destination}`);
  } catch (error) {
    console.warn(`[copy-prisma] Failed to copy Prisma client to ${destination}`, error);
  }
}


