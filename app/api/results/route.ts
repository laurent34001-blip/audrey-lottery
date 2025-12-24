import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const results = await prisma.lotteryResult.findMany({
      where: {
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { date, redGame, blueGame, blackGame } = await req.json()

    if (!date) {
      return NextResponse.json(
        { message: "Date is required" },
        { status: 400 }
      )
    }

    // Format games: pad incomplete numbers to 6 digits, keep existing if empty
    const formatGame = (input: string | undefined) => {
      if (!input || input.trim() === "") return null
      // Pad to make pairs of 2 digits, up to 6 digits total
      const cleaned = input.replace(/\D/g, "")
      return cleaned.padEnd(6, "0").slice(0, 6)
    }

    const newRedGame = formatGame(redGame)
    const newBlueGame = formatGame(blueGame)
    const newBlackGame = formatGame(blackGame)

    // Check if result already exists for this date
    const existingResult = await prisma.lotteryResult.findUnique({
      where: { date: new Date(date) }
    })

    if (existingResult) {
      // Merge: keep existing values if new ones are empty
      const result = await prisma.lotteryResult.update({
        where: { date: new Date(date) },
        data: {
          redGame: newRedGame || existingResult.redGame,
          blueGame: newBlueGame || existingResult.blueGame,
          blackGame: newBlackGame || existingResult.blackGame,
        }
      })
      return NextResponse.json(
        { message: "Result updated successfully", result },
        { status: 200 }
      )
    }

    // Create new result with available data
    const result = await prisma.lotteryResult.create({
      data: {
        date: new Date(date),
        redGame: newRedGame || "000000",
        blueGame: newBlueGame || "000000",
        blackGame: newBlackGame || "000000",
      }
    })

    return NextResponse.json(
      { message: "Result added successfully", result },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error adding result:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id, date, redGame, blueGame, blackGame } = await req.json()

    if (!id || !date || !redGame || !blueGame || !blackGame) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    const result = await prisma.lotteryResult.update({
      where: { id },
      data: {
        date: new Date(date),
        redGame,
        blueGame,
        blackGame,
      }
    })

    return NextResponse.json(
      { message: "Result updated successfully", result },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating result:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { message: "ID is required" },
        { status: 400 }
      )
    }

    await prisma.lotteryResult.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: "Result deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting result:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
