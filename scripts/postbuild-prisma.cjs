const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
const prismaClientDir = path.join(projectRoot, 'node_modules', '.prisma', 'client')

if (!fs.existsSync(prismaClientDir)) {
  console.warn('[postbuild-prisma] Prisma client directory not found, skipping copy.')
  process.exit(0)
}

const ensureLinuxBinary = (dir) => {
  const libName = 'libquery_engine-rhel-openssl-3.0.x.so.node'
  const libPath = path.join(dir, libName)
  if (fs.existsSync(libPath)) {
    return
  }

  const fallbackName = 'query-engine-rhel-openssl-3.0.x'
  const fallbackPath = path.join(dir, fallbackName)
  if (fs.existsSync(fallbackPath)) {
    try {
      fs.copyFileSync(fallbackPath, libPath)
      console.log(`[postbuild-prisma] Created missing ${libName} from ${fallbackName}`)
    } catch (error) {
      console.warn(`[postbuild-prisma] Failed to create ${libName}`, error)
    }
  }
}

const copyRecursive = (from, to) => {
  fs.mkdirSync(to, { recursive: true })
  const entries = fs.readdirSync(from, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(from, entry.name)
    const destPath = path.join(to, entry.name)

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

ensureLinuxBinary(prismaClientDir)

const destinations = [
  path.join(projectRoot, '.next', 'server', '.prisma', 'client'),
  path.join(projectRoot, '.next', 'server', 'app', '.prisma', 'client'),
  path.join(projectRoot, '.next', 'server', 'node_modules', '.prisma', 'client'),
]

for (const destination of destinations) {
  try {
    copyRecursive(prismaClientDir, destination)
    ensureLinuxBinary(destination)
    console.log(`[postbuild-prisma] Copied Prisma client to ${destination}`)
  } catch (error) {
    console.warn(`[postbuild-prisma] Failed to copy Prisma client to ${destination}`, error)
  }
}


