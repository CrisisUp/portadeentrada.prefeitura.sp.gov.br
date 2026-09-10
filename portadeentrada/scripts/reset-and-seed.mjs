import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

console.log('🔄 Resetting database and seeding with known passwords...\n')

// Set environment variables
process.env.SEED_ADMIN_PASSWORD = 'admin123'
process.env.SEED_EDITOR_PASSWORD = 'admin123'
process.env.SEED_VIEWER_PASSWORD = 'admin123'
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/portadeentrada'

console.log('DATABASE_URL:', process.env.DATABASE_URL)
console.log('SEED_ADMIN_PASSWORD:', process.env.SEED_ADMIN_PASSWORD)
console.log('')

// Step 1: Prisma migrate reset --force
console.log('📦 Step 1: Prisma migrate reset --force')
let result = spawnSync('npx', ['prisma', 'migrate', 'reset', '--force'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
  shell: true,
})

if (result.status !== 0) {
  console.log('\n⚠️  Migrate reset failed, trying db push --force-reset...')
  result = spawnSync('npx', ['prisma', 'db', 'push', '--force-reset', '--accept-data-loss'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
    shell: true,
  })

  if (result.status !== 0) {
    console.error('\n❌ Database reset failed')
    process.exit(1)
  }
}

console.log('\n✅ Database schema reset complete')

// Step 2: Generate Prisma Client
console.log('\n📦 Step 2: Generating Prisma Client...')
result = spawnSync('npx', ['prisma', 'generate'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
  shell: true,
})

if (result.status !== 0) {
  console.error('\n❌ Prisma generate failed')
  process.exit(1)
}

console.log('\n✅ Prisma Client generated')

// Step 3: Run seed (use npm script which has proper escaping)
console.log('\n🌱 Step 3: Running seed...')
result = spawnSync('npm', ['run', 'db:seed'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
  shell: true,
  windowsHide: true,
})

if (result.status !== 0) {
  console.error('\n❌ Seed failed')
  process.exit(1)
}

console.log('\n✅ Seed complete!')
console.log('\n📋 Credenciais criadas:')
console.log('   admin@prefeitura.sp.gov.br / admin123')
console.log('   editor@prefeitura.sp.gov.br / admin123')
console.log('   viewer@prefeitura.sp.gov.br / admin123')
console.log('\n🎉 Pronto para login!')