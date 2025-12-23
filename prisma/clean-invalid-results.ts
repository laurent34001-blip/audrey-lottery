import { prisma } from "../lib/prisma"

async function cleanInvalidResults() {
  console.log("🧹 Cleaning invalid lottery results...")

  // Fetch all results
  const allResults = await prisma.lotteryResult.findMany()
  
  let deletedCount = 0
  
  for (const result of allResults) {
    const redValid = result.redGame.length === 6
    const blackValid = result.blackGame.length === 6
    const blueValid = result.blueGame.length === 6
    
    if (!redValid || !blackValid || !blueValid) {
      console.log(`🗑️  Deleting invalid result for ${result.date.toISOString().split('T')[0]}:`, {
        red: result.redGame,
        black: result.blackGame,
        blue: result.blueGame
      })
      
      await prisma.lotteryResult.delete({
        where: { id: result.id }
      })
      
      deletedCount++
    }
  }
  
  if (deletedCount === 0) {
    console.log("✅ No invalid results found!")
  } else {
    console.log(`\n✅ Deleted ${deletedCount} invalid result(s)!`)
  }
}

cleanInvalidResults()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
