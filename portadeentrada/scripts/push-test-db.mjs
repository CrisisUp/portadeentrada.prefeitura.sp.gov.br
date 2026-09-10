import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// Set environment variables
process.env.DATABASE_URL = 'file:./prisma/prisma/test.db'
process.env.PRISMA_CLI_BINARY_TARGETS = 'windows'

console.log('DATABASE_URL:', process.env.DATABASE_URL)
console.log('PRISMA_CLI_BINARY_TARGETS:', process.env.PRISMA_CLI_BINARY_TARGETS)

// Run prisma generate
console.log('\n📦 Generating Prisma Client...')
const generateResult = spawnSync('npx', ['prisma', 'generate', '--schema=prisma/schema.test.prisma'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
  shell: true,
})

if (generateResult.status !== 0) {
  console.error('❌ Prisma generate failed')
  process.exit(1)
}

// Run prisma db push
console.log('\n🗄️  Pushing schema to SQLite...')
const pushResult = spawnSync('npx', ['prisma', 'db', 'push', '--schema=prisma/schema.test.prisma', '--force-reset', '--accept-data-loss'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
  shell: true,
})

if (pushResult.status !== 0) {
  console.error('❌ Prisma db push failed')
  process.exit(1)
}

console.log('\n✅ Test database ready!')