import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    },
  })

  console.log('Created admin user:', admin.email)

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: 'user',
    },
  })

  console.log('Created regular user:', user.email)

  // Create some sample lottery results
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    await prisma.lotteryResult.upsert({
      where: { date },
      update: {},
      create: {
        date,
        redGame: String(Math.floor(Math.random() * 100)).padStart(2, '0'),
        blueGame: String(Math.floor(Math.random() * 100)).padStart(2, '0'),
        blackGame: String(Math.floor(Math.random() * 100)).padStart(2, '0'),
      },
    })
  }

  console.log('Created 30 days of sample lottery results')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
