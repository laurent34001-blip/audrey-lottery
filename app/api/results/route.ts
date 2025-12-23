import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { date, redGame, greenGame, blueGame } = await req.json()

    if (!date || !redGame || !greenGame || !blueGame) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if result already exists for this date
    const existingResult = await prisma.lotteryResult.findUnique({
      where: { date: new Date(date) }
    })

    if (existingResult) {
      // Update existing result
      const result = await prisma.lotteryResult.update({
        where: { date: new Date(date) },
        data: {
          redGame,
          greenGame,
          blueGame,
        }
      })

      return NextResponse.json(
        { message: "Result updated successfully", result },
        { status: 200 }
      )
    } else {
      // Create new result
      const result = await prisma.lotteryResult.create({
        data: {
          date: new Date(date),
          redGame,
          greenGame,
          blueGame,
        }
      })

      return NextResponse.json(
        { message: "Result added successfully", result },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error("Error adding result:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
