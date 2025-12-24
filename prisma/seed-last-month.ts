import { prisma } from "../lib/prisma"

function generateRandomNumber(): string {
  return String(Math.floor(Math.random() * 100)).padStart(2, "0")
}

function generateGameNumbers(): string {
  return `${generateRandomNumber()}${generateRandomNumber()}${generateRandomNumber()}`
}

async function seedLastMonth() {
  console.log("🎲 Generating lottery results for last month...")

  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

  const daysInLastMonth = lastMonthEnd.getDate()

  for (let day = 1; day <= daysInLastMonth; day++) {
    const date = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), day)

    try {
      const result = await prisma.lotteryResult.upsert({
        where: { date },
        update: {
          redGame: generateGameNumbers(),
          blueGame: generateGameNumbers(),
          blackGame: generateGameNumbers(),
        },
        create: {
          date,
          redGame: generateGameNumbers(),
          blueGame: generateGameNumbers(),
          blackGame: generateGameNumbers(),
        },
      })

      console.log(`✅ ${date.toISOString().split('T')[0]}: Red=${result.redGame}, Blue=${result.blueGame}, Black=${result.blackGame}`)
    } catch (error) {
      console.error(`❌ Error for ${date.toISOString().split('T')[0]}:`, error)
    }
  }

  console.log(`\n🎉 Successfully generated ${daysInLastMonth} lottery results!`)
}

seedLastMonth()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
